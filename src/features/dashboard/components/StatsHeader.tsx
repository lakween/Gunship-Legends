"use client";

export default function StatsHeader({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Chips Balance */}
      <div className="bg-neutral-900 border border-white/5 p-5 rounded-[2rem] flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center text-2xl">
          🪙
        </div>
        <div>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Available Chips</p>
          <h3 className="text-2xl font-black text-white">{user.chips.toLocaleString()}</h3>
        </div>
      </div>

      {/* Win Count */}
      <div className="bg-neutral-900 border border-white/5 p-5 rounded-[2rem] flex items-center gap-4">
        <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-2xl">
          🏆
        </div>
        <div>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Total Wins</p>
          <h3 className="text-2xl font-black text-white">{user.wins}</h3>
        </div>
      </div>

      {/* Experience / Level */}
      <div className="bg-neutral-900 border border-white/5 p-5 rounded-[2rem]">
        <div className="flex justify-between items-end mb-2">
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Level 12 Progress</p>
          <span className="text-rose-500 text-xs font-bold">75%</span>
        </div>
        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-600 to-red-400 w-[75%] rounded-full shadow-[0_0_10px_rgba(225,29,72,0.5)]"></div>
        </div>
      </div>
    </div>
  );
}