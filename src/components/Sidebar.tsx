import React from "react";
import { 
  LayoutDashboard, Users, CalendarCheck, FileSpreadsheet, 
  Settings, Bot, CreditCard, LogOut, Coffee, ShieldAlert 
} from "lucide-react";
import { User } from "../types.ts";

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  companyName: string;
}

export default function Sidebar({ currentUser, activeTab, setActiveTab, onLogout, companyName }: SidebarProps) {
  const isAdminOrHR = currentUser.role === "Company Admin" || currentUser.role === "HR Manager";

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(isAdminOrHR ? [
      { id: "employees", label: "Employee Directory", icon: Users },
      { id: "attendance", label: "Attendance Log", icon: CalendarCheck },
      { id: "leaves", label: "Leave Requests", icon: Coffee },
      { id: "payroll", label: "Payroll Engine", icon: FileSpreadsheet },
    ] : [
      { id: "attendance-emp", label: "My Attendance", icon: CalendarCheck },
      { id: "leaves-emp", label: "My Leaves", icon: Coffee },
    ]),
    { id: "ai-assistant", label: "Payroll AI Assistant", icon: Bot },
    ...(currentUser.role === "Company Admin" ? [
      { id: "billing", label: "Subscription Billing", icon: CreditCard },
    ] : [])
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen fixed top-0 left-0 z-20 font-sans" id="payflow-sidebar">
      <div>
        {/* Logo and Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-md shadow-indigo-500/10">
            P
          </div>
          <div className="truncate">
            <h2 className="text-md font-bold text-white tracking-wide">PAYFLOW <span className="text-indigo-400">AI</span></h2>
            <p className="text-xs text-slate-400 truncate mt-0.5">{companyName}</p>
          </div>
        </div>

        {/* User context info block */}
        <div className="px-4 py-4 border-b border-slate-800/60">
          <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/40 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm select-none">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate">
              <h4 className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</h4>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-semibold px-2 py-0.5 rounded-md inline-block mt-1">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav className="p-4 space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left ${
                  isActive 
                    ? "bg-indigo-600/15 border-l-2 border-indigo-500 text-indigo-400 rounded-r-none" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer text-left"
          id="logout-btn"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out Session
        </button>
      </div>
    </aside>
  );
}
