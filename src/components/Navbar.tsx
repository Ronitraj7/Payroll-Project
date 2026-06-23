import React from "react";
import { HelpCircle, Calendar, Sparkles, LogOut, Moon, Sun } from "lucide-react";
import { User } from "../types.ts";

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  activeTabName: string;
}

export default function Navbar({ currentUser, onLogout, activeTabName }: NavbarProps) {
  return (
    <header className="h-16 border-b border-slate-250 bg-white flex items-center justify-between px-8 sticky top-0 z-10 w-full font-sans" id="payflow-header">
      <div className="flex items-center gap-2">
        <h1 className="text-md font-extrabold text-slate-800 tracking-tight">{activeTabName}</h1>
      </div>

      <div className="flex items-center gap-6">
        
        {/* Real-time operational simulator date indicator */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-semibold">
          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
          <span>Simulation Date: <strong className="text-slate-800 font-extrabold">June 23, 2026</strong></span>
        </div>

        {/* AI status badge */}
        <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs px-3 py-1.5 rounded-xl font-extrabold font-mono">
          <Sparkles className="w-3 h-3 animate-pulse" />
          <span>AI Active</span>
        </div>

        {/* Support Help */}
        <button 
          title="System Documentation & API Reference"
          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer hidden sm:block"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Quick logout */}
        <button 
          onClick={onLogout}
          title="Sign Out Session"
          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer block md:hidden"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
