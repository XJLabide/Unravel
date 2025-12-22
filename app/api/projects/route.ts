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
    try {
        const supabase = await createClient();

        // Check authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        console.log("[Projects API] Auth check:", { userId: user?.id, authError: authError?.message });

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, description } = body;

        if (!name || typeof name !== "string") {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        console.log("[Projects API] Creating project:", { name, userId: user.id });

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
            console.error("[Projects API] Failed to create project:", error);
            return NextResponse.json({ error: error.message || "Database error" }, { status: 500 });
        }

        console.log("[Projects API] Project created successfully:", project?.id);
        return NextResponse.json(project, { status: 201 });
    } catch (err) {
        console.error("[Projects API] Unexpected error:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
    }
}
