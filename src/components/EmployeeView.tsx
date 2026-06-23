import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  Users, Plus, Search, Edit2, Trash2, Mail, Phone, MapPin, 
  CreditCard, Calendar, UploadCloud, CheckCircle2, UserCheck, X, FileText, Landmark
} from "lucide-react";
import { Employee, Department, Designation, User } from "../types.ts";

interface EmployeeViewProps {
  currentUser: User;
}

export default function EmployeeView({ currentUser }: EmployeeViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Modals / Form states
  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [salary, setSalary] = useState("");
  const [pan, setPan] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Document Upload State Simulation
  const [showDocUpload, setShowDocUpload] = useState<string | null>(null); // employee ID
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, string[]>>({}); // empId: [docNames]

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { "Authorization": currentUser.id };
      
      const [empRes, deptRes, desigRes] = await Promise.all([
        fetch("/api/employees", { headers }),
        fetch("/api/departments", { headers }),
        fetch("/api/designations", { headers })
      ]);

      const empData = await empRes.json();
      const deptData = await deptRes.json();
      const desigData = await desigRes.json();

      if (!empRes.ok) throw new Error(empData.error || "Failed to load employees");
      
      setEmployees(empData);
      setDepartments(deptData);
      setDesignations(desigData);

      // Pre-select first options
      if (deptData.length > 0) setDepartmentId(deptData[0].id);
      if (desigData.length > 0) setDesignationId(desigData[0].id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const openAddForm = () => {
    setEditingEmp(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setSalary("");
    setPan("");
    setAadhar("");
    setBankAccount("");
    setBankName("");
    setBankIfsc("");
    setDateOfJoining(new Date().toISOString().split("T")[0]);
    if (departments.length > 0) setDepartmentId(departments[0].id);
    if (designations.length > 0) setDesignationId(designations[0].id);
    setShowForm(true);
  };

  const openEditForm = (emp: Employee) => {
    setEditingEmp(emp);
    setFullName(emp.fullName);
    setEmail(emp.email);
    setPhone(emp.phone);
    setAddress(emp.address);
    setSalary(emp.salary.toString());
    setPan(emp.pan);
    setAadhar(emp.aadhar);
    setBankAccount(emp.bankDetails?.accountNo || "");
    setBankName(emp.bankDetails?.bankName || "");
    setBankIfsc(emp.bankDetails?.ifsc || "");
    setDateOfJoining(emp.dateOfJoining);
    setDepartmentId(emp.departmentId);
    setDesignationId(emp.designationId);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      fullName, email, phone, address, departmentId, designationId,
      dateOfJoining, salary: Number(salary), pan, aadhar,
      bankAccount, bankName, bankIfsc
    };

    try {
      const url = editingEmp ? `/api/employees/${editingEmp.id}` : "/api/employees";
      const method = editingEmp ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": currentUser.id
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save employee profile");

      setSuccess(editingEmp ? "Employee updated successfully!" : "Employee registered and portal user created successfully! Portal login credentials - Password: 'Pass123'");
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee? This will also terminate their self-service login.")) return;
    setError(null);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
        headers: { "Authorization": currentUser.id }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete employee");
      setSuccess("Employee deleted successfully.");
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSimulateUpload = (empId: string, docType: string) => {
    const list = uploadedDocs[empId] || [];
    if (list.includes(docType)) {
      alert(`${docType} is already uploaded for this employee.`);
      return;
    }
    const newList = [...list, docType];
    setUploadedDocs({ ...uploadedDocs, [empId]: newList });
    setSuccess(`Successfully verified and uploaded: ${docType}`);
  };

  const deptMap = new Map(departments.map(d => [d.id, d.name]));
  const desigMap = new Map(designations.map(d => [d.id, d.name]));

  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Directory Search & Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Employee Code, Name, or Email..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold"
            id="employee-search-bar"
          />
        </div>

        <button
          onClick={openAddForm}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start md:self-auto"
          id="add-employee-trigger-btn"
        >
          <Plus className="w-4 h-4" /> Add New Employee
        </button>
      </div>

      {/* Directory List Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-semibold">Loading Directory records...</div>
        ) : filteredEmployees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Employee Code</th>
                  <th className="px-6 py-4">Employee Profile Details</th>
                  <th className="px-6 py-4">Org Department / Designation</th>
                  <th className="px-6 py-4">Document Verification</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-all" id={`employee-row-${emp.id}`}>
                    <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">
                      {emp.employeeCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm select-none">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 leading-snug">{emp.fullName}</h4>
                          <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-semibold">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50/60 px-2.5 py-1 rounded-md border border-indigo-100 inline-block">
                          {deptMap.get(emp.departmentId) || "No Dept"}
                        </span>
                        <p className="text-xs text-slate-400 font-semibold">{desigMap.get(emp.designationId) || "No Designation"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <button 
                          onClick={() => setShowDocUpload(showDocUpload === emp.id ? null : emp.id)}
                          className="text-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer font-bold"
                        >
                          <UploadCloud className="w-3 h-3 text-indigo-600" /> Upload / Docs
                        </button>
                        
                        {(uploadedDocs[emp.id] || []).map((doc, i) => (
                          <span key={i} className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                            <FileText className="w-2.5 h-2.5" /> {doc}
                          </span>
                        ))}
                      </div>

                      {showDocUpload === emp.id && (
                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                          <span className="text-[10px] text-slate-500 font-bold block">Simulate Document Verification upload:</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {["Aadhar Card", "PAN Card", "Salary Slip Proof", "Signed Agreement"].map((doc) => (
                              <button
                                key={doc}
                                onClick={() => handleSimulateUpload(emp.id, doc)}
                                className="text-[10px] bg-white hover:bg-indigo-600 hover:text-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md transition-all cursor-pointer font-semibold"
                              >
                                + {doc}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(emp)}
                          className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-800 rounded-lg hover:border-slate-300 transition-all cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="p-2 bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 font-semibold">
            No employees matching your search keyword were found in the tenant roster.
          </div>
        )}
      </div>

      {/* Slide-over/Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-end z-50 animate-fade-in" id="employee-form-modal">
          <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {editingEmp ? "Edit Employee Profile" : "Onboard New Employee"}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-semibold">Provide statutory parameters & allowances</p>
                </div>
                <button 
                  onClick={() => setShowForm(false)}
                  className="p-2 bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Core Personal Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-200 pb-1">Personal Ledger</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Full Name</label>
                      <input
                        type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Work Email</label>
                      <input
                        type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="ramesh@company.com"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Phone Contact</label>
                      <input
                        type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 99887 76655"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Mailing Address</label>
                      <input
                        type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                        placeholder="Noida Sect 63, India"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Corporate Placement & Salary */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-200 pb-1">Corporate Placement</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Department</label>
                      <select 
                        value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                      >
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Designation</label>
                      <select 
                        value={designationId} onChange={(e) => setDesignationId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                      >
                        {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Monthly Gross Salary (INR)</label>
                      <input
                        type="number" required value={salary} onChange={(e) => setSalary(e.target.value)}
                        placeholder="80000"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Date of Joining</label>
                      <input
                        type="date" required value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Income Tax PAN Number</label>
                      <input
                        type="text" value={pan} onChange={(e) => setPan(e.target.value)}
                        placeholder="ABCDE1234F"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Bank Ledger */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-200 pb-1">Bank Disbursal Ledger</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Account Number</label>
                      <input
                        type="text" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}
                        placeholder="501002345678"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Bank Name</label>
                      <input
                        type="text" value={bankName} onChange={(e) => setBankName(e.target.value)}
                        placeholder="HDFC Bank"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">IFSC Routing Code</label>
                      <input
                        type="text" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)}
                        placeholder="HDFC0000001"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 font-bold mb-1.5">Aadhar UIDAI Number</label>
                      <input
                        type="text" value={aadhar} onChange={(e) => setAadhar(e.target.value)}
                        placeholder="1234 5678 9012"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-indigo-500 transition-all font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end pt-6 border-t border-slate-200">
                  <button
                    type="button" onClick={() => setShowForm(false)}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-200 transition-all cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all cursor-pointer"
                    id="employee-save-btn"
                  >
                    Confirm & Save Profile
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
