"use client";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import StatsHeader from "./components/StatsHeader";
import GameBoard from "./components/GameBoard";
import Leaderboard from "./components/Leaderboard";
import { Menu } from "lucide-react";


export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display flex h-screen overflow-hidden">
      <aside className="hidden lg:flex flex-col w-72 h-full border-r border-border-dark bg-background-dark z-20">

        <div className="h-20 flex items-center px-6 border-b border-border-dark">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">playing_cards</span>
            <span className="text-xl font-bold tracking-tight text-white">HiLo<span
              className="text-primary font-light">Game</span></span>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto">

          <div className="flex flex-col items-center text-center gap-3">
            <div className="relative group">
              <div
                className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200">
              </div>
              <div className="relative h-24 w-24 rounded-full p-[2px] bg-background-dark">
                <img alt="User avatar of a young man smiling" className="h-full w-full rounded-full object-cover"
                  data-alt="User profile avatar"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0MM1etQhGK-Pd_-2ilrk2tVA7bbUzq_K5bIilNYL_O85MxuRAI3K1Qpw0NDVc3C2LasS_efO_AekaHNRzSRvGGYlgWBZtS55w6kUzT3xYZ7Uvj98nKCYkkvgCWKileAlBl-z1J1cOINNDNUK9uKBN_FYig6LJcdS2JZl6gp7r_xuDDMqPiA7nHpBJIeL9XR88g2cdkYAZtvC5rBtTd_qJVTg3oA-Hc0KF9eItm1OyPa3St6BrCs08qTcUjCTFq5-Msr--QZhzd_I" />
              </div>
              <div
                className="absolute bottom-1 right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-background-dark">
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AlexGamer</h2>
              <p className="text-secondary text-sm">alex@example.com</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <span className="text-white font-medium">Level 12</span>
              <span className="text-secondary text-xs">750/1000 XP</span>
            </div>
            <div className="h-2 w-full bg-border-dark rounded-full overflow-hidden">
              <div className="h-full bg-primary w-3/4 rounded-full shadow-[0_0_10px_rgba(51,13,242,0.6)]"></div>
            </div>
          </div>

          <nav className="flex flex-col gap-1 py-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-dark text-white border border-border-dark/50 hover:border-primary/50 transition-colors group"
              href="#">
              <span
                className="material-symbols-outlined text-primary group-hover:text-white transition-colors">dashboard</span>
              <span className="font-medium">Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-dark/50 text-secondary hover:text-white transition-colors"
              href="#">
              <span className="material-symbols-outlined">person</span>
              <span className="font-medium">Profile</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-dark/50 text-secondary hover:text-white transition-colors"
              href="#">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-medium">Settings</span>
            </a>
          </nav>

          <div className="grid grid-cols-2 gap-3 mt-auto">
            <div
              className="col-span-2 bg-surface-dark p-4 rounded-xl border border-border-dark flex items-center justify-between">
              <div>
                <p className="text-secondary text-xs uppercase tracking-wider font-semibold">Total Wins</p>
                <p className="text-2xl font-bold text-white mt-1">142</p>
              </div>
              <span className="material-symbols-outlined text-green-500 text-3xl">emoji_events</span>
            </div>
            <div className="bg-surface-dark p-3 rounded-xl border border-border-dark">
              <p className="text-secondary text-xs uppercase tracking-wider font-semibold">Plays</p>
              <p className="text-xl font-bold text-white mt-1">200</p>
            </div>
            <div className="bg-surface-dark p-3 rounded-xl border border-border-dark">
              <p className="text-secondary text-xs uppercase tracking-wider font-semibold">Fails</p>
              <p className="text-xl font-bold text-white mt-1">58</p>
            </div>
          </div>

          <button
            className="flex items-center gap-3 px-4 py-2 mt-2 text-secondary hover:text-red-400 transition-colors w-full">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main
        className="flex-1 relative flex flex-col h-full overflow-hidden bg-[url('https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&amp;w=2070&amp;auto=format&amp;fit=crop')] bg-cover bg-center">

        <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-sm"></div>

        <header
          className="lg:hidden flex items-center justify-between p-4 z-10 bg-background-dark border-b border-border-dark">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-2xl">playing_cards</span>
            <span className="font-bold text-white">HiLo</span>
          </div>
          <button className="text-white p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <div
          className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-5xl mx-auto px-4 py-6 gap-8">

          <div className="flex items-center gap-6 animate-fade-in-down">
            <div
              className="bg-surface-dark/80 backdrop-blur border border-border-dark px-6 py-2 rounded-full flex items-center gap-3 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-sm font-medium text-white uppercase tracking-wider">Live Game</span>
            </div>
            <div
              className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-orange-500/20">
              <span className="material-symbols-outlined text-white text-sm">local_fire_department</span>
              <span className="text-sm font-bold text-white">Streak: 5</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-10 w-full">

            <div className="relative group perspective-1000">
              <div className="absolute -inset-4 bg-primary/30 rounded-[2rem] blur-xl opacity-50 animate-pulse"></div>
              <div
                className="relative w-64 h-96 sm:w-80 sm:h-[480px] bg-white rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden border-8 border-white transform transition-transform duration-500 hover:scale-105">

                <div className="absolute inset-0 bg-repeat opacity-5"
                  style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')" }}>
                </div>

                <div className="flex flex-col justify-between h-full w-full p-6 text-red-600">
                  <div className="flex flex-col items-center self-start">
                    <span className="text-5xl font-bold font-serif leading-none">K</span>
                    <span className="material-symbols-outlined text-4xl mt-1 fill-current">favorite</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img alt="Illustration of a King playing card face"
                      className="w-40 h-40 object-contain mix-blend-multiply opacity-90"
                      data-alt="King card illustration"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6gmMtNFzCKhEywaKcIDAtO988E5R4x09p8TKJTlLBI9OwdJgqzZvdQ_cvCKOzx7GBACxc-yTcX8dg4olWbcurZ5YxBCkgFUqbaqyZmVmZaCf8E_UULjH6SOgArptcx6aETssfGNtAXFU32F3gesx8Wp7Md64Wt93dsf-2_q7MW_OWxodl0I1hUFt9LBOP6y-SYi2yhvEROgkkWjAVxuc_awwpyM31u9pJMTxkwpASBoZ0ineJUqIJ80oygRNDWjzKnQY6MKwLb5s" />
                  </div>
                  <div className="flex flex-col items-center self-end rotate-180">
                    <span className="text-5xl font-bold font-serif leading-none">K</span>
                    <span className="material-symbols-outlined text-4xl mt-1 fill-current">favorite</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 w-full justify-center max-w-md">
              <button
                className="flex-1 group relative overflow-hidden rounded-xl bg-surface-dark border border-border-dark p-1 transition-all hover:border-primary/50 hover:shadow-[0_0_20px_rgba(51,13,242,0.4)]">
                <div
                  className="relative flex items-center justify-center gap-3 bg-background-dark group-hover:bg-primary/10 rounded-lg py-4 transition-colors">
                  <div
                    className="bg-red-500/20 p-2 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_downward</span>
                  </div>
                  <span className="text-xl font-bold text-white tracking-wide">LOWER</span>
                </div>
              </button>
              <div className="h-12 w-[1px] bg-border-dark"></div>
              <button
                className="flex-1 group relative overflow-hidden rounded-xl bg-surface-dark border border-border-dark p-1 transition-all hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <div
                  className="relative flex items-center justify-center gap-3 bg-background-dark group-hover:bg-green-500/10 rounded-lg py-4 transition-colors">
                  <span className="text-xl font-bold text-white tracking-wide">HIGHER</span>
                  <div
                    className="bg-green-500/20 p-2 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined">arrow_upward</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-xs font-semibold text-secondary uppercase tracking-widest">Previous Cards</p>
            <div className="flex gap-3 opacity-60 hover:opacity-100 transition-opacity">
              <div
                className="w-10 h-14 bg-white rounded flex items-center justify-center text-slate-900 font-serif font-bold border border-slate-300">
                7<span className="text-xs ml-0.5">♠</span></div>
              <div
                className="w-10 h-14 bg-white rounded flex items-center justify-center text-red-600 font-serif font-bold border border-slate-300">
                Q<span className="text-xs ml-0.5">♦</span></div>
              <div
                className="w-10 h-14 bg-white rounded flex items-center justify-center text-slate-900 font-serif font-bold border border-slate-300">
                2<span className="text-xs ml-0.5">♣</span></div>
              <div
                className="w-10 h-14 bg-white rounded flex items-center justify-center text-red-600 font-serif font-bold border border-slate-300">
                A<span className="text-xs ml-0.5">♥</span></div>
            </div>
          </div>
        </div>
      </main>

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
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

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
    </div>
  )
}