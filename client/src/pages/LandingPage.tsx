import React from "react";
import { useTripStore } from "../store/useTripStore";
import { Compass, Zap, ShieldCheck, RefreshCw, Cpu, BarChart3, HelpCircle, ArrowRight, CheckCircle2, Sparkles, MapPin } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { loadDemoTrip, setActiveTab } = useTripStore();

  const features = [
    {
      title: "AI Trip Planning",
      icon: Compass,
      desc: "Translates free-text constraints and travel interests into structured candidate activity pools.",
    },
    {
      title: "Smart Optimization",
      icon: Sparkles,
      desc: "Multi-factor candidate scoring, geographic clustering per day, and pacing buffer calculation.",
    },
    {
      title: "Real-Time Research",
      icon: Cpu,
      desc: "Queries web & place sources attaching explicit verified/estimated/demo provenance badges.",
    },
    {
      title: "Disruption Recovery",
      icon: RefreshCw,
      desc: "Freezes non-affected schedule windows while score-ranking replacement candidates during rain or closures.",
    },
    {
      title: "Budget Intelligence",
      icon: BarChart3,
      desc: "Per-tier cost model tracking accommodation, local transport, dining, and activity fees.",
    },
    {
      title: "Explainable Decisions",
      icon: HelpCircle,
      desc: "Factual explanation tables breaking down interest match, location efficiency, and opening hours.",
    },
  ];

  const loopSteps = [
    { label: "1. Constraints", sub: "User preferences & budget" },
    { label: "2. Research", sub: "Verified & estimated candidate pool" },
    { label: "3. Optimize", sub: "Geographic clustering & score ranking" },
    { label: "4. Disruption", sub: "Attraction closure or heavy rain" },
    { label: "5. Replan & Explain", sub: "Window freezing & factual diff" },
  ];

  return (
    <div className="space-y-16 py-8 animate-in fade-in duration-300">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Hackathon-Ready v2 Prototype
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          TravelPilot — Plan less. Explore more. <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Adapt instantly.</span>
        </h1>

        <p className="text-base text-slate-300 leading-relaxed">
          An AI travel agent that researches destinations, builds optimized itineraries, and automatically adapts your trip when plans change.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab("wizard")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-blue-500/20 transition"
          >
            <span>Plan My Trip</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => loadDemoTrip("jaipur")}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm border border-slate-700 shadow-xl transition"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Try Jaipur Demo</span>
          </button>

          <button
            onClick={() => loadDemoTrip("munnar")}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded-2xl font-bold text-sm border border-emerald-800 shadow-xl transition"
          >
            <span>Try Munnar Rain Demo</span>
          </button>
        </div>
      </div>

      {/* Visual Feedback Loop Flow Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h3 className="text-xl font-bold text-white">The Core Adaptive Reasoning Loop</h3>
          <p className="text-xs text-slate-400 mt-1">
            TravelPilot doesn't just plan a trip once — it continuously reasons about reality changes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {loopSteps.map((step, i) => (
            <div key={i} className="relative p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <div className="font-bold text-xs text-blue-400 uppercase tracking-wider">{step.label}</div>
              <div className="text-[11px] text-slate-400">{step.sub}</div>
              {i < 4 && (
                <div className="hidden sm:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Six Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">{f.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
