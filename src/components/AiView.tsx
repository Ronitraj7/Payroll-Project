import React, { useState } from "react";
import { Bot, Send, Sparkles, User, RefreshCw, HelpCircle, Check, Terminal, Brain, ArrowUpRight } from "lucide-react";
import { User as UserType } from "../types.ts";

interface AiViewProps {
  currentUser: UserType;
}

export default function AiView({ currentUser }: AiViewProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    { 
      sender: "ai", 
      text: `Hello ${currentUser.name}! I am your dedicated PayFlow Copilot, backed by the Google Gemini API. I have context over your company's departments, employees, attendance trends, leaves, and payroll ledger.\n\nAsk me queries like: \n- *Who was late the most this month?*\n- *Draft a summary report of May Payroll cost?*\n- *Is there any pending leave application?*` 
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    "Who was late the most in June 2026?",
    "Summarize May 2026 payroll costing and distribution.",
    "Show active employees with gross salary above 80,000 INR."
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg = textToSend.trim();
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": currentUser.id
        },
        body: JSON.stringify({ query: userMsg })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI Assistant offline");

      setMessages(prev => [...prev, { sender: "ai", text: data.response }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { 
        sender: "ai", 
        text: `⚠️ Operational Fault: ${err.message}. Please verify your server credentials or try again.` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] font-sans" id="payroll-ai-copilot">
      
      {/* Conversation Thread Canvas */}
      <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-3xl flex flex-col justify-between h-full overflow-hidden shadow-sm">
        
        {/* Chat header banner */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 text-indigo-600 p-2.5 rounded-xl border border-indigo-100">
              <Bot className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 tracking-wide flex items-center gap-1.5">
                PayFlow Ledger Copilot <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              </h3>
              <span className="text-[10px] text-slate-400 font-bold font-mono">MODEL: Gemini 2.5 Flash</span>
            </div>
          </div>
          
          <button 
            onClick={() => setMessages([{ sender: "ai", text: "Ledger logs index refreshed. How can I help you today?" }])}
            className="text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer font-bold"
          >
            <RefreshCw className="w-3 h-3 text-indigo-600" /> Clear Thread
          </button>
        </div>

        {/* Message Thread list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {messages.map((m, i) => {
            const isAi = m.sender === "ai";
            return (
              <div 
                key={i} 
                className={`flex gap-3.5 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border flex-shrink-0 select-none ${
                  isAi 
                    ? "bg-indigo-50 border-indigo-100 text-indigo-600" 
                    : "bg-indigo-600 border-indigo-500 text-white"
                }`}>
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap shadow-sm font-medium ${
                  isAi 
                    ? "bg-slate-50 border border-slate-200/60 text-slate-700" 
                    : "bg-indigo-50/45 border border-indigo-100 text-slate-800"
                }`}>
                  {m.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3.5 max-w-[80%] mr-auto">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2.5 font-medium">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-300"></div>
                </div>
                <span>Querying company ledger statistics safely with Gemini...</span>
              </div>
            </div>
          )}
        </div>

        {/* Action input bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex gap-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Query payroll cost, late-comings, or leave logs..."
              className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-850 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 font-semibold"
              id="payroll-ai-input-bar"
            />
            
            <button
              onClick={() => handleSend(input)}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white p-4.5 rounded-2xl transition-all cursor-pointer shadow-sm flex-shrink-0"
              id="payroll-ai-send-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Grounding Info Side Panel */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Quick query presets */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Statutory Presets</h4>
          </div>

          <div className="space-y-2.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="w-full text-left p-3 bg-slate-50 hover:bg-indigo-50/30 border border-slate-200/60 hover:border-indigo-200 rounded-2xl text-xs text-slate-600 hover:text-indigo-900 transition-all flex items-center justify-between cursor-pointer group font-semibold"
              >
                <span className="leading-relaxed">{p}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>

        {/* Security / Grounding rules info */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-3xl space-y-3 shadow-sm text-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Terminal className="w-5 h-5 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Multi-Tenant Grounding</h4>
          </div>
          
          <p className="text-slate-450 font-medium leading-relaxed">
            The Gemini reasoning context is filtered at the database level. Before the prompt reaches the LLM, 
            only data matching the authorization tenant key (<code>{currentUser.companyId}</code>) is pulled from 
            in-memory state.
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl font-mono text-[10px] text-slate-600 font-semibold">
            <span className="text-indigo-600">SELECT</span> * <span className="text-indigo-600">FROM</span> ledger <span className="text-indigo-600">WHERE</span> tenant_id = <span className="text-indigo-900">"{currentUser.companyId}"</span>
          </div>
        </div>

      </div>

    </div>
  );
}
