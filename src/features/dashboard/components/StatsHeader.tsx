export default function StatsHeader({ user }: { user: any }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {/* Card Template */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-4 lg:p-5 rounded-[1.5rem] lg:rounded-[2rem] flex items-center gap-3 shadow-sm dark:shadow-none">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl lg:rounded-2xl flex items-center justify-center text-xl lg:text-2xl">
          🪙
        </div>
        <div>
          <p className="text-neutral-400 dark:text-neutral-500 text-[9px] lg:text-[10px] font-black uppercase tracking-widest">Chips</p>
          <h3 className="text-lg lg:text-2xl font-black">{user.chips.toLocaleString()}</h3>
        </div>
      </div>

      {/* Level Progress - Full width on mobile */}
      <div className="col-span-2 lg:col-span-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/5 p-4 lg:p-5 rounded-[1.5rem] lg:rounded-[2rem]">
        <div className="flex justify-between items-end mb-2">
          <p className="text-neutral-400 dark:text-neutral-500 text-[9px] lg:text-[10px] font-black uppercase tracking-widest">Exp</p>
          <span className="text-rose-500 text-xs font-bold">75%</span>
        </div>
        <div className="w-full h-1.5 lg:h-2 bg-neutral-200 dark:bg-black/40 rounded-full overflow-hidden">
          <div className="h-full bg-rose-600 w-[75%] rounded-full shadow-[0_0_10px_rgba(225,29,72,0.3)]"></div>
        </div>
      </div>
    </div>
  );
}