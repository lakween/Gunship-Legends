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
  const allowedFields = ["display_name", "first_name", "last_name", "avatar_url"];

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


export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()

  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  if (!user) return { success: false, error: "Not authenticated" };

  // 2. Validate file
  const file = formData.get('avatar') as File
  if (!file || file.size === 0) throw new Error('No file provided')

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) return { success: false, error: "Invalid file type" }
  if (file.size > 5 * 1024 * 1024) return { success: false, error: "File exceeds 5MB limit" }

  // 3. Upload to storage
  const ext = file.name.split('.').pop()
  const filePath = `${user.sub}/avatar.${ext}`
  const bytes = await file.arrayBuffer()

  const { data: storageData, error: storageError } = await supabase.storage
    .from('profile pictures')
    .upload(filePath, Buffer.from(bytes), {
      contentType: file.type,
      upsert: true,
    })

  if (storageError) throw new Error(storageError.message)

  // 4. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('profile pictures')
    .getPublicUrl(storageData.path)

  // 5. Save to profiles table
  const { error: dbError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.sub)

  if (dbError) throw new Error(dbError.message)

  return { url: publicUrl }
}

const BUCKET = "profile pictures";
const MAX_MB = 2;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadAvatarAction(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Not authenticated" };

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { success: false, error: "No file provided" };

  if (!ALLOWED.includes(file.type)) {
    return { success: false, error: "Only JPG, PNG, WEBP, or GIF files are allowed." };
  }

  if (file.size > MAX_MB * 1024 * 1024) {
    return { success: false, error: `File must be smaller than ${MAX_MB}MB.` };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  // Convert File → ArrayBuffer → Buffer for server-side upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { upsert: true, contentType: file.type });

  if (storageError) return { success: false, error: storageError.message };

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(path);

  // Bust cache so browser loads new image immediately
  const bustedUrl = `${publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: bustedUrl })
    .eq("id", user.id);

  if (updateError) return { success: false, error: updateError.message };

  return { success: true, url: bustedUrl };
}
