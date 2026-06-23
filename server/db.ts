import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "payflow_db.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Full Database Schema Interfaces
export interface Company {
  id: string;
  name: string;
  emailSuffix: string;
  subscriptionPlan: "Starter" | "Growth" | "Business";
  subscriptionStatus: "Active" | "Trial" | "Expired";
  logoUrl?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Plain-text or base64 for simulation, simple password matching
  role: "Super Admin" | "Company Admin" | "HR Manager" | "Employee";
  companyId: string;
  employeeId?: string; // If employee role
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  companyId: string;
}

export interface Designation {
  id: string;
  name: string;
  companyId: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  departmentId: string;
  designationId: string;
  dateOfJoining: string;
  salary: number; // Monthly gross salary
  pan: string;
  aadhar: string;
  bankDetails: {
    accountNo: string;
    bankName: string;
    ifsc: string;
  };
  companyId: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  status: "Present" | "Absent" | "Half-Day" | "On-Leave" | "WFH";
  lateComing: boolean;
  companyId: string;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  leaveType: "Casual Leave" | "Sick Leave" | "Earned Leave";
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  companyId: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  companyId: string;
}

export interface Payroll {
  id: string;
  monthYear: string; // YYYY-MM
  employeeId: string;
  baseSalary: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  medicalAllowance: number;
  overtime: number;
  bonus: number;
  pf: number;
  esic: number;
  professionalTax: number;
  tds: number;
  leaveDeductions: number;
  netSalary: number;
  status: "Draft" | "Locked";
  companyId: string;
  generatedAt: string;
}

export interface SubscriptionInvoice {
  id: string;
  companyId: string;
  planName: string;
  amount: number;
  razorpayPaymentId: string;
  billingDate: string;
  expiryDate: string;
  status: "Paid" | "Failed";
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  companyId: string;
}

export interface DatabaseSchema {
  companies: Company[];
  users: User[];
  departments: Department[];
  designations: Designation[];
  employees: Employee[];
  attendance: Attendance[];
  leaves: LeaveApplication[];
  holidays: Holiday[];
  payrolls: Payroll[];
  invoices: SubscriptionInvoice[];
  auditLogs: AuditLog[];
}

