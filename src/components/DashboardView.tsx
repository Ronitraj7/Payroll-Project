import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Users, CalendarCheck, FileSpreadsheet, Hourglass, ArrowUpRight, 
  Award, TrendingUp, Sparkles, Plus, Check, FileDown, CheckCircle, CircleAlert, Briefcase, CalendarDays
} from "lucide-react";
import { User } from "../types.ts";

interface DashboardViewProps {
  currentUser: User;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardView({ currentUser, onNavigateToTab }: DashboardViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats", {
        headers: { "Authorization": currentUser.id }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load dashboard metrics");
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [currentUser.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-semibold">Synthesizing real-time HR ledger statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-500 max-w-xl mx-auto mt-12 text-center">
        <CircleAlert className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Analytics Failure</h3>
        <p className="text-sm mt-2">{error}</p>
        <button 
          onClick={fetchStats}
          className="mt-4 bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl text-xs hover:bg-red-200 transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const isEmployee = currentUser.role === "Employee";

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
            Hello, {currentUser.name}!
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            {isEmployee 
              ? "Access your employee ledger, log leaves, and download secure payslips." 
              : "Here's an analytical overview of your company workspace today."}
          </p>
        </div>
        
        <div className="flex gap-2">
          {isEmployee ? (
            <button 
              onClick={() => onNavigateToTab("leaves-emp")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Apply Leave Request
            </button>
          ) : (
            <>
              <button 
                onClick={() => onNavigateToTab("employees")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-slate-250 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Onboard Employee
              </button>
              <button 
                onClick={() => onNavigateToTab("payroll")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/15 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" /> Run Monthly Payroll
              </button>
            </>
          )}
        </div>
      </div>

      {/* ADMIN & HR PERSONA VIEW */}
      {!isEmployee && stats && (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5" id="admin-dashboard-widgets">
            
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl border border-indigo-100">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Headcount</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.totalEmployees}</h3>
                <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">Active Directory</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl border border-indigo-100">
                <CalendarCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Present Today</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.presentToday}</h3>
                <span className="text-[10px] text-indigo-600 font-semibold block mt-0.5">Operational</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="bg-rose-50 text-rose-500 p-3 rounded-xl border border-rose-100">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Absent / Late</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.absentToday} / {stats.lateToday}</h3>
                <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">Check-In Flagged</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-xl border border-amber-100">
                <Hourglass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Leaves</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.pendingLeaves}</h3>
                <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Awaiting Decision</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-200 transition-all sm:col-span-2 lg:col-span-1 shadow-sm">
              <div className="bg-violet-50 text-violet-600 p-3 rounded-xl border border-violet-100">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">May Net Cost</span>
                <h3 className="text-xl font-extrabold text-slate-800 mt-0.5">{formatCurrency(stats.payrollCost)}</h3>
                <span className="text-[10px] text-violet-600 font-semibold block mt-0.5">Statutory Locked</span>
              </div>
            </div>

          </div>

          {/* Analytical Charts and Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* SVG Attendance Bar Chart */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-md font-bold text-slate-800 tracking-wide">Daily Attendance Summary</h3>
                  <p className="text-xs text-slate-400">Analysis for previous operational cycle</p>
                </div>
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>

              {/* Render dynamic SVG attendance bar graphs */}
              <div className="h-60 flex items-end justify-between gap-3 px-4 pt-4 border-b border-slate-200 pb-2">
                {stats.attendanceTrend?.map((trend: any, idx: number) => {
                  const maxVal = Math.max(...stats.attendanceTrend.map((t: any) => t.present + t.absent));
                  const presentHeight = maxVal > 0 ? (trend.present / maxVal) * 160 : 0;
                  const absentHeight = maxVal > 0 ? (trend.absent / maxVal) * 160 : 0;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center group relative">
                      
                      {/* Tooltip */}
                      <div className="absolute -top-12 bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1 text-[10px] text-slate-200 opacity-0 group-hover:opacity-100 transition-all shadow-xl z-10 pointer-events-none whitespace-nowrap">
                        Present: <strong>{trend.present}</strong> | Absent: <strong>{trend.absent}</strong>
                      </div>

                      {/* Stacked bars */}
                      <div className="w-full max-w-[28px] flex flex-col justify-end h-44 gap-1">
                        <div 
                          className="bg-indigo-500 rounded-t-md hover:bg-indigo-600 transition-all cursor-pointer" 
                          style={{ height: `${presentHeight || 5}px` }}
                        ></div>
                        {trend.absent > 0 && (
                          <div 
                            className="bg-rose-400 rounded-b-md hover:bg-rose-500 transition-all cursor-pointer" 
                            style={{ height: `${absentHeight || 5}px` }}
                          ></div>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-semibold mt-3">{trend.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                  <span>Present / WFH</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-rose-400 rounded-full"></div>
                  <span>Absent</span>
                </div>
              </div>
            </div>

            {/* Department-wise Salary distribution */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <h3 className="text-md font-bold text-slate-800 tracking-wide mb-6">Financial Allocation</h3>
              <div className="space-y-4">
                {stats.departmentDistribution?.map((dept: any, idx: number) => {
                  const maxCost = Math.max(...stats.departmentDistribution.map((d: any) => d.value));
                  const pct = maxCost > 0 ? (dept.value / maxCost) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">{dept.name}</span>
                        <span className="font-bold text-indigo-600">{formatCurrency(dept.value)} / mo</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-250">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 animate-pulse" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong>AI Insights:</strong> Engineering allocation represents the highest resource utilization. 
                  Use <strong>Payroll AI Assistant</strong> to predict upcoming budget trends and analyze individual anomalies.
                </p>
              </div>
            </div>

          </div>

          {/* Recent Registrations/Employees and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recent Employees */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-md font-bold text-slate-800 tracking-wide">Recently Onboarded Employees</h3>
                  <p className="text-xs text-slate-400">Newly added payroll records awaiting payroll calculation</p>
                </div>
                <button 
                  onClick={() => onNavigateToTab("employees")}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All Directory <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200/80">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Joined Date</th>
                      <th className="px-4 py-3 text-right">Gross Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentEmployees?.map((emp: any) => (
                      <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all">
                        <td className="px-4 py-3.5 font-mono text-xs text-indigo-600 font-bold">{emp.employeeCode}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-800">{emp.fullName}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{emp.email}</td>
                        <td className="px-4 py-3.5 text-xs text-slate-500">{emp.dateOfJoining}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-slate-800">{formatCurrency(emp.salary)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions / Integration Status */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-md font-bold text-slate-800 tracking-wide mb-4">SaaS Integrations Status</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">Razorpay API Gateway</h4>
                        <span className="text-[10px] text-slate-400 font-medium">B2B Core Ledger</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-md font-mono font-bold border border-indigo-100">OK</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">Google Gemini API</h4>
                        <span className="text-[10px] text-slate-400 font-medium">Insights Reasoning Engine</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-md font-mono font-bold border border-indigo-100">OK</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">Secure Audit Logs</h4>
                        <span className="text-[10px] text-slate-400 font-medium">Database Isolation Shield</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-md font-mono font-bold border border-indigo-100">ACTIVE</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-150 mt-6 text-[10px] text-slate-400 font-semibold leading-relaxed flex items-center gap-2">
                <CheckCircle className="w-4.5 h-4.5 text-indigo-500/60 flex-shrink-0" />
                <span>PayFlow multi-tenancy rules isolation is certified under security controls.</span>
              </div>

            </div>

          </div>
        </>
      )}

      {/* EMPLOYEE PORTAL VIEW */}
      {isEmployee && stats && (
        <>
          {/* Welcome Card banner */}
          <div className="bg-gradient-to-r from-indigo-500/10 via-slate-50 to-indigo-500/5 border border-slate-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Employee Workspace Portal</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Your Salary is Managed Securely with PayFlow AI</h3>
              <p className="text-xs text-slate-500 max-w-xl font-medium">
                Track real-time attendance logs, request casual or medical leaves, view monthly allowances, 
                and securely download your corporate payslips PDF.
              </p>
            </div>
            
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center min-w-[140px] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Gross Salary</span>
              <h4 className="text-lg font-extrabold text-slate-800 mt-1">{formatCurrency(stats.profile?.salary || 0)}</h4>
              <span className="text-[10px] text-indigo-600 font-bold block mt-1">Direct Transfer</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="employee-dashboard-widgets">
            
            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl border border-indigo-100">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attendance Rate</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.attendancePct}%</h3>
                <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">This Month</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl border border-indigo-100">
                <Hourglass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Casual Leave Left</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.leaveBalance?.casual || 0} / 12</h3>
                <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">Approved: {stats.leavesUsed?.casual || 0}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="bg-rose-50 text-rose-500 p-3 rounded-xl border border-rose-100">
                <Hourglass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sick Leave Left</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.leaveBalance?.sick || 0} / 10</h3>
                <span className="text-[10px] text-rose-500 font-bold block mt-0.5">Approved: {stats.leavesUsed?.sick || 0}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-200 transition-all shadow-sm">
              <div className="bg-amber-50 text-amber-600 p-3 rounded-xl border border-amber-100">
                <Hourglass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Earned Leave Left</span>
                <h3 className="text-2xl font-extrabold text-slate-800 mt-0.5">{stats.leaveBalance?.earned || 0} / 15</h3>
                <span className="text-[10px] text-amber-600 font-bold block mt-0.5">Approved: {stats.leavesUsed?.earned || 0}</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Salary Trend Chart */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-md font-bold text-slate-800 tracking-wide">Net Pay History</h3>
                  <p className="text-xs text-slate-400">Monthly net earnings disbursed after deductions</p>
                </div>
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>

              {/* Salary trends SVG */}
              <div className="h-52 flex items-end justify-around gap-4 border-b border-slate-200 pb-2 bg-slate-50/50 rounded-2xl p-4">
                {stats.salaryHistory?.length > 0 ? (
                  stats.salaryHistory.map((hist: any, idx: number) => {
                    const maxSal = Math.max(...stats.salaryHistory.map((s: any) => s.salary));
                    const barHeight = maxSal > 0 ? (hist.salary / maxSal) * 140 : 0;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center max-w-[50px] group relative">
                        <div className="absolute -top-10 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-all shadow-xl z-10 pointer-events-none whitespace-nowrap">
                          {formatCurrency(hist.salary)}
                        </div>
                        <div 
                          className="bg-indigo-500 w-full rounded-t-lg hover:bg-indigo-600 transition-all cursor-pointer shadow-md shadow-indigo-500/5"
                          style={{ height: `${barHeight}px` }}
                        ></div>
                        <span className="text-xs text-slate-500 font-semibold mt-3">{hist.month}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                    No closed payroll records found yet.
                  </div>
                )}
              </div>
            </div>

            {/* Payslips lists */}
            <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
              <h3 className="text-md font-bold text-slate-800 tracking-wide mb-4">Secure Corporate Payslips</h3>
              <p className="text-xs text-slate-400 mb-6">Download your officially sealed salary slips in PDF layout</p>

              <div className="space-y-3">
                {stats.payslips?.length > 0 ? (
                  stats.payslips.map((pay: any) => (
                    <div 
                      key={pay.id}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-150 rounded-2xl hover:border-indigo-150 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl border border-indigo-100">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">Payslip - Month: {pay.monthYear}</h4>
                          <span className="text-[10px] text-indigo-600 font-bold">Net Received: {formatCurrency(pay.netSalary)}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          alert(`Downloading Pay Slip for ${pay.monthYear}...\nTotal Gross Deductions: ${formatCurrency(pay.pf + pay.esic + pay.professionalTax + pay.tds + pay.leaveDeductions)}\nNet Salary Credit: ${formatCurrency(pay.netSalary)}`);
                        }}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-250 rounded-xl text-slate-600 hover:text-slate-800 transition-all cursor-pointer"
                        title="Download Payslip PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                    No generated payslips available yet for this month.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Attendance History list */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-md font-bold text-slate-800 tracking-wide mb-6">Your Recent Check-In Records</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Log Date</th>
                    <th className="px-4 py-3">Logged Check In</th>
                    <th className="px-4 py-3">Logged Check Out</th>
                    <th className="px-4 py-3">Duty Status</th>
                    <th className="px-4 py-3 text-right">Anomalies</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.attendanceLogs?.map((log: any) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all">
                      <td className="px-4 py-3 font-bold text-slate-800">{log.date}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.checkIn || "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.checkOut || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          log.status === "Present" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          log.status === "WFH" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                          log.status === "Half-Day" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          log.status === "On-Leave" ? "bg-violet-50 text-violet-600 border border-violet-100" :
                          "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {log.lateComing ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                            Late Inward
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400">Perfect Check-In</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
