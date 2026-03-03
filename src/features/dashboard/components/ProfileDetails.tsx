"use client";
import { LayoutDashboard, User, Settings, LogOut, Trophy } from "lucide-react";

export default function ProfileDetails() {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", active: true },
    { icon: <User size={20} />, label: "Profile", active: false },
    { icon: <Settings size={20} />, label: "Settings", active: false },
  ];

  return (
    <>
      <aside className="hidden lg:flex flex-col w-72 h-full border-r border-border-dark bg-background-dark z-20">

        <div className="h-20 flex items-center px-6 border-b border-border-dark">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">playing_cards</span>
            <span className="text-xl font-bold tracking-tight text-white">Flybird <span
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
    </>
  );
}