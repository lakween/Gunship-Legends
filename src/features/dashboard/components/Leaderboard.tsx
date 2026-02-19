export default function Leaderboard() {
  const leaders = [
    { name: "ProPlayer", rank: 1, score: "9,999", league: "Master League" },
    { name: "CardShark", rank: 2, score: "8,500", league: "Diamond League" },
  ];

  return (
    <div className="w-full lg:w-80 bg-[#12122b] border-l border-white/5 flex flex-col p-6">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-6 uppercase tracking-tighter">
        <span className="text-amber-500 italic">🏆</span> Global Leaders
      </h2>
      
      <div className="space-y-3 flex-1">
        {leaders.map((p) => (
          <div key={p.rank} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3 hover:bg-white/10 transition cursor-pointer">
            <div className="relative">
              <img src={`/u${p.rank}.png`} className="w-10 h-10 rounded-full border border-indigo-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-[10px] font-bold flex items-center justify-center text-black">
                {p.rank}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{p.name}</p>
              <p className="text-[9px] text-neutral-500 font-bold uppercase">{p.league}</p>
            </div>
            <div className="text-amber-500 font-black text-sm">{p.score}</div>
          </div>
        ))}
      </div>

      {/* User Own Ranking Stickied to Bottom */}
      <div className="mt-6 bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-2xl flex items-center gap-3">
         <div className="w-10 h-10 bg-indigo-600 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold">
            <span className="opacity-50">#</span>42
         </div>
         <div className="flex-1">
            <p className="text-sm font-bold">You</p>
            <p className="text-[9px] text-indigo-400 font-bold uppercase">Gold League</p>
         </div>
         <div className="text-right">
            <p className="font-black">3,200</p>
            <p className="text-[9px] text-green-500 font-bold">↑ +120</p>
         </div>
      </div>
    </div>
  );
}