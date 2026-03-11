"use server";

import { createClient } from "@/lib/supabase/server";

// ── Get profile ───────────────────────────────────────────────────────────────
export async function getProfileAction() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated", data: null };

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return { success: false, error: error.message, data: null };

  return { success: true, data };
}

// ── Update profile field ──────────────────────────────────────────────────────
export async function updateProfileAction(key: string, value: string) {
  const allowedFields = ["display_name", "first_name", "last_name"];

  if (!allowedFields.includes(key)) {
    return { success: false, error: "Invalid field" };
  }

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ [key]: value })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  return { success: true };
}


export interface LeaderEntry {
  rank: number;
  id: string;
  display_name: string;
  avatar_url: string | null;
  best_score: number;
  league: string;
}

export interface MeEntry {
  rank: number | null;
  best_score: number;
  league: string;
  display_name: string;
}

export interface LeaderboardResult {
  success: boolean;
  leaders?: LeaderEntry[];
  me?: MeEntry | null;
  error?: string;
}

export async function getLeaderboardAction(): Promise<LeaderboardResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: leaders, error } = await supabase
    .from("leaderboard")
    .select("rank, id, display_name, avatar_url, best_score, league")
    .order("rank", { ascending: true })
    .limit(50);

  if (error) return { success: false, error: error.message };

  let me: MeEntry | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, best_score, league")
      .eq("id", user.id)
      .single();

    if (profile) {
      const myEntry = leaders?.find(l => l.id === user.id);
      me = {
        rank: myEntry?.rank ?? null,
        best_score: profile.best_score,
        league: profile.league,
        display_name: profile.display_name,
      };
    }
  }

  return { success: true, leaders: leaders ?? [], me };
}

export async function submitScoreAction(score: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase.rpc("submit_score", { p_score: score });
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (e) {
    return { success: false, error: "Unexpected error" };
  }
}