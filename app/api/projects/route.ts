import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function GET() {
    const supabase = await createClient();

    // Check authentication
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's projects
    const { data: projects, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(projects);
}

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check authentication
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string") {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }



    // Create project (uses regular client with RLS)
    const { data: project, error } = await supabase
        .from("projects")
        .insert({
            user_id: user.id,
            name: name.trim(),
            description: description?.trim() || null,
        })
        .select()
        .single();

    if (error) {
        console.error("Failed to create project:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(project, { status: 201 });
}
