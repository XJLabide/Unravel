import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { deleteDocument as deleteLlamaDocument } from "@/lib/llama/client";

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ documentId: string }> }
) {
    const supabase = await createClient();
    const { documentId } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get document and verify ownership
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
        // Extract file path from URL
        const fileUrl = document.file_url as string;
        const filePathMatch = fileUrl.match(/\/storage\/v1\/object\/public\/documents\/(.+)$/);

        if (filePathMatch) {
            const filePath = decodeURIComponent(filePathMatch[1]);

            // Delete from Supabase Storage using service client
            const serviceClient = await createServiceClient();
            const { error: storageError } = await serviceClient.storage
                .from("documents")
                .remove([filePath]);

            if (storageError) {
                console.error("Storage deletion error:", storageError);
                // Continue anyway - the DB record should still be deleted
            }
        }

        // Delete document record from database
        const { error: deleteError } = await supabase
            .from("documents")
            .delete()
            .eq("id", documentId);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        // Delete from LlamaCloud index
        const projectId = document.project_id as string;
        const llamaFileId = document.llama_file_id as string | null;
        if (llamaFileId) {
            try {
                await deleteLlamaDocument(llamaFileId, projectId);
                console.log("Deleted document from LlamaCloud index:", llamaFileId);
            } catch (llamaError) {
                console.error("Failed to delete from LlamaCloud (continuing anyway):", llamaError);
                // Continue - DB record is already deleted
            }
        }

        // Decrement document count (optional - may fail if RPC doesn't exist)
        try {
            await supabase.rpc("decrement_document_count" as never, { project_id: projectId } as never);
        } catch {
            // Ignore if RPC doesn't exist
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete document error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to delete document" },
            { status: 500 }
        );
    }
}
