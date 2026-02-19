export default function Leaderboard() {
  const topPlayers = [
    { rank: 1, name: "Ace_King", score: 15000 },
    { rank: 2, name: "HeartRunner", score: 12400 },
    { rank: 3, name: "Lucky_Joe", score: 9000 },
  ];

  return (
    <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-6">
      <h3 className="text-sm font-black uppercase text-neutral-500 mb-6 tracking-widest">Global Ranking</h3>
      <div className="space-y-4">
        {topPlayers.map((p) => (
          <div key={p.rank} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
            <span className="font-bold text-rose-500">#{p.rank}</span>
            <span className="flex-1 ml-4 font-medium">{p.name}</span>
            <span className="text-neutral-400 text-sm">{p.score}pt</span>
          </div>
        ))}
      </div>
    </div>
  );
}