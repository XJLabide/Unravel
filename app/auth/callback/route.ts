import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {

            const { data: { user } } = await supabase.auth.getUser();
            if (user && user.email) {
                await supabase.from("users").upsert(
                    { id: user.id, email: user.email } as { id: string; email: string },
                    { onConflict: "id" }
                );
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
