import React, { useEffect, useState } from "react";
import { 
  Calendar, FileSpreadsheet, Upload, ClipboardCheck, ArrowUpRight, 
  Search, CheckCircle2, Clock, Check, X, AlertTriangle, HelpCircle, ShieldAlert
} from "lucide-react";
import { Attendance, Employee, User } from "../types.ts";

interface AttendanceViewProps {
  currentUser: User;
}

export default function AttendanceView({ currentUser }: AttendanceViewProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Month selector for reporting and simulation
  const [monthYear, setMonthYear] = useState("2026-06");
  const [selectedReport, setSelectedReport] = useState<"daily" | "late" | "absent" | "summary">("daily");

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { "Authorization": currentUser.id };
      
      const [attRes, empRes] = await Promise.all([
        fetch("/api/attendance", { headers }),
        fetch("/api/employees", { headers })
      ]);

      const attData = await attRes.json();
      const empData = await empRes.json();

      if (!attRes.ok) throw new Error(attData.error || "Failed to load attendance logs");
      
      setAttendance(attData);
      setEmployees(empData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const handleRunSimulation = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/attendance/import-simulation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": currentUser.id
        },
        body: JSON.stringify({ monthYear })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(data.message);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogManualCheckIn = async (empId: string, status: Attendance["status"], late: boolean) => {
    setError(null);
    setSuccess(null);
    const todayStr = "2026-06-23"; // Seed date alignment
    try {
      const res = await fetch("/api/attendance/check-in-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": currentUser.id
        },
        body: JSON.stringify({
          employeeId: empId,
          date: todayStr,
          status,
          lateComing: late,
          checkIn: status !== "Absent" ? (late ? "09:40" : "09:10") : undefined,
          checkOut: status !== "Absent" ? "18:05" : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save attendance logs");
      
      setSuccess(`Updated attendance log for ${employees.find(e => e.id === empId)?.fullName}`);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter and report selectors
  const filteredAttendanceByMonth = attendance.filter(a => a.date.startsWith(monthYear));

  // Reports Computations
  const getDailyRoster = () => {
    // Show logs on the operation date: 2026-06-23
    const targetDate = `${monthYear}-23`;
    return employees.map(emp => {
      const log = filteredAttendanceByMonth.find(a => a.employeeId === emp.id && a.date === targetDate);
      return { emp, log };
    });
  };

  const getLateComingReport = () => {
    return filteredAttendanceByMonth
      .filter(a => a.lateComing)
      .map(a => ({
        log: a,
        emp: employees.find(e => e.id === a.employeeId)
      }))
      .filter(x => x.emp !== undefined);
  };

  const getAbsentReport = () => {
    return filteredAttendanceByMonth
      .filter(a => a.status === "Absent")
      .map(a => ({
        log: a,
        emp: employees.find(e => e.id === a.employeeId)
      }))
      .filter(x => x.emp !== undefined);
  };

  const getMonthlySummaryReport = () => {
    return employees.map(emp => {
      const logs = filteredAttendanceByMonth.filter(a => a.employeeId === emp.id);
      const totalDays = logs.length;
      const present = logs.filter(a => a.status === "Present" || a.status === "WFH").length;
      const absent = logs.filter(a => a.status === "Absent").length;
      const halfDays = logs.filter(a => a.status === "Half-Day").length;
      const late = logs.filter(a => a.lateComing).length;
      
      return {
        emp,
        totalDays,
        present,
        absent,
        halfDays,
        late
      };
    });
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Messages */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold">{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm flex items-center gap-3">
          <X className="w-5 h-5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Control center & Bulk upload simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-md font-bold text-slate-800 tracking-wide">Duty Ledger controls</h3>
          <p className="text-xs text-slate-400 font-medium">
            Select an operational month to run attendance simulations or view statistical HR reports.
          </p>
          <div className="pt-2 flex gap-3">
            <input
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
            />
          </div>
        </div>

        <div className="lg:col-span-8 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" /> Excel / CSV Bulk log upload simulation
            </h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Generate fully-compliant monthly timesheets for all directory members in this tenant. This simulation pre-fills logs to let the Payroll Engine calculate accurate leaves loss-of-pay.
            </p>
          </div>
          
          <button
            onClick={handleRunSimulation}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap self-start md:self-auto"
            id="simulate-bulk-upload-btn"
          >
            <Upload className="w-4 h-4" /> Simulate Bulk Upload
          </button>
        </div>

      </div>

      {/* Report tab selectors */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px" id="attendance-report-tabs">
        {[
          { id: "daily", label: "Today's Check-Ins (June 23)" },
          { id: "summary", label: "Monthly Timesheet Summary" },
          { id: "late", label: "Late Coming Report" },
          { id: "absent", label: "Absent Report" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedReport(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              selectedReport === tab.id 
                ? "border-indigo-500 text-indigo-600 bg-indigo-50/20" 
                : "border-transparent text-slate-400 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Tables rendering */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold">Loading duty metrics...</div>
        ) : selectedReport === "daily" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Employee Code</th>
                  <th className="px-6 py-4">Employee Details</th>
                  <th className="px-6 py-4">Duty Check-In Logs</th>
                  <th className="px-6 py-4">Verification Check</th>
                  <th className="px-6 py-4 text-right">Quick Manual Action</th>
                </tr>
              </thead>
              <tbody>
                {getDailyRoster().map(({ emp, log }) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">{emp.employeeCode}</td>
                    <td className="px-6 py-4">
                      <h4 className="font-bold text-slate-800">{emp.fullName}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{emp.email}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">
                      {log ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Check In: <strong>{log.checkIn || "—"}</strong> | Out: <strong>{log.checkOut || "—"}</strong></span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">Awaiting check-in...</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log ? (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          log.status === "Present" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          log.status === "WFH" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                          log.status === "Half-Day" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                          log.status === "On-Leave" ? "bg-violet-50 text-violet-600 border border-violet-100" :
                          "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {log.status} {log.lateComing && "— Late"}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-400 px-2 py-0.5 rounded-full font-bold">Not Logged</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleLogManualCheckIn(emp.id, "Present", false)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-emerald-100 transition-all cursor-pointer"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleLogManualCheckIn(emp.id, "WFH", false)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-indigo-100 transition-all cursor-pointer"
                        >
                          WFH
                        </button>
                        <button
                          onClick={() => handleLogManualCheckIn(emp.id, "Absent", false)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-rose-100 transition-all cursor-pointer"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleLogManualCheckIn(emp.id, "Present", true)}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-1.5 rounded-md border border-amber-100 transition-all cursor-pointer"
                        >
                          Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedReport === "summary" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Employee Details</th>
                  <th className="px-6 py-4 text-center">Tracked Days</th>
                  <th className="px-6 py-4 text-center">Present / WFH</th>
                  <th className="px-6 py-4 text-center">Half-Days</th>
                  <th className="px-6 py-4 text-center">Late Comings</th>
                  <th className="px-6 py-4 text-center">Days Absent</th>
                </tr>
              </thead>
              <tbody>
                {getMonthlySummaryReport().map(({ emp, totalDays, present, absent, halfDays, late }) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <h4 className="font-bold text-slate-800">{emp.fullName}</h4>
                      <span className="text-xs text-slate-400 font-semibold">{emp.employeeCode}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-slate-500">{totalDays}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-indigo-600">{present}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-amber-600">{halfDays}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-orange-600">{late}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-rose-600">{absent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : selectedReport === "late" ? (
          <div className="overflow-x-auto">
            {getLateComingReport().length > 0 ? (
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Check In</th>
                    <th className="px-6 py-4">Check Out</th>
                    <th className="px-6 py-4">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {getLateComingReport().map(({ log, emp }, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">{log.date}</td>
                      <td className="px-6 py-4">
                        <h4 className="font-bold text-slate-800">{emp?.fullName}</h4>
                        <span className="text-xs text-slate-400 font-semibold">{emp?.employeeCode}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-rose-600 font-bold">{log.checkIn}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.checkOut}</td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-bold">LATE COMER</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-400 font-semibold">
                No late coming infractions flagged for the selected month cycle.
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {getAbsentReport().length > 0 ? (
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Flag</th>
                  </tr>
                </thead>
                <tbody>
                  {getAbsentReport().map(({ log, emp }, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-500">{log.date}</td>
                      <td className="px-6 py-4">
                        <h4 className="font-bold text-slate-800">{emp?.fullName}</h4>
                        <span className="text-xs text-slate-400 font-semibold">{emp?.employeeCode}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full font-bold">LOSS OF PAY</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-400 font-semibold">
                No absent records logged for this month.
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
