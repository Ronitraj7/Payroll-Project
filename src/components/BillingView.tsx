import React, { useEffect, useState } from "react";
import { 
  CreditCard, Check, ShieldCheck, FileText, FileDown, 
  Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, HelpCircle
} from "lucide-react";
import { Company, SubscriptionInvoice, User } from "../types.ts";

interface BillingViewProps {
  currentUser: User;
}

export default function BillingView({ currentUser }: BillingViewProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Razorpay simulated overlays
  const [showCheckoutOverlay, setShowCheckoutOverlay] = useState<string | null>(null); // target tier
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { "Authorization": currentUser.id };
      
      const res = await fetch("/api/billing/subscription", { headers });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load company billing profile");
      
      setCompany(data.company);
      setInvoices(data.invoices || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const handleSimulatePayment = async (plan: "Starter" | "Growth" | "Business", price: number) => {
    setCheckoutLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/billing/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": currentUser.id
        },
        body: JSON.stringify({ planName: plan, razorpayPaymentId: "pay_sim_" + Math.random().toString(36).substring(2, 10) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      // Wait a bit to simulate processing
      setTimeout(() => {
        setSuccess(`Payment Successful! Razorpay Txn: ${data.invoice?.razorpayPaymentId}. Subscribed to ${plan} Plan.`);
        setShowCheckoutOverlay(null);
        setCheckoutLoading(false);
        fetchData();
      }, 1500);

    } catch (err: any) {
      setError(err.message);
      setCheckoutLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const planTiers = [
    {
      id: "Starter",
      name: "Starter Growth",
      price: 1999,
      desc: "Ideal for early-stage teams wanting automated statutory parameters & basic attendance tools.",
      headcountLimit: 10,
      features: [
        "Up to 10 Employee profiles",
        "Standard Attendance ledger",
        "Basic Leave approval log",
        "Interactive Email Payslips",
        "B2B Razorpay direct ledger"
      ]
    },
    {
      id: "Growth",
      name: "Corporate Growth",
      price: 4999,
      desc: "Our most popular package for growing software houses & marketing firms.",
      headcountLimit: 50,
      features: [
        "Up to 50 Employee profiles",
        "Excel/CSV bulk attendance logs",
        "Automated government PF/TDS",
        "Dual HR & Admin logins",
        "Contextual Gemini Copilot (100 runs)"
      ]
    },
    {
      id: "Business",
      name: "Enterprise Slate",
      price: 9999,
      desc: "Statutory automated payroll compliance for unlimited scale and compliance audits.",
      headcountLimit: 9999,
      features: [
        "Unlimited Employee profiles",
        "API integrations & custom structures",
        "Priority 24/7 dedicated payroll CPA",
        "Unlimited Gemini reasoning queries",
        "SLA guaranteed bank transfers"
      ]
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* Messages */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm flex items-center gap-3 font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm flex items-center gap-3 font-semibold">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Subscription Active Panel */}
      {company && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Active billing plan</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {company.subscriptionPlan} Plan <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50 px-2 py-0.5 border border-slate-200 rounded-md">Renewing: July 23, 2026</span>
            </h3>
            <p className="text-xs text-slate-400 max-w-xl font-medium">
              Your company account is fully authorized. Direct salary credits and security isolation are compliant under the currently active subscription.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">SaaS Shield Active</span>
              <span className="text-xs font-bold text-slate-700">Razorpay Certified</span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tiers Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-1.5">SaaS Pricing Packages</h3>
        <p className="text-xs text-slate-400 mb-6 font-medium">Upgrade or renew your subscription securely using Razorpay's API interface.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="pricing-tiers-cards">
          {planTiers.map((tier) => {
            const isCurrent = company?.subscriptionPlan === tier.id;
            return (
              <div 
                key={tier.id}
                className={`rounded-3xl p-6 flex flex-col justify-between transition-all shadow-sm ${
                  isCurrent 
                    ? "bg-white border-2 border-indigo-600 relative" 
                    : "bg-white border border-slate-200 hover:border-indigo-200"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-6 bg-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Currently Subscribed
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{tier.name}</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed min-h-[48px] font-medium">{tier.desc}</p>
                  </div>

                  <div className="py-2 flex items-baseline gap-1">
                    <strong className="text-3xl font-extrabold text-slate-850">{formatCurrency(tier.price)}</strong>
                    <span className="text-xs text-slate-400 font-semibold">/ month</span>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    {tier.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-500 font-medium">
                        <Check className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    onClick={() => setShowCheckoutOverlay(tier.id)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent 
                        ? "bg-slate-100 text-slate-400 border border-slate-200/60" 
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                    }`}
                  >
                    {isCurrent ? "Active Tier" : "Subscribe with Razorpay"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History Receipts */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <h3 className="text-md font-bold text-slate-800 tracking-wide mb-2">B2B Paid Receipts Log</h3>
        <p className="text-xs text-slate-400 mb-6 font-medium">Officially generated GST-compliant invoices for statutory accounting audits.</p>

        {loading ? (
          <div className="p-8 text-center text-slate-400 font-semibold">Loading invoice registries...</div>
        ) : invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div 
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200/60 rounded-2xl hover:border-indigo-200 transition-all gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl border border-indigo-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">Invoice: #{inv.id} • {inv.planName} Plan</h4>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono">Paid Date: {inv.billingDate} • Txn ID: {inv.razorpayPaymentId}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <strong className="text-sm font-bold text-indigo-600 font-mono">{formatCurrency(inv.amount)}</strong>
                  <button 
                    onClick={() => {
                      alert(`Downloading GST invoice receipt #${inv.id}...\nTotal paid value: ${formatCurrency(inv.amount)}\nCorporate Transaction authorized via Razorpay API.`);
                    }}
                    className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
                    title="Download PDF Invoice"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
            No paid subscription records were logged on this account yet.
          </div>
        )}
      </div>

      {/* RAZORPAY PAYMENT SIMULATION GATEWAY OVERLAY POPUP */}
      {showCheckoutOverlay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="razorpay-simulation-modal">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl p-6 md:p-8 space-y-6 relative border border-slate-200">
            
            {/* Razorpay stylized logo */}
            <div className="flex justify-between items-center border-b pb-4 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-600 text-white p-2 rounded-xl font-black text-sm select-none">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 tracking-tight">Razorpay Checkout</h3>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">SECURE GATEWAY SANDBOX</span>
                </div>
              </div>
              
              <button 
                onClick={() => setShowCheckoutOverlay(null)}
                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                <Check className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Price parameters */}
            {(() => {
              const target = planTiers.find(t => t.id === showCheckoutOverlay);
              if (!target) return null;
              return (
                <>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Subscribing To:</span>
                    <h4 className="text-md font-bold text-slate-950">{target.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">{target.desc}</p>
                    
                    <div className="border-t pt-3 mt-3 flex justify-between items-baseline">
                      <span className="text-xs font-bold text-slate-600">Total payable (incl. simulated GST)</span>
                      <strong className="text-lg font-mono font-black text-slate-950">{formatCurrency(target.price)}</strong>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div className="text-xs text-slate-500 leading-relaxed flex items-center gap-2 font-semibold">
                      <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      <span>Sandbox test transaction mode active. No actual bank funds will be drawn.</span>
                    </div>

                    <button
                      onClick={() => handleSimulatePayment(target.id as any, target.price)}
                      disabled={checkoutLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
                      id="razorpay-confirm-payment-btn"
                    >
                      {checkoutLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Authorizing via Razorpay...</span>
                        </>
                      ) : (
                        <span>Simulate Success Payment ({formatCurrency(target.price)})</span>
                      )}
                    </button>
                  </div>
                </>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
}
