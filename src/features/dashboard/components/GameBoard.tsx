"use client";
import { LayoutDashboard, User, Settings, LogOut, Trophy } from "lucide-react";

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", active: true },
    { icon: <User size={20} />, label: "Profile", active: false },
    { icon: <Settings size={20} />, label: "Settings", active: false },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}
      
      <aside className={`
        fixed lg:relative z-50 h-full w-64 bg-[#12122b] border-r border-white/5 p-6 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="flex items-center gap-2 mb-10 text-indigo-500 font-black text-xl italic">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white italic">H</div>
          HiLoGame
        </div>

        {/* User Profile Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 mb-4">
             <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full blur-md opacity-50" />
             <img src="/avatar.png" className="relative w-full h-full rounded-full border-2 border-indigo-400 object-cover" />
             <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-[#12122b] rounded-full" />
          </div>
          <h3 className="font-bold text-white">AlexGamer</h3>
          <p className="text-xs text-neutral-500">alex@example.com</p>
        </div>

        {/* Level Progress */}
        <div className="mb-10">
          <div className="flex justify-between text-[10px] font-bold text-neutral-400 mb-1 uppercase">
            <span>Level 12</span>
            <span>750/1000 XP</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 w-[75%]" />
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <button key={item.label} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition font-medium ${item.active ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white"}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        {/* Stats Cards (Mobile: Stacked, Desktop: Visible) */}
        <div className="mt-auto pt-6 space-y-3">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-neutral-500 uppercase font-black">Total Wins</p>
              <p className="text-xl font-bold">142</p>
            </div>
            <Trophy className="text-green-500" size={24} />
          </div>
          <button className="w-full flex items-center gap-4 px-4 py-3 text-neutral-500 hover:text-rose-500 transition">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}