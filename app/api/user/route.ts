import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (profileError) {
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        return NextResponse.json({
            data: {
                // auth.users fields
                id: user.id,
                email: user.email,
                phone: user.phone,
                created_at: user.created_at,
                last_sign_in_at: user.last_sign_in_at,
                email_confirmed_at: user.email_confirmed_at,
                user_metadata: user.user_metadata,
                // profiles fields (all columns)
                ...profile,
            }
        }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}