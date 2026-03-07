"use client";
import { useState } from "react";
import GunshipLegend from "../game";
import ProfileDetails from "./components/ProfileDetails";
import Leaderboard from "./components/Leaderboard";

type Tab = "profile" | "game" | "leaderboard";

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("game");

  return (
    <div className="flex h-[calc(100vh - 1000px)] w-screen lg:w-full overflow-hidden bg-background-dark lg:contain-content">

      {/* ── Desktop: sidebars always visible ── */}
      <ProfileDetails />

      {/* ── Center: game ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border-dark bg-background-dark shrink-0">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-2xl">playing_cards</span>
            <span className="text-lg font-bold tracking-tight text-primary">
              Gunship <span className="font-light">Legend</span>
            </span>
          </div>
        </div>

        {/* Game area — hidden on mobile when other tabs active */}
        <div className={`flex-1 overflow-hidden  ${tab !== "game" ? "hidden lg:flex" : "flex"}`}>
          <GunshipLegend />
        </div>

        {/* Mobile: Profile panel */}
        {tab === "profile" && (
          <div className="flex-1 overflow-y-auto lg:hidden bg-background-dark">
            <MobileProfile />
          </div>
        )}

        {/* Mobile: Leaderboard panel */}
        {tab === "leaderboard" && (
          <div className="flex-1 overflow-y-auto lg:hidden bg-background-dark">
            <MobileLeaderboard />
          </div>
        )}

        {/* ── Mobile bottom tab bar ── */}
        <nav className="lg:hidden flex border-t border-border-dark bg-background-dark shrink-0 z-50">
          {([
            { id: "profile", icon: "person", label: "Profile" },
            { id: "game", icon: "sports_esports", label: "Play" },
            { id: "leaderboard", icon: "trophy", label: "Leaderboard" },
          ] as { id: Tab; icon: string; label: string }[]).map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors
                ${tab === id
                  ? "text-primary border-t-2 border-primary -mt-px"
                  : "text-secondary border-t-2 border-transparent -mt-px"}`}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      </main>

      <Leaderboard />
    </div>
  );
}

// ── Lightweight mobile wrappers (remove the hidden lg:flex from the asides) ──

function MobileProfile() {
  // Re-uses all ProfileDetails logic but shown inline on mobile
  return <ProfileDetails mobile />;
}

function MobileLeaderboard() {
  return <Leaderboard mobile />;
}