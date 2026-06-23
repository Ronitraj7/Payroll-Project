import React, { useState, useEffect } from "react";
import AuthView from "./components/AuthView.tsx";
import Sidebar from "./components/Sidebar.tsx";
import Navbar from "./components/Navbar.tsx";
import DashboardView from "./components/DashboardView.tsx";
import EmployeeView from "./components/EmployeeView.tsx";
import AttendanceView from "./components/AttendanceView.tsx";
import LeaveView from "./components/LeaveView.tsx";
import PayrollView from "./components/PayrollView.tsx";
import AiView from "./components/AiView.tsx";
import BillingView from "./components/BillingView.tsx";
import { User, Company } from "./types.ts";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);

  // Authenticate user on load
  const checkSession = async () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem("payflow_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser) as User;
        
        // Fetch company profile for tenant information
        const res = await fetch("/api/company/profile", {
          headers: { "Authorization": parsed.id }
        });
        if (res.ok) {
          const compData = await res.json();
          setCurrentUser(parsed);
          setCompanyName(compData.name || "Vortex Software Solutions");
        } else {
          // fallback
          setCurrentUser(parsed);
          setCompanyName("Vortex Software Solutions");
        }
      }
    } catch (err) {
      console.error("Session verification failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleLoginSuccess = async (user: User) => {
    localStorage.setItem("payflow_user", JSON.stringify(user));
    setCurrentUser(user);
    
    // Fetch company name
    try {
      const res = await fetch("/api/company/profile", {
        headers: { "Authorization": user.id }
      });
      if (res.ok) {
        const compData = await res.json();
        setCompanyName(compData.name);
      } else {
        setCompanyName("Vortex Software Solutions");
      }
    } catch (err) {
      setCompanyName("Vortex Software Solutions");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("payflow_user");
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-semibold">Synchronizing secure multi-tenant records...</p>
        </div>
      </div>
    );
  }

  // Not Authenticated screen
  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  const getActiveTabName = () => {
    switch (activeTab) {
      case "dashboard": return "Real-time Operations Analytics";
      case "employees": return "Roster Directory Management";
      case "attendance": return "Timesheet & Duty Controls";
      case "attendance-emp": return "My Shift & Check-In Logs";
      case "leaves": return "Absence Request Ledger";
      case "leaves-emp": return "My Absence Logs";
      case "payroll": return "Corporate Payroll Processing";
      case "ai-assistant": return "Grounded Payroll AI Copilot";
      case "billing": return "Subscribed B2B SaaS Billing";
      default: return "PayFlow AI Portal";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans" id="payflow-authenticated-workspace">
      
      {/* Fixed Sidebar panel */}
      <Sidebar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        companyName={companyName}
      />

      {/* Main viewport area offset by sidebar width (w-64) */}
      <div className="flex-1 min-h-screen ml-64 flex flex-col">
        
        {/* Dynamic header navigation */}
        <Navbar 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          activeTabName={getActiveTabName()} 
        />

        {/* Viewport contents */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
          {activeTab === "dashboard" && (
            <DashboardView currentUser={currentUser} onNavigateToTab={setActiveTab} />
          )}
          {activeTab === "employees" && (
            <EmployeeView currentUser={currentUser} />
          )}
          {(activeTab === "attendance" || activeTab === "attendance-emp") && (
            <AttendanceView currentUser={currentUser} />
          )}
          {(activeTab === "leaves" || activeTab === "leaves-emp") && (
            <LeaveView currentUser={currentUser} />
          )}
          {activeTab === "payroll" && (
            <PayrollView currentUser={currentUser} />
          )}
          {activeTab === "ai-assistant" && (
            <AiView currentUser={currentUser} />
          )}
          {activeTab === "billing" && (
            <BillingView currentUser={currentUser} />
          )}
        </main>
      </div>

    </div>
  );
}
