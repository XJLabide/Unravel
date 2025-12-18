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

    // Verify project ownership
    const { count: projectCount } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("id", id)
        .eq("user_id", user.id);

    if (projectCount === 0) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Fetch conversations
    const { data: conversations, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("project_id", id)
        .order("updated_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(conversations);
}
