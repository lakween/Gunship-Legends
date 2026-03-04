export default function Leaderboard() {


  return (
    <aside className="hidden xl:flex flex-col w-80 h-full border-l border-border-dark bg-background-dark z-20">
      <div className="h-20 flex items-center justify-between px-6 border-b border-border-dark">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-500">trophy</span>
          Global Leaders
        </h3>
        <button className="text-secondary hover:text-white transition-colors">
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[calc(100vh-200px)]">
        <div
          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 relative group hover:bg-surface-dark transition-colors cursor-pointer">
          <div className="absolute -left-[1px] top-3 bottom-3 w-1 bg-yellow-500 rounded-r"></div>
          <div className="relative">
            <img alt="Leader avatar 1" className="w-10 h-10 rounded-full object-cover border-2 border-yellow-500"
              data-alt="ProPlayer avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA14uD7FK3pNLmA36tSVPhHPtqQlI9Tysqy7XQVmDJAhWS-VwH80_NggpLyHxsoZXqTaNFGZe_5w9iwoq7If1KxhfXStqR5CwDgZ4Zatj-xt1ajvr49OIQeiSRFpOoqJ16O2r5Q1T3Q0L_IArZVbBdGVHgngfUSXRI9lt7RRxWmXxPKO3dnenmAVgnpNwdqNCxEZW16dSnQ9MSz3pkPRFZCQM39TQggDHDAT_B9XZ3hc9Uj_2RvjwhM3pv_C4zzwSAZxaWYuUP81sY" />
            <span
              className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-sm">1</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">ProPlayer</p>
            <p className="text-xs text-secondary">Master League</p>
          </div>
          <p className="font-mono font-bold text-yellow-500">9,999</p>
        </div>

        <div
          className="flex items-center gap-3 p-3 rounded-xl bg-surface-dark/50 border border-border-dark hover:bg-surface-dark transition-colors cursor-pointer">
          <div className="relative">
            <img alt="Leader avatar 2" className="w-10 h-10 rounded-full object-cover border-2 border-slate-400"
              data-alt="CardShark avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXC0GIuvt7WcoYfQbbgFY9pSA7kjgJmMO6Kc2R04cjmYi2I-Vtd5qO2V_ALSkezvAw4YhfdUGOt9rKWAlXqPIjs0Knrl7B8a7Obmb7pZvytUMonQh5jIRO74FcMfZ28_Kyu7slV00EiA_e06P-JbJZ86Bn_mUus5kxafmlPAnGqVIq2bLQ9JoKsUI8RM7sRV-3ye2XLhNewZ5fao0Zuhp4U6e6WPxUcG8kSOXBXXVHulndzx51AKfOLTgKdF4xXnmwkcnYHSbRVbA" />
            <span
              className="absolute -top-1 -right-1 w-5 h-5 bg-slate-400 rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow-sm">2</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">CardShark</p>
            <p className="text-xs text-secondary">Diamond League</p>
          </div>
          <p className="font-mono font-bold text-slate-300">8,500</p>
        </div>

        <div
          className="flex items-center gap-3 p-3 rounded-xl bg-surface-dark/50 border border-border-dark hover:bg-surface-dark transition-colors cursor-pointer">
          <div className="relative">
            <img alt="Leader avatar 3" className="w-10 h-10 rounded-full object-cover border-2 border-orange-700"
              data-alt="LuckyDuck avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4kr4OrTzfI1zh2JwlX9LKinU3YG0YxjtFtYKN7NIrorkrs-uDaa9A-9irk99IddPbKBl89FEKXiSoFhdB9x-HXf7Hhj7oovFax6iCwbxoeqMb7lAB69MrOx8q7KWSO-e_vocA87IfgCzLghNHIAJ8W0MF1Rj0TvZI3sUhi7q64Ni9sb8ynNUsaILoHJwALfXOT2kWF9E4FLWsFtopIcNGaI8zzEzvz33g4edo7j88pnTHBrXtaCrflwaTKwqeoP6QRLITsNQFKhQ" />
            <span
              className="absolute -top-1 -right-1 w-5 h-5 bg-orange-700 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">3</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">LuckyDuck</p>
            <p className="text-xs text-secondary">Platinum League</p>
          </div>
          <p className="font-mono font-bold text-orange-400">7,240</p>
        </div>

        <div
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-dark transition-colors cursor-pointer border border-transparent hover:border-border-dark">
          <span className="w-10 text-center font-bold text-secondary text-sm">4</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">GameMasterX</p>
          </div>
          <p className="font-mono text-sm text-secondary">6,100</p>
        </div>

        <div
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-dark transition-colors cursor-pointer border border-transparent hover:border-border-dark">
          <span className="w-10 text-center font-bold text-secondary text-sm">5</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">AceHigh</p>
          </div>
          <p className="font-mono text-sm text-secondary">5,920</p>
        </div>

        <div
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-dark transition-colors cursor-pointer border border-transparent hover:border-border-dark">
          <span className="w-10 text-center font-bold text-secondary text-sm">6</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">NeonRider</p>
          </div>
          <p className="font-mono text-sm text-secondary">5,800</p>
        </div>
      </div>

      <div className="p-4 bg-surface-dark border-t border-border-dark shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-30">
        <p className="text-xs text-secondary mb-2 uppercase tracking-wide font-semibold text-center">Your Ranking</p>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
          <div
            className="flex flex-col items-center justify-center w-10 h-10 bg-background-dark rounded-lg border border-border-dark text-primary font-bold shadow-inner">
            <span className="text-xs leading-none">#</span>
            <span className="text-lg leading-none">42</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">You</p>
            <p className="text-xs text-primary">Gold League</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="font-mono font-bold text-white">3,200</p>
            <p className="text-[10px] text-green-400 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">arrow_upward</span>

            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}