// Initial Seeds helper
function getInitialSeedData(): DatabaseSchema {
  const companies: Company[] = [
    {
      id: "comp-1",
      name: "Vortex Software Solutions",
      emailSuffix: "vortex.com",
      subscriptionPlan: "Growth",
      subscriptionStatus: "Active",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&h=80&fit=crop",
      createdAt: "2025-01-10T10:00:00.000Z",
    },
    {
      id: "comp-2",
      name: "Acme Digital Agency",
      emailSuffix: "acme.com",
      subscriptionPlan: "Starter",
      subscriptionStatus: "Active",
      logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop",
      createdAt: "2025-03-15T10:00:00.000Z",
    },
    {
      id: "comp-3",
      name: "Zenith AI Corp",
      emailSuffix: "zenithai.com",
      subscriptionPlan: "Business",
      subscriptionStatus: "Active",
      logoUrl: "https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=80&h=80&fit=crop",
      createdAt: "2025-05-20T10:00:00.000Z",
    }
  ];

  const users: User[] = [
    {
      id: "usr-super",
      name: "Super Admin",
      email: "superadmin@payflow.ai",
      passwordHash: "Admin123", // Base hash
      role: "Super Admin",
      companyId: "system",
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "usr-vortex-admin",
      name: "Rajesh Iyer",
      email: "admin@vortex.com",
      passwordHash: "Vortex123",
      role: "Company Admin",
      companyId: "comp-1",
      createdAt: "2025-01-10T12:00:00.000Z",
    },
    {
      id: "usr-vortex-hr",
      name: "Priya Patel",
      email: "priya@vortex.com",
      passwordHash: "Priya123",
      role: "HR Manager",
      companyId: "comp-1",
      employeeId: "emp-2",
      createdAt: "2025-01-15T09:00:00.000Z",
    },
    {
      id: "usr-vortex-emp1",
      name: "Rahul Sharma",
      email: "rahul@vortex.com",
      passwordHash: "Rahul123",
      role: "Employee",
      companyId: "comp-1",
      employeeId: "emp-1",
      createdAt: "2025-01-20T11:00:00.000Z",
    },
    {
      id: "usr-vortex-emp5",
      name: "Siddharth Singh",
      email: "siddharth@vortex.com",
      passwordHash: "Sid123",
      role: "Employee",
      companyId: "comp-1",
      employeeId: "emp-5",
      createdAt: "2026-01-10T10:00:00.000Z",
    }
  ];

  const departments: Department[] = [
    { id: "dept-1", name: "Engineering", companyId: "comp-1" },
    { id: "dept-2", name: "Human Resources", companyId: "comp-1" },
    { id: "dept-3", name: "Product & Design", companyId: "comp-1" },
    { id: "dept-4", name: "Sales & Marketing", companyId: "comp-1" },
  ];

  const designations: Designation[] = [
    { id: "desig-1", name: "Senior Software Engineer", companyId: "comp-1" },
    { id: "desig-2", name: "HR Lead", companyId: "comp-1" },
    { id: "desig-3", name: "Lead UI/UX Designer", companyId: "comp-1" },
    { id: "desig-4", name: "SaaS Sales Executive", companyId: "comp-1" },
    { id: "desig-5", name: "Junior Software Developer", companyId: "comp-1" },
  ];

  const employees: Employee[] = [
    {
      id: "emp-1",
      employeeCode: "PF-101",
      fullName: "Rahul Sharma",
      email: "rahul@vortex.com",
      phone: "+91 98765 43210",
      address: "H-45, Sector 62, Noida, UP, India",
      departmentId: "dept-1",
      designationId: "desig-5",
      dateOfJoining: "2024-01-15",
      salary: 85000,
      pan: "ABCDE1234F",
      aadhar: "1234 5678 9012",
      bankDetails: {
        accountNo: "919876543210",
        bankName: "HDFC Bank Ltd",
        ifsc: "HDFC0001234",
      },
      companyId: "comp-1",
    },
    {
      id: "emp-2",
      employeeCode: "PF-102",
      fullName: "Priya Patel",
      email: "priya@vortex.com",
      phone: "+91 98234 56789",
      address: "Fl-102, Shanti Vihar, Pune, MH, India",
      departmentId: "dept-2",
      designationId: "desig-2",
      dateOfJoining: "2023-05-10",
      salary: 75000,
      pan: "FGHIJ5678K",
      aadhar: "2345 6789 0123",
      bankDetails: {
        accountNo: "501002345678",
        bankName: "ICICI Bank Ltd",
        ifsc: "ICIC0000555",
      },
      companyId: "comp-1",
    },
    {
      id: "emp-3",
      employeeCode: "PF-103",
      fullName: "Amit Kumar",
      email: "amit@vortex.com",
      phone: "+91 95555 12345",
      address: "Apt 4B, Skyview Towers, Bangalore, KA, India",
      departmentId: "dept-1",
      designationId: "desig-1",
      dateOfJoining: "2022-11-01",
      salary: 120000,
      pan: "KLMNO9012L",
      aadhar: "3456 7890 1234",
      bankDetails: {
        accountNo: "100234567890",
        bankName: "State Bank of India",
        ifsc: "SBIN0004321",
      },
      companyId: "comp-1",
    },
    {
      id: "emp-4",
      employeeCode: "PF-104",
      fullName: "Neha Gupta",
      email: "neha@vortex.com",
      phone: "+91 94444 87654",
      address: "12, Rose Gardens, Mumbai, MH, India",
      departmentId: "dept-3",
      designationId: "desig-3",
      dateOfJoining: "2025-02-10",
      salary: 80000,
      pan: "PQRST3456M",
      aadhar: "4567 8901 2345",
      bankDetails: {
        accountNo: "1234567890123",
        bankName: "Axis Bank Ltd",
        ifsc: "UTIB0000123",
      },
      companyId: "comp-1",
    },
    {
      id: "emp-5",
      employeeCode: "PF-105",
      fullName: "Siddharth Singh",
      email: "siddharth@vortex.com",
      phone: "+91 91111 22222",
      address: "C-11, Malviya Nagar, Delhi, India",
      departmentId: "dept-1",
      designationId: "desig-5",
      dateOfJoining: "2026-01-10",
      salary: 45000,
      pan: "UVWXY7890N",
      aadhar: "5678 9012 3456",
      bankDetails: {
        accountNo: "321098765432",
        bankName: "HDFC Bank Ltd",
        ifsc: "HDFC0004321",
      },
      companyId: "comp-1",
    }
  ];

  // Pre-generate rich Attendance for June 2026 (1st to 23rd)
  const attendance: Attendance[] = [];
  const employeesList = ["emp-1", "emp-2", "emp-3", "emp-4", "emp-5"];
  
  for (let day = 1; day <= 23; day++) {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const dateStr = `2026-06-${dayStr}`;
    
    // Skip Sundays
    const d = new Date(dateStr);
    if (d.getDay() === 0) continue; 
    
    employeesList.forEach(empId => {
      let status: Attendance["status"] = "Present";
      let checkIn = "09:10";
      let checkOut = "18:05";
      let late = false;
      
      // Customize Siddharth (emp-5) for absenteeism/late coming
      if (empId === "emp-5") {
        if (day === 3 || day === 12 || day === 18) {
          status = "Absent";
          checkIn = "";
          checkOut = "";
        } else if (day === 5 || day === 15 || day === 22) {
          status = "Half-Day";
          checkIn = "13:30";
          checkOut = "18:10";
          late = true;
        } else if (day === 8 || day === 19) {
          status = "WFH";
          checkIn = "09:00";
          checkOut = "18:00";
        } else if (day % 4 === 0) {
          checkIn = "09:45"; // Late coming
          late = true;
        }
      } else {
        // Occasional WFH or casual late check-in for others
        if (empId === "emp-1" && day === 10) {
          status = "On-Leave";
          checkIn = "";
          checkOut = "";
        } else if (empId === "emp-3" && day % 6 === 0) {
          status = "WFH";
        } else if (empId === "emp-4" && day === 15) {
          checkIn = "09:35";
          late = true;
        }
      }
      
      attendance.push({
        id: `att-${empId}-${dateStr}`,
        employeeId: empId,
        date: dateStr,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        status,
        lateComing: late,
        companyId: "comp-1"
      });
    });
  }

  const leaves: LeaveApplication[] = [
    {
      id: "lv-1",
      employeeId: "emp-1",
      leaveType: "Sick Leave",
      startDate: "2026-06-10",
      endDate: "2026-06-10",
      reason: "Feeling unwell, high fever",
      status: "Approved",
      approvedBy: "usr-vortex-hr",
      companyId: "comp-1",
    },
    {
      id: "lv-2",
      employeeId: "emp-5",
      leaveType: "Casual Leave",
      startDate: "2026-06-03",
      endDate: "2026-06-03",
      reason: "Personal urgent work at hometown",
      status: "Approved",
      approvedBy: "usr-vortex-hr",
      companyId: "comp-1",
    },
    {
      id: "lv-3",
      employeeId: "emp-5",
      leaveType: "Sick Leave",
      startDate: "2026-06-12",
      endDate: "2026-06-12",
      reason: "Dental appointment",
      status: "Rejected",
      approvedBy: "usr-vortex-hr",
      companyId: "comp-1",
    },
    {
      id: "lv-4",
      employeeId: "emp-5",
      leaveType: "Earned Leave",
      startDate: "2026-06-25",
      endDate: "2026-06-27",
      reason: "Going on a short summer trip with family",
      status: "Pending",
      companyId: "comp-1",
    }
  ];

  const holidays: Holiday[] = [
    { id: "hol-1", name: "New Year's Day", date: "2026-01-01", companyId: "comp-1" },
    { id: "hol-2", name: "Republic Day", date: "2026-01-26", companyId: "comp-1" },
    { id: "hol-3", name: "Good Friday", date: "2026-04-03", companyId: "comp-1" },
    { id: "hol-4", name: "Independence Day", date: "2026-08-15", companyId: "comp-1" },
    { id: "hol-5", name: "Christmas Day", date: "2026-12-25", companyId: "comp-1" },
  ];

  // Helper payroll generator
  const createPayrollRecord = (
    id: string,
    empId: string,
    monthYear: string,
    grossSalary: number,
    leavesDeductionDays: number = 0
  ): Payroll => {
    const basic = Math.round(grossSalary * 0.5);
    const hra = Math.round(grossSalary * 0.25);
    const special = Math.round(grossSalary * 0.15);
    const conveyance = 1600;
    const medical = 1250;
    
    const pf = Math.round(basic * 0.12);
    const esic = grossSalary <= 21000 ? Math.round(grossSalary * 0.0075) : 0;
    const pt = 200;
    const tds = grossSalary > 100000 ? Math.round(grossSalary * 0.1) : grossSalary > 60000 ? Math.round(grossSalary * 0.05) : 0;
    
    const perDayCost = grossSalary / 30;
    const leaveDeductions = Math.round(leavesDeductionDays * perDayCost);
    
    const overtime = 0;
    const bonus = 0;
    const allowances = special + conveyance + medical;
    
    const deductions = pf + esic + pt + tds + leaveDeductions;
    const netSalary = (basic + hra + allowances + overtime + bonus) - deductions;

    return {
      id,
      monthYear,
      employeeId: empId,
      baseSalary: basic,
      hra,
      specialAllowance: special,
      conveyance,
      medicalAllowance: medical,
      overtime,
      bonus,
      pf,
      esic,
      professionalTax: pt,
      tds,
      leaveDeductions,
      netSalary,
      status: "Locked",
      companyId: "comp-1",
      generatedAt: `${monthYear}-28T17:00:00.000Z`,
    };
  };

  // Seed actual closed payrolls for April and May 2026 to power the metrics
  const payrolls: Payroll[] = [
    createPayrollRecord("pay-emp1-apr", "emp-1", "2026-04", 85000),
    createPayrollRecord("pay-emp2-apr", "emp-2", "2026-04", 75000),
    createPayrollRecord("pay-emp3-apr", "emp-3", "2026-04", 120000),
    createPayrollRecord("pay-emp4-apr", "emp-4", "2026-04", 80000),
    createPayrollRecord("pay-emp5-apr", "emp-5", "2026-04", 45000, 2), // 2 days loss of pay in April
    
    createPayrollRecord("pay-emp1-may", "emp-1", "2026-05", 85000),
    createPayrollRecord("pay-emp2-may", "emp-2", "2026-05", 75000),
    createPayrollRecord("pay-emp3-may", "emp-3", "2026-05", 120000),
    createPayrollRecord("pay-emp4-may", "emp-4", "2026-05", 80000),
    createPayrollRecord("pay-emp5-may", "emp-5", "2026-05", 45000, 4), // 4 days loss of pay in May
  ];

  const invoices: SubscriptionInvoice[] = [
    {
      id: "inv-1",
      companyId: "comp-1",
      planName: "Growth Plan",
      amount: 4999,
      razorpayPaymentId: "pay_VortexGrow9981",
      billingDate: "2026-06-10",
      expiryDate: "2026-07-10",
      status: "Paid",
    },
    {
      id: "inv-2",
      companyId: "comp-2",
      planName: "Starter Plan",
      amount: 1999,
      razorpayPaymentId: "pay_AcmeStart4432",
      billingDate: "2026-06-15",
      expiryDate: "2026-07-15",
      status: "Paid",
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: "aud-1",
      timestamp: "2026-06-01T09:15:00.000Z",
      userId: "usr-vortex-admin",
      userName: "Rajesh Iyer",
      action: "LOGIN",
      details: "Admin logged into PayFlow portal from IP 192.168.1.5",
      companyId: "comp-1"
    },
    {
      id: "aud-2",
      timestamp: "2026-06-10T11:30:00.000Z",
      userId: "usr-vortex-hr",
      userName: "Priya Patel",
      action: "LEAVE_APPROVAL",
      details: "Approved leave request lv-1 for Rahul Sharma",
      companyId: "comp-1"
    }
  ];

  return {
    companies,
    users,
    departments,
    designations,
    employees,
    attendance,
    leaves,
    holidays,
    payrolls,
    invoices,
    auditLogs
  };
}

