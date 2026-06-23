import { GoogleGenAI } from "@google/genai";
import { db } from "./db.js"; // In ESM/CJS esbuild output, use standard imports

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Handles security-isolated AI query grounding by feeding only the requesting company's 
 * data to the Gemini model to provide real-time payroll, HR, and analytics insights.
 */
export async function queryPayrollAI(prompt: string, companyId: string, userRole: string, userName: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "Gemini API key is not configured in this environment. Please configure GEMINI_API_KEY in Settings > Secrets to enable PayFlow AI Assistant.";
    }

    // Secure Data Isolation - Fetch ONLY this company's records
    const employees = db.getEmployees(companyId);
    const departments = db.getDepartments(companyId);
    const designations = db.getDesignations(companyId);
    const attendance = db.getAttendance(companyId);
    const leaves = db.getLeaves(companyId);
    const holidays = db.getHolidays(companyId);
    const payrolls = db.getPayrolls(companyId);

    // Map relationships to make the context fully readable to the model
    const departmentMap = new Map(departments.map(d => [d.id, d.name]));
    const designationMap = new Map(designations.map(d => [d.id, d.name]));

    const contextEmployees = employees.map(emp => {
      const payrollHistory = payrolls
        .filter(p => p.employeeId === emp.id)
        .map(p => ({
          month: p.monthYear,
          base: p.baseSalary,
          allowances: p.hra + p.specialAllowance + p.conveyance + p.medicalAllowance + p.overtime + p.bonus,
          deductions: p.pf + p.esic + p.professionalTax + p.tds + p.leaveDeductions,
          net: p.netSalary,
          status: p.status
        }));

      const leaveRecords = leaves
        .filter(l => l.employeeId === emp.id)
        .map(l => ({
          type: l.leaveType,
          start: l.startDate,
          end: l.endDate,
          reason: l.reason,
          status: l.status
        }));

      const attendanceRecords = attendance.filter(a => a.employeeId === emp.id);
      const totalDays = attendanceRecords.length;
      const presentDays = attendanceRecords.filter(a => a.status === "Present" || a.status === "WFH").length;
      const absentDays = attendanceRecords.filter(a => a.status === "Absent").length;
      const lateDays = attendanceRecords.filter(a => a.lateComing).length;

      return {
        id: emp.id,
        code: emp.employeeCode,
        name: emp.fullName,
        email: emp.email,
        joiningDate: emp.dateOfJoining,
        salary: emp.salary,
        department: departmentMap.get(emp.departmentId) || "Unknown",
        designation: designationMap.get(emp.designationId) || "Unknown",
        payrollHistory,
        leaves: leaveRecords,
        attendanceStats: {
          totalTracked: totalDays,
          present: presentDays,
          absent: absentDays,
          late: lateDays,
        }
      };
    });

    const companyInfo = db.getCompany(companyId);

    // Dynamic System Instruction to Ground the Model
    const systemInstruction = `You are PayFlow AI, an elite SaaS HR and Payroll AI Assistant.
You have secure access to the real-time, isolated HR database of the company: "${companyInfo?.name || 'Vortex Software'}".
The current system date is: 2026-06-23.

Your objectives:
1. Provide highly precise, professional, actionable, and data-backed answers about Payroll, Salary, Leave logs, and Attendance.
2. Structure your replies using beautiful Markdown with headers, clean data tables, bullet points, and highlight metrics in bold.
3. NEVER make up database records. Use ONLY the data provided in the company database below.
4. Ensure data confidentiality and maintain a helpful, advisory CTO-level persona.

COMPANY CONTEXT:
- Subscription Plan: ${companyInfo?.subscriptionPlan || 'Growth'} (${companyInfo?.subscriptionStatus || 'Active'})
- Departments: ${departments.map(d => d.name).join(", ")}
- Holidays: ${holidays.map(h => `${h.name} (${h.date})`).join(", ")}

COMPANY HR DATABASE (JSON format):
${JSON.stringify(contextEmployees, null, 2)}

Example prompt handling strategies:
- If asked about "Why is Siddharth's / Rahul's salary lower this month?", analyze their June attendance stats, losses of pay, and past month payroll histories.
- If asked "Predict payroll cost for next month", check current employee count, sum their gross salaries, adjust for average leave/WFH/late deductions, and provide a detailed breakdown of basic, HRA, allowances, PF, ESIC, PT, TDS, and net cost.
- If asked "Find employees with excessive leaves/absenteeism", analyze who has the highest absent stats or leave applications.
- If asked "Show employees who joined this year", check who has a dateOfJoining in 2026.`;

    // Query Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3, // Low temperature for high accuracy and compliance with data
      }
    });

    return response.text || "I apologize, I was unable to generate insights for your request.";
  } catch (error: any) {
    console.error("AI Assistant service error:", error);
    return `An error occurred while communicating with the AI Assistant. Details: ${error?.message || error}`;
  }
}
