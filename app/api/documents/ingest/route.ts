import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { parseAndIndexDocument } from "@/lib/llama/client";

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await request.json();

    if (!documentId) {
        return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    // Get document
    const { data: document, error: docError } = await supabase
        .from("documents")
        .select("*")
        .eq("id", documentId)
        .eq("user_id", user.id)
        .single();

    if (docError || !document) {
        return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    try {
        // Update status to processing
        await supabase
            .from("documents")
            .update({ status: "processing" } as { status: string })
            .eq("id", documentId);

        // Fetch the file from storage
        const serviceClient = await createServiceClient();
        const fileUrl = document.file_url as string;
        const filePathMatch = fileUrl.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);

        if (!filePathMatch) {
            throw new Error("Invalid file URL");
        }

        const filePath = decodeURIComponent(filePathMatch[1]);
        const { data: fileData, error: downloadError } = await serviceClient.storage
            .from("documents")
            .download(filePath);

        if (downloadError || !fileData) {
            throw new Error("Failed to download file");
        }

        // Parse and index the document using the new SDK-based function
        const projectId = document.project_id as string;
        const fileName = document.file_name as string;

        const result = await parseAndIndexDocument(
            fileData,
            fileName,
            projectId,
            {
                document_id: documentId,
                user_id: user.id,
            }
        );

        // Update document as ready with the generated document ID
        await supabase
            .from("documents")
            .update({
                status: "ready",
                llama_file_id: result.documentId,
            } as { status: string; llama_file_id: string })
            .eq("id", documentId);

        return NextResponse.json({
            success: true,
            documentId,
            llamaFileId: result.documentId,
            chunksProcessed: result.chunksProcessed,
        });
    } catch (error) {
        console.error("Ingestion error:", error);

        // Update document status to error
        await supabase
            .from("documents")
            .update({
                status: "error",
                error_message: error instanceof Error ? error.message : "Unknown error",
            } as { status: string; error_message: string })
            .eq("id", documentId);

        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Ingestion failed" },
            { status: 500 }
        );
    }
}
