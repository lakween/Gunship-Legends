// app/api/game/leaderboard/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";  

export async function GET() {
  try {
    const supabase = await createClient();

    // ── Auth check ──────────────────────────────────────────────────────
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Top 50 global leaderboard ───────────────────────────────────────
    const { data: leaders, error: leadersError } = await supabase
      .from("leaderboard")
      .select("rank, id, display_name, avatar_url, best_score, league")
      .order("rank", { ascending: true });

    if (leadersError) {
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }

    // ── Current user's rank + profile ───────────────────────────────────
    const { data: myRankRow } = await supabase
      .from("leaderboard")
      .select("rank, best_score, league")
      .eq("id", user.id)
      .single();

    const { data: myProfile } = await supabase
      .from("profiles")
      .select("display_name, best_score, league")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      leaders: leaders ?? [],
      me: {
        rank: myRankRow?.rank ?? null,
        best_score: myRankRow?.best_score ?? myProfile?.best_score ?? 0,
        league: myRankRow?.league ?? myProfile?.league ?? "Bronze League",
        display_name: myProfile?.display_name ?? "You",
      },
    }, { status: 200 });

  } catch (err) {
    console.error("leaderboard error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}