import React, { useState } from "react";
import { motion } from "motion/react";
import { LogIn, Building2, UserPlus, HelpCircle, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { User } from "../types.ts";

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"Starter" | "Growth" | "Business">("Starter");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onLoginSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          email,
          password,
          fullName,
          plan: selectedPlan
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess("Account and company registered successfully! Please login now.");
      setMode("login");
      // Pre-fill
      setEmail(email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Forgot password process failed");
      setSuccess("If the email is registered, a password reset link has been sent!");
      setMode("login");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 md:p-8 font-sans" id="payflow-auth-container">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left column: Value Proposition info */}
        <div className="lg:col-span-5 text-white space-y-6 hidden lg:block pr-6">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 text-slate-900 p-2.5 rounded-xl font-bold text-2xl shadow-lg shadow-emerald-500/20">
              PF
            </div>
            <span className="text-2xl font-semibold tracking-wide">PayFlow AI</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            AI-Powered Payroll & HR Management for Modern SMEs.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Eliminate operational fatigue with automated Indian statutory filings, intelligent leave balances, 
            instant salary transfers, and an advanced Gemini assistant answering all your financial compliance questions.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-emerald-500/10 text-emerald-400 p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">True Multi-Tenant Isolation</h4>
                <p className="text-sm text-slate-400">Strict cryptographically verified organization boundaries.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-emerald-500/10 text-emerald-400 p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Automated Statutory Engines</h4>
                <p className="text-sm text-slate-400">Instant calculations for PF, ESIC, PT, TDS & Deductions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-emerald-500/10 text-emerald-400 p-1 rounded-full">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Secure Gemini API Grounding</h4>
                <p className="text-sm text-slate-400">Get payroll anomalies and expense forecastings instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Form widget */}
        <div className="lg:col-span-7 bg-slate-800 border border-slate-700/60 rounded-3xl shadow-2xl p-6 md:p-10 w-full relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="mb-8 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 lg:hidden mb-2">
                <div className="bg-emerald-500 text-slate-900 p-1.5 rounded-lg font-bold text-lg">
                  PF
                </div>
                <span className="text-lg font-bold text-white">PayFlow AI</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {mode === "login" ? "Welcome back" : mode === "register" ? "Register Company" : "Reset Password"}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {mode === "login" 
                  ? "Access your dashboard and automated modules" 
                  : mode === "register" 
                    ? "Start your 30-day trial in less than 2 minutes" 
                    : "Enter your email to receive recovery link"}
              </p>
            </div>
            
            {mode === "login" && (
              <button 
                onClick={() => setMode("register")}
                className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                Sign Up
              </button>
            )}
            {mode !== "login" && (
              <button 
                onClick={() => { setMode("login"); setError(null); }}
                className="text-xs font-semibold bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full hover:bg-slate-600 transition-all cursor-pointer"
              >
                Back to Sign In
              </button>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm"
              id="auth-error-msg"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm"
              id="auth-success-msg"
            >
              {success}
            </motion.div>
          )}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-5" id="login-form">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Work Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button 
                    type="button" 
                    onClick={() => setMode("forgot")}
                    className="text-xs text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                id="login-btn"
              >
                {loading ? "Authenticating..." : (
                  <>
                    Sign In to Portal <LogIn className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-slate-700/50 flex flex-col space-y-2">
                <span className="text-xs text-slate-500 text-center">Fast Seed Credentials (Copy to test):</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => { setEmail("admin@vortex.com"); setPassword("Vortex123"); }}
                    className="bg-slate-900/60 border border-slate-700 text-xs text-slate-300 px-2 py-2 rounded-lg hover:bg-slate-900 hover:border-emerald-500/50 transition-all text-left truncate"
                  >
                    <strong>Admin:</strong> admin@vortex.com (Vortex123)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setEmail("priya@vortex.com"); setPassword("Priya123"); }}
                    className="bg-slate-900/60 border border-slate-700 text-xs text-slate-300 px-2 py-2 rounded-lg hover:bg-slate-900 hover:border-emerald-500/50 transition-all text-left truncate"
                  >
                    <strong>HR:</strong> priya@vortex.com (Priya123)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setEmail("rahul@vortex.com"); setPassword("Rahul123"); }}
                    className="bg-slate-900/60 border border-slate-700 text-xs text-slate-300 px-2 py-2 rounded-lg hover:bg-slate-900 hover:border-emerald-500/50 transition-all text-left truncate col-span-2"
                  >
                    <strong>Employee (Rahul):</strong> rahul@vortex.com (Rahul123)
                  </button>
                </div>
              </div>
            </form>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-5" id="register-form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Tech Pvt Ltd"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Administrator Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Vikram Singh"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@acmetech.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Security Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Pricing Plans Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Choose Subscription Plan
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "Starter", limit: "Up to 25 Employees", price: "₹1,999 / mo" },
                    { id: "Growth", limit: "Up to 100 Employees", price: "₹4,999 / mo" },
                    { id: "Business", limit: "Unlimited Employees", price: "₹9,999 / mo" },
                  ].map((plan) => (
                    <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id as any)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selectedPlan === plan.id 
                          ? "bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10" 
                          : "border-slate-700 hover:border-slate-600 bg-slate-900/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-sm">{plan.id}</span>
                        {selectedPlan === plan.id && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>}
                      </div>
                      <p className="text-xs text-slate-400">{plan.limit}</p>
                      <p className="text-xs font-bold text-emerald-400 mt-2">{plan.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                id="register-btn"
              >
                {loading ? "Registering and Provisioning..." : (
                  <>
                    Initialize Cloud Workspace <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-5" id="forgot-form">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Registered Work Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                {loading ? "Sending link..." : "Request Reset Link"}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
