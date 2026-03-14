"use client";

import EditableFormInput from "@/components/common/EditableFormInput";
import useForm from "@/hooks/useForm";
import { useEffect } from "react";
import { toast } from "sonner";
import { useServerAction } from "@/hooks/useServerAction";
import { createClient } from "@/lib/supabase/client";
import PlayerStats from "./PlayerStats";
import { getProfileAction, updateProfileAction } from "../actions";
import { useRealtimeQuery } from "@/hooks/useRealTimeQuery";
import AvatarUpload from "@/components/common/AvatarUpload";

const LEAGUES = [
  { name: "Bronze League", min: 0, max: 99, color: "from-orange-800 to-orange-600", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { name: "Silver League", min: 100, max: 499, color: "from-slate-500 to-slate-300", text: "text-slate-300", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  { name: "Gold League", min: 500, max: 999, color: "from-yellow-700 to-yellow-400", text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { name: "Platinum League", min: 1000, max: 1999, color: "from-cyan-700 to-cyan-400", text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { name: "Diamond League", min: 2000, max: 4999, color: "from-blue-600 to-blue-300", text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { name: "Master League", min: 5000, max: null, color: "from-purple-600 to-pink-400", text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
] as const;

function getLeagueInfo(bestScore: number) {
  const idx = LEAGUES.findIndex((l, i) => {
    const next = LEAGUES[i + 1];
    return bestScore >= l.min && (next ? bestScore < next.min : true);
  });
  const current = LEAGUES[Math.max(0, idx)];
  const next = LEAGUES[idx + 1] ?? null;
  const isMaster = !next;
  const progress = isMaster ? 100 : Math.round(((bestScore - current.min) / (current.max! + 1 - current.min)) * 100);
  const pointsToNext = next ? next.min - bestScore : 0;
  return { current, next, progress, pointsToNext, isMaster };
}

function LeagueIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    "Bronze League": "🥉", "Silver League": "🥈", "Gold League": "🥇",
    "Platinum League": "💎", "Diamond League": "💠", "Master League": "👑",
  };
  return <span className="text-lg">{icons[name] ?? "🏅"}</span>;
}

export default function ProfileDetails({ mobile = false }: { mobile?: boolean }) {
  const { form, setForm } = useForm();
  const { data, loading, refresh } = useServerAction(getProfileAction);

  useEffect(() => { if (data) setForm(data); }, [data]);

  const onSaveHandler = async (key: string, value: string) => {
    const result = await updateProfileAction(key, value);
    if (!result.success) {
      toast.error(result.error ?? "Failed to update");
      throw new Error(result.error);
    }
    toast.success("Profile updated");
    refresh();
  };

  const { data: stats } = useRealtimeQuery<{ best_score: number; total_plays: number; latest_score: number }>({
    key: `profile-stats-${data?.id}`,
    fetcher: async () => {
      if (!data?.id) return null;
      const { data: resData } = await getProfileAction()
      return resData;
    },
    onUpdate: (payload) => {
      if (payload.new?.id !== data?.id) return null;
      console.log('payload', payload)
      const { best_score, total_plays, latest_score } = payload?.new;
      return { best_score, total_plays, latest_score };
    },
  });

  const bestScore = stats?.best_score ?? data?.best_score ?? 0;
  const { current: league, next: nextLeague, progress, pointsToNext, isMaster } = getLeagueInfo(bestScore);

  const inner = (
    <div className="flex flex-col gap-5 p-6 h-[calc(100vh-198px)] md:h-[calc(100vh-220px)]">

      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200" />
          <div className="relative h-24 w-24 rounded-full p-[2px] bg-background-dark">
            <AvatarUpload currentUrl={data?.avatar_url} displayName={data?.display_name} />
            {/* {data?.avatar_url
              ? <img src={data.avatar_url} alt="Profile avatar" className="h-full w-full rounded-full object-cover" />
              : <div className="h-full w-full rounded-full bg-surface-dark flex items-center justify-center text-2xl font-bold text-primary">{data?.display_name?.charAt(0)?.toUpperCase() ?? "?"}</div>} */}
          </div>
          {/* <div className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-background-dark" /> */}
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary leading-tight">
            {loading ? <span className="inline-block w-32 h-5 bg-primary animate-pulse rounded" /> : data?.display_name ?? "—"}
          </h2>
          <p className="text-primary text-sm mt-0.5">{data?.first_name} {data?.last_name}</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${league.bg} ${league.border} border ${league.text}`}>
          <LeagueIcon name={league.name} /> {league.name}
        </div>
      </div>


      <div className={`rounded-xl border ${league.border} ${league.bg} p-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <LeagueIcon name={league.name} />
            <span className={`text-xs font-bold ${league.text}`}>{league.name}</span>
          </div>
          {nextLeague && <div className="flex items-center gap-1.5"><span className="text-xs text-primary font-bold">{nextLeague.name}</span><LeagueIcon name={nextLeague.name} /></div>}
          {isMaster && <span className="text-xs text-purple-400 font-bold">Max Rank 👑</span>}
        </div>
        <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${league.color} rounded-full transition-all duration-700 ease-out`} style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-primary">{progress}%</span>
          {!isMaster && <span className="text-xs text-primary"><span className={`font-bold ${league.text}`}>{pointsToNext}</span> pts to {nextLeague?.name}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {[
          { label: "Display Name", name: "display_name" },
          { label: "First Name", name: "first_name" },
          { label: "Last Name", name: "last_name" },
        ].map(({ label, name }) => (
          <div key={name} className="flex justify-between items-center">
            <span className="text-primary text-sm">{label}</span>
            <EditableFormInput name={name} value={form?.[name] || ""} onSave={onSaveHandler} />
          </div>
        ))}
      </div>

      {stats && <PlayerStats stats={stats} />}

    </div>
  );

  if (mobile) return <div className="w-full bg-background-dark">{inner}</div>;

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r border-border-dark bg-background-dark z-20 shrink-0">
      <div className="h-20 flex items-center px-6 border-b border-border-dark shrink-0">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined text-3xl">playing_cards</span>
          <span className="text-xl font-bold tracking-tight text-primary">Gunship <span className="font-light">Legend</span></span>
        </div>
      </div>
      <div className="overflow-y-auto flex-1">{inner}</div>
    </aside>
  );
}