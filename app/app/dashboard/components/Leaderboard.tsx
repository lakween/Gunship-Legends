"use client";

import { useRealtimeQuery } from "@/hooks/useRealTimeQuery";
import { getLeaderboardAction, LeaderEntry, MeEntry } from "../actions";

;

interface LeaderboardData { leaders: LeaderEntry[]; me: MeEntry | null; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function rankStyle(rank: number) {
  if (rank === 1) return { border: "border-yellow-500", badge: "bg-yellow-500 text-black", score: "text-yellow-500", row: "bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20" };
  if (rank === 2) return { border: "border-slate-400", badge: "bg-slate-400 text-black", score: "text-slate-300", row: "bg-surface-dark/50 border border-border-dark" };
  if (rank === 3) return { border: "border-orange-600", badge: "bg-orange-700 text-white", score: "text-orange-400", row: "bg-surface-dark/50 border border-border-dark" };
  return { border: "", badge: "", score: "text-secondary", row: "border border-transparent hover:border-border-dark" };
}

function Avatar({ src, name, borderClass }: { src: string | null; name: string; borderClass: string }) {
  if (src) return <img src={src} alt={`${name} avatar`} className={`w-10 h-10 rounded-full object-cover border-2 ${borderClass}`} />;
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`w-10 h-10 rounded-full border-2 ${borderClass} bg-surface-dark flex items-center justify-center text-sm font-bold text-white`}>
      {initials}
    </div>
  );
}

function LeaderRow({ entry }: { entry: LeaderEntry }) {
  const styles = rankStyle(entry.rank);
  const isTopThree = entry.rank <= 3;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl hover:bg-surface-dark transition-colors cursor-pointer relative ${styles.row}`}>
      {entry.rank === 1 && <div className="absolute -left-[1px] top-3 bottom-3 w-1 bg-yellow-500 rounded-r" />}

      {isTopThree ? (
        <div className="relative shrink-0">
          <Avatar src={entry.avatar_url} name={entry.display_name} borderClass={styles.border} />
          <span className={`absolute -top-1 -right-1 w-5 h-5 ${styles.badge} rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm`}>
            {entry.rank}
          </span>
        </div>
      ) : (
        <span className="w-10 text-center font-bold text-secondary text-sm shrink-0">{entry.rank}</span>
      )}

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-${isTopThree ? "bold" : "medium"} text-white truncate`}>
          {entry.display_name || "Anonymous"}
        </p>
        {isTopThree && <p className="text-xs text-primary opacity-60">{entry.league}</p>}
      </div>

      <p className={`font-mono font-bold text-sm shrink-0 ${styles.score}`}>
        {entry.best_score.toLocaleString()}
      </p>
    </div>
  );
}

function MyRankingCard({ me, loading }: { me: MeEntry | null; loading: boolean }) {
  return (
    <div className="p-4 border-t border-border-dark">
      <p className="text-xs text-primary mb-2 uppercase tracking-wide font-semibold text-center">Your Ranking</p>
      {loading ? (
        <div className="h-16 rounded-xl bg-background-dark animate-pulse" />
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
          <div className="flex flex-col items-center justify-center w-10 h-10 bg-background-dark rounded-lg border border-border-dark text-primary font-bold shadow-inner shrink-0">
            <span className="text-xs leading-none">#</span>
            <span className="text-lg leading-none">{me?.rank ?? "—"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{me?.display_name ?? "You"}</p>
            <p className="text-xs text-primary opacity-60">{me?.league ?? "Bronze League"}</p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <p className="font-mono font-bold text-white">{(me?.best_score ?? 0).toLocaleString()}</p>
            {me?.rank && me.rank <= 10 && (
              <p className="text-[10px] text-green-400 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[10px]">arrow_upward</span>Top 10
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LiveIndicator({ live }: { live: boolean }) {
  return (
    <div className="relative flex items-center gap-1.5 text-xs text-secondary">
      <span className="relative flex h-3 w-3">
        {live && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />}
        <span className={`relative inline-flex rounded-full h-3 w-3 ${live ? "bg-green-500" : "bg-zinc-600"}`} />
      </span>
      {live ? "Live" : "Connecting…"}
    </div>
  );
}

function LeaderboardHeader({ live }: { live: boolean }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border-dark">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span className="material-symbols-outlined text-yellow-500">trophy</span>
        Global Leaders
      </h3>
      <LiveIndicator live={live} />
    </div>
  );
}

function LeaderList({ leaders, loading, flash }: { leaders: LeaderEntry[]; loading: boolean; flash: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-surface-dark/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (leaders.length === 0) {
    return <p className="text-center text-secondary text-sm py-8">No scores yet. Be the first!</p>;
  }

  return (
    <div className={`space-y-2 transition-opacity duration-300 ${flash ? "opacity-50" : "opacity-100"}`}>
      {leaders.map(entry => <LeaderRow key={entry.id} entry={entry} />)}
    </div>
  );
}

export default function Leaderboard({ mobile = false }: { mobile?: boolean }) {
  const { data, loading, live, flash } = useRealtimeQuery<LeaderboardData>({
    key: "leaderboard",
    fetcher: async () => {
      const result = await getLeaderboardAction();
      return { leaders: result.leaders ?? [], me: result.me ?? null };
    },
  });
  const leaders = data?.leaders ?? [];
  const me = data?.me ?? null;

  if (mobile) {
    return (
      <div className="w-full flex flex-col bg-background-dark">
        <LeaderboardHeader live={live} />
        <div className="p-4">
          <LeaderList leaders={leaders} loading={loading} flash={flash} />
        </div>
        <MyRankingCard me={me} loading={loading} />
      </div>
    );
  }

  return (
    <aside className="hidden xl:flex flex-col w-80 h-full border-l border-border-dark bg-background-dark z-20 shrink-0">
      <div className="h-20 shrink-0">
        <LeaderboardHeader live={live} />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <LeaderList leaders={leaders} loading={loading} flash={flash} />
      </div>
      <MyRankingCard me={me} loading={loading} />
    </aside>
  );
}