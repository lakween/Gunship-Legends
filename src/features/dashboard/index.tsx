"use client";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import StatsHeader from "./components/StatsHeader";
import GameBoard from "./components/GameBoard";
import Leaderboard from "./components/Leaderboard";


export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playerData] = useState({ name: "Player One", chips: 5000, wins: 12 });

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col lg:flex-row overflow-x-hidden">
      {/* Mobile Top Header (Only visible on small screens) */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-neutral-900 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">♥</div>
          <span className="font-black tracking-tighter">HEART RUNNER</span>
        </div>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 bg-white/5 rounded-lg"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar - Positioned absolutely on mobile, relative on desktop */}
      <div className={`
        ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0 fixed lg:relative z-50 w-64 h-full transition-transform duration-300
      `}>
        <Sidebar user={playerData} closeMenu={() => setIsMenuOpen(false)} />
      </div>

      {/* Overlay for mobile sidebar */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <main className="flex-1 p-4 lg:p-8 flex flex-col gap-6 w-full max-w-[100vw]">
        <StatsHeader user={playerData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Main Game Area - Takes full width on mobile */}
          <div className="lg:col-span-2 w-full">
            <GameBoard deckId="sample" />
          </div>

          {/* Leaderboard Section - Moves below game on mobile */}
          <div className="lg:col-span-1 w-full">
            <Leaderboard />
          </div>
        </div>
      </main>
    </div>
  );
}