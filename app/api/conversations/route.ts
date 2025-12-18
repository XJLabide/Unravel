import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

    if (projectId) {
        query = query.eq("project_id", projectId);
    }

    const { data: conversations, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(conversations);
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("id");

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!conversationId) {
        return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
    }

    const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId)
        .eq("user_id", user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
