import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getFileExtension, formatFileSize } from "@/lib/utils";

const ALLOWED_EXTENSIONS = ["pdf", "docx", "doc", "xlsx", "xls", "csv", "txt", "md", "json"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!projectId) {
        return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    // Verify project ownership
    const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Validate file
    const extension = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return NextResponse.json(
            { error: `File type not supported. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}` },
            { status: 400 }
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
            { error: `File too large. Maximum size: ${formatFileSize(MAX_FILE_SIZE)}` },
            { status: 400 }
        );
    }

    // Generate unique file path
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const filePath = `${user.id}/${projectId}/${fileName}`;

    // Use service client for storage operations
    const serviceClient = await createServiceClient();

    // Upload to Supabase Storage
    const { error: uploadError } = await serviceClient.storage
        .from("documents")
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
        });

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = serviceClient.storage
        .from("documents")
        .getPublicUrl(filePath);

    // Create document record
    const { data: document, error: dbError } = await supabase
        .from("documents")
        .insert({
            project_id: projectId,
            user_id: user.id,
            file_name: file.name,
            file_type: extension,
            file_size: file.size,
            file_url: urlData.publicUrl,
            status: "uploading",
        } as {
            project_id: string;
            user_id: string;
            file_name: string;
            file_type: string;
            file_size: number;
            file_url: string;
            status: string;
        })
        .select()
        .single();

    if (dbError) {
        // Clean up uploaded file
        await serviceClient.storage.from("documents").remove([filePath]);
        return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Update document count - using raw RPC since the function may not be typed
    await supabase.rpc("increment_document_count" as never, { project_id: projectId } as never);

    return NextResponse.json(document, { status: 201 });
}