// Read database
export function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialSeed = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2), "utf-8");
      return initialSeed;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read database, returning fresh seeds", err);
    return getInitialSeedData();
  }
}

// Write database
export function writeDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write to database", err);
  }
}

// Multi-Tenant Isolation Wrappers
export const db = {
  getCompanies: () => readDatabase().companies,
  getCompany: (id: string) => readDatabase().companies.find(c => c.id === id),
  saveCompany: (company: Company) => {
    const data = readDatabase();
    const idx = data.companies.findIndex(c => c.id === company.id);
    if (idx >= 0) data.companies[idx] = company;
    else data.companies.push(company);
    writeDatabase(data);
    return company;
  },

  getUsers: () => readDatabase().users,
  getUserByEmail: (email: string) => readDatabase().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  getUser: (id: string) => readDatabase().users.find(u => u.id === id),
  saveUser: (user: User) => {
    const data = readDatabase();
    const idx = data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) data.users[idx] = user;
    else data.users.push(user);
    writeDatabase(data);
    return user;
  },

  // Isolated Collections
  getDepartments: (companyId: string) => readDatabase().departments.filter(d => d.companyId === companyId),
  saveDepartment: (dept: Department) => {
    const data = readDatabase();
    const idx = data.departments.findIndex(d => d.id === dept.id);
    if (idx >= 0) data.departments[idx] = dept;
    else data.departments.push(dept);
    writeDatabase(data);
    return dept;
  },
  deleteDepartment: (id: string, companyId: string) => {
    const data = readDatabase();
    data.departments = data.departments.filter(d => !(d.id === id && d.companyId === companyId));
    writeDatabase(data);
  },

  getDesignations: (companyId: string) => readDatabase().designations.filter(d => d.companyId === companyId),
  saveDesignation: (des: Designation) => {
    const data = readDatabase();
    const idx = data.designations.findIndex(d => d.id === des.id);
    if (idx >= 0) data.designations[idx] = des;
    else data.designations.push(des);
    writeDatabase(data);
    return des;
  },
  deleteDesignation: (id: string, companyId: string) => {
    const data = readDatabase();
    data.designations = data.designations.filter(d => !(d.id === id && d.companyId === companyId));
    writeDatabase(data);
  },

  getEmployees: (companyId: string) => readDatabase().employees.filter(e => e.companyId === companyId),
  getEmployee: (id: string, companyId: string) => readDatabase().employees.find(e => e.id === id && e.companyId === companyId),
  saveEmployee: (emp: Employee) => {
    const data = readDatabase();
    const idx = data.employees.findIndex(e => e.id === emp.id);
    if (idx >= 0) data.employees[idx] = emp;
    else data.employees.push(emp);
    writeDatabase(data);
    return emp;
  },
  deleteEmployee: (id: string, companyId: string) => {
    const data = readDatabase();
    data.employees = data.employees.filter(e => !(e.id === id && e.companyId === companyId));
    data.users = data.users.filter(u => !(u.employeeId === id && u.companyId === companyId));
    writeDatabase(data);
  },

  getAttendance: (companyId: string) => readDatabase().attendance.filter(a => a.companyId === companyId),
  saveAttendance: (att: Attendance) => {
    const data = readDatabase();
    const idx = data.attendance.findIndex(a => a.id === att.id);
    if (idx >= 0) data.attendance[idx] = att;
    else data.attendance.push(att);
    writeDatabase(data);
    return att;
  },
  saveAttendanceBatch: (batch: Attendance[]) => {
    const data = readDatabase();
    batch.forEach(att => {
      const idx = data.attendance.findIndex(a => a.id === att.id);
      if (idx >= 0) data.attendance[idx] = att;
      else data.attendance.push(att);
    });
    writeDatabase(data);
  },

  getLeaves: (companyId: string) => readDatabase().leaves.filter(l => l.companyId === companyId),
  getLeave: (id: string, companyId: string) => readDatabase().leaves.find(l => l.id === id && l.companyId === companyId),
  saveLeave: (leave: LeaveApplication) => {
    const data = readDatabase();
    const idx = data.leaves.findIndex(l => l.id === leave.id);
    if (idx >= 0) data.leaves[idx] = leave;
    else data.leaves.push(leave);
    writeDatabase(data);
    return leave;
  },

  getHolidays: (companyId: string) => readDatabase().holidays.filter(h => h.companyId === companyId),
  saveHoliday: (hol: Holiday) => {
    const data = readDatabase();
    const idx = data.holidays.findIndex(h => h.id === hol.id);
    if (idx >= 0) data.holidays[idx] = hol;
    else data.holidays.push(hol);
    writeDatabase(data);
    return hol;
  },
  deleteHoliday: (id: string, companyId: string) => {
    const data = readDatabase();
    data.holidays = data.holidays.filter(h => !(h.id === id && h.companyId === companyId));
    writeDatabase(data);
  },

  getPayrolls: (companyId: string) => readDatabase().payrolls.filter(p => p.companyId === companyId),
  savePayroll: (pay: Payroll) => {
    const data = readDatabase();
    const idx = data.payrolls.findIndex(p => p.id === pay.id);
    if (idx >= 0) data.payrolls[idx] = pay;
    else data.payrolls.push(pay);
    writeDatabase(data);
    return pay;
  },
  savePayrollBatch: (batch: Payroll[]) => {
    const data = readDatabase();
    batch.forEach(pay => {
      const idx = data.payrolls.findIndex(p => p.id === pay.id);
      if (idx >= 0) data.payrolls[idx] = pay;
      else data.payrolls.push(pay);
    });
    writeDatabase(data);
  },

  getInvoices: (companyId: string) => readDatabase().invoices.filter(i => i.companyId === companyId),
  saveInvoice: (inv: SubscriptionInvoice) => {
    const data = readDatabase();
    const idx = data.invoices.findIndex(i => i.id === inv.id);
    if (idx >= 0) data.invoices[idx] = inv;
    else data.invoices.push(inv);
    writeDatabase(data);
    return inv;
  },

  getAuditLogs: (companyId: string) => readDatabase().auditLogs.filter(a => a.companyId === companyId),
  logAction: (userId: string, userName: string, action: string, details: string, companyId: string) => {
    const data = readDatabase();
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      action,
      details,
      companyId
    };
    data.auditLogs.unshift(log); // newest first
    // Limit to 1000 logs
    if (data.auditLogs.length > 1000) {
      data.auditLogs = data.auditLogs.slice(0, 1000);
    }
    writeDatabase(data);
  }
};
