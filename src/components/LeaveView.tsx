import React, { useEffect, useState } from "react";
import { 
  Coffee, Calendar, CheckCircle2, XCircle, Clock, 
  Plus, Check, X, User, CircleHelp, AlertCircle, Sparkles
} from "lucide-react";
import { LeaveApplication, Employee, User as UserType } from "../types.ts";

interface LeaveViewProps {
  currentUser: UserType;
}

export default function LeaveView({ currentUser }: LeaveViewProps) {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [leaveType, setLeaveType] = useState<"Casual Leave" | "Sick Leave" | "Earned Leave">("Casual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const isAdminOrHR = currentUser.role === "Company Admin" || currentUser.role === "HR Manager";

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { "Authorization": currentUser.id };
      
      const [leavesRes, empRes] = await Promise.all([
        fetch("/api/leaves", { headers }),
        fetch("/api/employees", { headers })
      ]);

      const leavesData = await leavesRes.json();
      const empData = await empRes.json();

      if (!leavesRes.ok) throw new Error(leavesData.error || "Failed to load leave log");
      
      setLeaves(leavesData);
      setEmployees(empData);
      
      if (empData.length > 0) {
        setSelectedEmpId(empData[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      employeeId: isAdminOrHR ? selectedEmpId : (currentUser.employeeId || "emp-1"),
      leaveType,
      startDate,
      endDate,
      reason
    };

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": currentUser.id
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit leave application");

      setSuccess("Leave application submitted successfully!");
      setShowApplyModal(false);
      setReason("");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDecision = async (id: string, status: "Approved" | "Rejected") => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/leaves/${id}/approve-reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": currentUser.id
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess(`Leave request successfully ${status.toLowerCase()}!`);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getEmployeeName = (id: string) => {
    return employees.find(e => e.id === id)?.fullName || "Unknown";
  };

  const getEmployeeCode = (id: string) => {
    return employees.find(e => e.id === id)?.employeeCode || "—";
  };

  // Filter based on user profile
  const filteredLeaves = isAdminOrHR 
    ? leaves 
    : leaves.filter(l => l.employeeId === currentUser.employeeId);

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
          <AlertCircle className="w-5 h-5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Roster Balance indicators & Form Launcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
        <div className="space-y-1">
          <h3 className="text-md font-bold text-slate-800 tracking-wide">Leave Ledger Directory</h3>
          <p className="text-xs text-slate-400 font-medium">
            {isAdminOrHR 
              ? "Approve, reject, and review active leave requests from company employees." 
              : "Review your personal leave history and request casual/medical absences."}
          </p>
        </div>

        <button
          onClick={() => {
            setStartDate(new Date().toISOString().split("T")[0]);
            setEndDate(new Date().toISOString().split("T")[0]);
            setShowApplyModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start md:self-auto"
          id="apply-leave-trigger-btn"
        >
          <Plus className="w-4 h-4" /> Request Leave
        </button>
      </div>

      {/* Leave request list table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold">Loading leaves ledger...</div>
        ) : filteredLeaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  {isAdminOrHR && <th className="px-6 py-4">Employee</th>}
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Duration Range</th>
                  <th className="px-6 py-4">Reason Statement</th>
                  <th className="px-6 py-4">Status Check</th>
                  {isAdminOrHR && <th className="px-6 py-4 text-right">Approval Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((lv) => (
                  <tr key={lv.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all" id={`leave-row-${lv.id}`}>
                    {isAdminOrHR && (
                      <td className="px-6 py-4">
                        <h4 className="font-bold text-slate-800 leading-tight">{getEmployeeName(lv.employeeId)}</h4>
                        <span className="text-[10px] text-indigo-600 font-mono font-bold">{getEmployeeCode(lv.employeeId)}</span>
                      </td>
                    )}
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {lv.leaveType}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {lv.startDate} to {lv.endDate}
                    </td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate text-slate-500" title={lv.reason}>
                      {lv.reason || <span className="italic text-slate-400">No reason specified</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit ${
                        lv.status === "Approved" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                        lv.status === "Rejected" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                        "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}>
                        {lv.status === "Approved" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {lv.status === "Rejected" && <XCircle className="w-3.5 h-3.5" />}
                        {lv.status === "Pending" && <Clock className="w-3.5 h-3.5 animate-spin" />}
                        {lv.status}
                      </span>
                    </td>
                    {isAdminOrHR && (
                      <td className="px-6 py-4 text-right">
                        {lv.status === "Pending" ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleDecision(lv.id, "Approved")}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-1.5 border border-emerald-100 rounded-lg transition-all cursor-pointer"
                              title="Approve Absence"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDecision(lv.id, "Rejected")}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 p-1.5 border border-rose-100 rounded-lg transition-all cursor-pointer"
                              title="Reject Absence"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-semibold">Decision complete</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 font-semibold">
            No active leave logs or pending absence requests were found in this sector.
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="apply-leave-modal">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Apply Absence Request</h3>
                <p className="text-xs text-slate-400 mt-1 font-semibold">Submit date parameters for administrative review</p>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              
              {isAdminOrHR && (
                <div>
                  <label className="block text-xs text-slate-500 font-bold mb-1.5">Apply on behalf of Employee</label>
                  <select 
                    value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                  >
                    {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-500 font-bold mb-1.5">Absence Category</label>
                <select 
                  value={leaveType} onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                >
                  <option value="Casual Leave">Casual Leave (General Absence)</option>
                  <option value="Sick Leave">Sick Leave (Medical/Appointment)</option>
                  <option value="Earned Leave">Earned Leave (Privileged Annual Leave)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 font-bold mb-1.5">Start Date</label>
                  <input
                    type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 font-bold mb-1.5">End Date</label>
                  <input
                    type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 font-bold mb-1.5">Justification Reason</label>
                <textarea
                  required value={reason} onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Dental cleaning or local travel..." rows={3}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none font-semibold placeholder:text-slate-300"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button" onClick={() => setShowApplyModal(false)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-4 py-2 rounded-xl text-xs border border-slate-200 transition-all cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                  id="submit-leave-btn"
                >
                  Request Absences
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
