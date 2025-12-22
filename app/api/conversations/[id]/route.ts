import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify conversation ownership
    const { data: conversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Get messages
    const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Parse sources JSON string to array
    const parsedMessages = messages?.map(msg => ({
        ...msg,
        sources: typeof msg.sources === 'string' ? JSON.parse(msg.sources) : msg.sources || []
    })) || [];

    return NextResponse.json(parsedMessages);
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify conversation ownership
    const { data: conversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title } = body;

    // Update conversation
    const { data: updated, error } = await supabase
        .from("conversations")
        .update({ title: title?.trim() || "New Conversation" })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updated);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify conversation ownership
    const { data: conversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

    if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Delete conversation (messages cascade delete usually, but we can be safe)
    const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
