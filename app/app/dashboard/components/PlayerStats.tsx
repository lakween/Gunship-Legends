"use client";

interface Stats {
  best_score:   number;
  total_plays:  number;
  latest_score: number;
}

function StatSkeleton() {
  return <div className="w-12 h-6 bg-primary animate-pulse rounded mt-1" />;
}

export default function PlayerStats({ stats }: { stats: Stats }) {
  const best   = stats.best_score;
  const plays  = stats.total_plays;
  const latest = stats.latest_score;
  const avg    = plays > 0 ? Math.round(best / plays) : 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2 bg-surface-dark p-4 rounded-xl border border-border-dark flex items-center justify-between">
        <div>
          <p className="text-primary text-xs uppercase tracking-wider font-semibold">Best Score</p>
          <p className="text-2xl font-bold text-primary mt-1">{best.toLocaleString()}</p>
        </div>
        <span className="material-symbols-outlined text-yellow-500 text-3xl">emoji_events</span>
      </div>
      <div className="bg-surface-dark p-3 rounded-xl border border-border-dark">
        <p className="text-primary text-xs uppercase tracking-wider font-semibold">Plays</p>
        <p className="text-xl font-bold text-primary mt-1">{plays.toLocaleString()}</p>
      </div>
      <div className="bg-surface-dark p-3 rounded-xl border border-border-dark">
        <p className="text-primary text-xs uppercase tracking-wider font-semibold">Latest</p>
        <div className="flex items-end gap-1 mt-1">
          <p className="text-xl font-bold text-primary">{latest.toLocaleString()}</p>
          {latest > 0 && latest >= best * 0.8 && <span className="text-green-400 text-xs mb-0.5">↑</span>}
        </div>
      </div>
      <div className="col-span-2 bg-surface-dark p-3 rounded-xl border border-border-dark flex items-center justify-between">
        <div>
          <p className="text-primary text-xs uppercase tracking-wider font-semibold">Avg Score</p>
          <p className="text-xl font-bold text-primary mt-1">{plays > 0 ? avg.toLocaleString() : "—"}</p>
        </div>
        <span className="material-symbols-outlined text-primary text-2xl">bar_chart</span>
      </div>
    </div>
  );
}