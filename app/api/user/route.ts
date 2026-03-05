// app/api/user/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_FIELDS = ["display_name", "first_name", "last_name", "avatar_url"];

export async function GET() {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data, error } = await supabase
            .from("profiles")
            .select("id, first_name, last_name, display_name, avatar_url, best_score, total_plays, latest_score, league, updated_at")
            .eq("id", user.id)
            .single();

        if (error) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json(data, { status: 200 });

    } catch (err) {
        console.error("GET /api/user error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { key, value } = body;

        // Only allow safe fields to be updated
        if (!key || !ALLOWED_FIELDS.includes(key)) {
            return NextResponse.json({ error: `Field "${key}" cannot be updated` }, { status: 400 });
        }

        if (typeof value !== "string" || value.trim().length === 0) {
            return NextResponse.json({ error: "Value cannot be empty" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("profiles")
            .update({ [key]: value.trim(), updated_at: new Date().toISOString() })
            .eq("id", user.id)
            .select("id, first_name, last_name, display_name, avatar_url, best_score, total_plays, latest_score, league")
            .single();

        if (error) {
            return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });

    } catch (err) {
        console.error("PUT /api/user error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}