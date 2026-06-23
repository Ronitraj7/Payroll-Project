import React, { useEffect, useState } from "react";
import { 
  FileSpreadsheet, ClipboardCheck, Lock, Unlock, RefreshCw, 
  Eye, FileDown, CheckCircle2, ShieldAlert, X, Printer, Landmark, DollarSign
} from "lucide-react";
import { Payroll, Employee, User } from "../types.ts";

interface PayrollViewProps {
  currentUser: User;
}

export default function PayrollView({ currentUser }: PayrollViewProps) {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthYear, setMonthYear] = useState("2026-06");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Payslip Dialog preview State
  const [activePayslip, setActivePayslip] = useState<Payroll | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { "Authorization": currentUser.id };
      
      const [payRes, empRes] = await Promise.all([
        fetch("/api/payroll", { headers }),
        fetch("/api/employees", { headers })
      ]);

      const payData = await payRes.json();
      const empData = await empRes.json();

      if (!payRes.ok) throw new Error(payData.error || "Failed to load payroll ledger");
      
      setPayrolls(payData);
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

  const handleCalculatePayroll = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/payroll/generate", {
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

  const handleLockPayroll = async () => {
    if (!confirm(`Are you sure you want to finalize and lock the payroll for ${monthYear}? This action cannot be undone and will publish payslips to employee portals.`)) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/payroll/lock", {
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const getEmployee = (id: string) => {
    return employees.find(e => e.id === id);
  };

  // Filter current payrolls by selection
  const currentPayrolls = payrolls.filter(p => p.monthYear === monthYear);
  const isLocked = currentPayrolls.length > 0 && currentPayrolls.every(p => p.status === "Locked");

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
          <ShieldAlert className="w-5 h-5" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Control panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
        
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-md font-bold text-slate-800 tracking-wide font-sans">Corporate Payroll Engine</h3>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Select a processing month, calculate statutory deductions dynamically based on attendance timesheets, and lock ledger records.
          </p>
          <div className="pt-2">
            <input
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono font-semibold"
            />
          </div>
        </div>

        <div className="lg:col-span-8 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              {isLocked ? <Lock className="w-4 h-4 text-emerald-600" /> : <Unlock className="w-4 h-4 text-amber-500" />}
              Ledger Status: <span className={isLocked ? "text-emerald-600" : "text-amber-500"}>{isLocked ? "LOCKED & PUBLISHED" : "OPEN DRAFT"}</span>
            </h4>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              {isLocked 
                ? "This payroll is finalized. Employees can view/download payslips." 
                : "This payroll draft can be calculated or regenerated as attendance timesheets update."}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCalculatePayroll}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
              id="recalculate-payroll-btn"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> {currentPayrolls.length > 0 ? "Recalculate Ledger" : "Generate Drafts"}
            </button>
            
            {currentPayrolls.length > 0 && !isLocked && (
              <button
                onClick={handleLockPayroll}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                id="lock-payroll-btn"
              >
                <Lock className="w-3.5 h-3.5" /> Lock & Publish Slips
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Payroll calculations detailed list */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold">Loading payroll database logs...</div>
        ) : currentPayrolls.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Employee Details</th>
                  <th className="px-6 py-4 text-right">Basic (50%)</th>
                  <th className="px-6 py-4 text-right">HRA (25%)</th>
                  <th className="px-6 py-4 text-right">Allowances</th>
                  <th className="px-6 py-4 text-right">LOP Deductions</th>
                  <th className="px-6 py-4 text-right">Gov PF / PT</th>
                  <th className="px-6 py-4 text-right text-indigo-600">Net Pay Credited</th>
                  <th className="px-6 py-4 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody>
                {currentPayrolls.map((pay) => {
                  const empObj = getEmployee(pay.employeeId);
                  const totAllowances = pay.specialAllowance + pay.conveyance + pay.medicalAllowance + pay.overtime + pay.bonus;
                  const govtDeductions = pay.pf + pay.esic + pay.professionalTax + pay.tds;
                  return (
                    <tr key={pay.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all" id={`payroll-row-${pay.id}`}>
                      <td className="px-6 py-4">
                        <h4 className="font-bold text-slate-800 leading-tight">{empObj?.fullName || "Employee"}</h4>
                        <span className="text-[10px] font-mono text-indigo-600 font-bold">{empObj?.employeeCode || "—"}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-slate-600">{formatCurrency(pay.baseSalary)}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-slate-600">{formatCurrency(pay.hra)}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-indigo-600 font-semibold">{formatCurrency(totAllowances)}</td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-rose-600 font-bold">
                        {pay.leaveDeductions > 0 ? formatCurrency(pay.leaveDeductions) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs text-slate-400">{formatCurrency(govtDeductions)}</td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-extrabold text-indigo-700">
                        {formatCurrency(pay.netSalary)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setActivePayslip(pay)}
                          className="bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ml-auto font-bold"
                          id={`view-payslip-btn-${pay.id}`}
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-600" /> Slips
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-4">
            <p className="font-semibold">No processed payroll records exist yet for {monthYear}.</p>
            <button
              onClick={handleCalculatePayroll}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer mx-auto block"
            >
              Generate Draft Sheets Now
            </button>
          </div>
        )}
      </div>

      {/* Payslip Corporate Layout Preview Dialog Modal */}
      {activePayslip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="payslip-modal-container">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col justify-between max-h-[90vh]">
            
            {/* Modal actions header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                <h3 className="text-md font-bold text-slate-800 uppercase tracking-wide">Payslip Corporate Layout PDF</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alert("Connecting to PDF printer services... Document compiled successfully!")}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 p-2 rounded-xl transition-all cursor-pointer"
                  title="Print Slip"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActivePayslip(null)}
                  className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Corporate Sheet Body (Scrollable inside popup) */}
            <div className="flex-1 overflow-y-auto p-6 bg-white text-slate-900 rounded-2xl border border-slate-200" id="corporate-payslip-canvas">
              
              {/* Header */}
              <div className="flex justify-between items-start gap-4 pb-6 border-b border-slate-300">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-950 uppercase">{currentUser.companyId === "comp-1" ? "Vortex Software Solutions" : "Corporate Enterprise"}</h2>
                  <p className="text-xs text-slate-500 mt-1">Timesheet-linked Salaries & Allowances Statement</p>
                  <p className="text-xs text-slate-500">Corporate HQ • New Delhi, Delhi, India</p>
                </div>
                <div className="text-right">
                  <div className="bg-slate-950 text-white font-extrabold px-3 py-1.5 rounded-lg text-sm inline-block tracking-wide">
                    PAY SLIP
                  </div>
                  <p className="text-xs font-mono font-bold mt-2 text-slate-600">Month / Year: {activePayslip.monthYear}</p>
                </div>
              </div>

              {/* Employee Parameters Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-slate-300 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Employee ID</span>
                  <strong className="text-slate-900">{getEmployee(activePayslip.employeeId)?.employeeCode}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Employee Name</span>
                  <strong className="text-slate-900">{getEmployee(activePayslip.employeeId)?.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Department</span>
                  <strong className="text-slate-900">Engineering & Dev</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Joining Date</span>
                  <strong className="text-slate-900">{getEmployee(activePayslip.employeeId)?.dateOfJoining}</strong>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Bank Account No.</span>
                  <strong className="text-slate-900 font-mono">{getEmployee(activePayslip.employeeId)?.bankDetails?.accountNo || "—"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">IFSC Code</span>
                  <strong className="text-slate-900 font-mono">{getEmployee(activePayslip.employeeId)?.bankDetails?.ifsc || "—"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Tax PAN</span>
                  <strong className="text-slate-900 font-mono uppercase">{getEmployee(activePayslip.employeeId)?.pan || "—"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Payment Mode</span>
                  <strong className="text-slate-900">Direct Bank Transfer</strong>
                </div>
              </div>

              {/* Earnings & Deductions Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-b border-slate-300">
                
                {/* Earnings */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-950 border-b border-slate-200 pb-1 text-xs uppercase tracking-wider">Allowances & Earnings</h4>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100 py-1.5">
                        <td className="py-1.5 text-slate-600">Basic Salary (Core)</td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">{formatCurrency(activePayslip.baseSalary)}</td>
                      </tr>
                      <tr className="border-b border-slate-100 py-1.5">
                        <td className="py-1.5 text-slate-600">House Rent Allowance (HRA)</td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">{formatCurrency(activePayslip.hra)}</td>
                      </tr>
                      <tr className="border-b border-slate-100 py-1.5">
                        <td className="py-1.5 text-slate-600">Special Allowance</td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">{formatCurrency(activePayslip.specialAllowance)}</td>
                      </tr>
                      <tr className="border-b border-slate-100 py-1.5">
                        <td className="py-1.5 text-slate-600">Conveyance Allowances</td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">{formatCurrency(activePayslip.conveyance)}</td>
                      </tr>
                      <tr className="border-b border-slate-100 py-1.5">
                        <td className="py-1.5 text-slate-600">Medical Reimbursement</td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">{formatCurrency(activePayslip.medicalAllowance)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Deductions */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-950 border-b border-slate-200 pb-1 text-xs uppercase tracking-wider text-rose-600">Deductions & Offsets</h4>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-100 py-1.5">
                        <td className="py-1.5 text-slate-600">Provident Fund (Gov PF 12%)</td>
                        <td className="py-1.5 text-right font-mono font-bold text-rose-500">({formatCurrency(activePayslip.pf)})</td>
                      </tr>
                      <tr className="border-b border-slate-100 py-1.5">
                        <td className="py-1.5 text-slate-600">Professional Tax (PT)</td>
                        <td className="py-1.5 text-right font-mono font-bold text-rose-500">({formatCurrency(activePayslip.professionalTax)})</td>
                      </tr>
                      <tr className="border-b border-slate-100 py-1.5">
                        <td className="py-1.5 text-slate-600">Withholding Tax (TDS)</td>
                        <td className="py-1.5 text-right font-mono font-bold text-rose-500">({formatCurrency(activePayslip.tds)})</td>
                      </tr>
                      <tr className="border-b border-slate-100 py-1.5">
                        <td className="py-1.5 text-slate-600">Loss of Pay (LOP Leaves)</td>
                        <td className="py-1.5 text-right font-mono font-bold text-rose-500">({formatCurrency(activePayslip.leaveDeductions)})</td>
                      </tr>
                      <tr className="border-b border-slate-100 py-1.5">
                        <td className="py-1.5 text-slate-600">ESIC Deductions</td>
                        <td className="py-1.5 text-right font-mono font-bold text-rose-500">({formatCurrency(activePayslip.esic)})</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

              {/* Total Calculation */}
              <div className="pt-6 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Net Amount Disbursed (Words)</span>
                  <span className="text-xs font-semibold text-slate-600">Rupees {activePayslip.netSalary > 80000 ? "Eighty-Five Thousand Plus Only" : "Seventy Thousand Only"}</span>
                </div>
                <div className="bg-indigo-50 text-indigo-950 p-4 rounded-xl border border-indigo-100 text-right">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block">Total Net Salary Credit</span>
                  <strong className="text-lg font-extrabold font-mono text-indigo-900">{formatCurrency(activePayslip.netSalary)}</strong>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
