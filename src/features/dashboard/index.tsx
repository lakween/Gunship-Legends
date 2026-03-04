"use client";
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import StatsHeader from "./components/StatsHeader";
import GameBoard from "./components/ProfileDetails";
import Leaderboard from "./components/Leaderboard";
import { Menu } from "lucide-react";
import ProfileDetails from "./components/ProfileDetails";
import FlappyBird from "../flappy-bird";


export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display flex overflow-hidden">

      <ProfileDetails />

      <FlappyBird />

      <Leaderboard />
    </div>
  )
}