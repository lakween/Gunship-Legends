// app/api/game/submit-score/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const score = Number(body.score);

        if (!Number.isInteger(score) || score < 0) {
            return NextResponse.json({ error: "Invalid score" }, { status: 400 });
        }

        const { error } = await supabase.rpc("submit_score", { p_score: score });
        if (error) {
            console.error("submit_score RPC error:", error);
            return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("best_score, total_plays, latest_score, league")
            .eq("id", user.id)
            .single();

        return NextResponse.json({
            message: "Score saved",
            score,
            profile,
        }, { status: 200 });

    } catch (err) {
        console.error("submit-score error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}