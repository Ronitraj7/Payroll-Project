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
  role: "Super Admin" | "Company Admin" | "HR Manager" | "Employee";
  companyId: string;
  employeeId?: string;
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
  salary: number;
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
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "Present" | "Absent" | "Half-Day" | "On-Leave" | "WFH";
  lateComing: boolean;
  companyId: string;
}

export interface LeaveApplication {
  id: string;
  employeeId: string;
  leaveType: "Casual Leave" | "Sick Leave" | "Earned Leave";
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedBy?: string;
  companyId: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  companyId: string;
}

export interface Payroll {
  id: string;
  monthYear: string;
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
