import React from "react";
import { AlertTriangle, CloudRain, Plane, Building2, Wallet, RefreshCw, CheckCircle2, Shield, Sparkles, ArrowRight } from "lucide-react";
import { useTripStore } from "../../store/useTripStore";

export const WhyPlanningBreaks: React.FC = () => {
  const { loadDemoTrip, triggerDisruption, setActiveTab } = useTripStore();

  const scenarios = [
    {
      id: "munnar_heavy_rain",
      icon: CloudRain,
      color: "text-amber-400 bg-amber-950/60 border-amber-800",
      title: "Weather Disruption",
      subtitle: "Heavy rain makes outdoor activities unsuitable",
      actionLabel: "Simulate Rain Alert",
    },
    {
      id: "flight_delay",
      icon: Plane,
      color: "text-blue-400 bg-blue-950/60 border-blue-800",
      title: "Transport Delay",
      subtitle: "4-hour flight delay shifts hotel & afternoon tour",
      actionLabel: "Simulate Flight Delay",
    },
    {
      id: "amber_fort_closed",
      icon: Building2,
      color: "text-purple-400 bg-purple-950/60 border-purple-800",
      title: "Venue Closure",
      subtitle: "Amber Fort closed unexpectedly due to maintenance",
      actionLabel: "Simulate Venue Closure",
    },
    {
      id: "budget_reduced",
      icon: Wallet,
      color: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
      title: "Budget Drop",
      subtitle: "Unexpected expense reduces trip budget by ₹5,000",
      actionLabel: "Simulate Budget Drop",
    },
  ];

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>The Core Problem in Travel</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Why Travel Planning Breaks
        </h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Travel planning isn&apos;t hard because information is missing. It&apos;s hard because <span className="text-white font-semibold">plans are fragile</span>. The moment real-world conditions change, static itineraries collapse.
        </p>
      </div>

      {/* Visual Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Traditional Static Planners */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden group">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest">Traditional Planners</span>
              <h3 className="text-xl font-bold text-white mt-1">Static & Fragile Itineraries</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
              <span className="text-xs text-slate-300">Plan & book everything weeks in advance</span>
            </div>
            <div className="p-3.5 bg-rose-950/40 border border-rose-900/60 rounded-2xl flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-rose-900 text-rose-300 font-mono text-xs flex items-center justify-center font-bold">2</span>
              <span className="text-xs text-rose-200">Reality changes (Rain, Flight Delays, Closures)</span>
            </div>
            <div className="p-3.5 bg-rose-950/60 border border-rose-800 rounded-2xl flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-rose-800 text-white font-mono text-xs flex items-center justify-center font-bold">3</span>
              <span className="text-xs text-rose-100 font-semibold">Traveler manually rearranges, loses money & stress spikes</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs font-mono text-rose-400 bg-rose-950 px-3 py-1 rounded-full border border-rose-900">
              ❌ PLAN → BOOK → COLLAPSE
            </span>
          </div>
        </div>

        {/* TravelPilot Agentic Solution */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative group">
          <div className="flex items-center justify-between border-b border-indigo-900/60 pb-4">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">TravelPilot Agentic AI</span>
              <h3 className="text-xl font-bold text-white mt-1">Continuous Autonomous Loop</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          {/* Loop Diagram */}
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {[
              { label: "PLAN", color: "bg-blue-950 text-blue-300 border-blue-800" },
              { label: "MONITOR", color: "bg-cyan-950 text-cyan-300 border-cyan-800" },
              { label: "DETECT", color: "bg-amber-950 text-amber-300 border-amber-800" },
              { label: "ADAPT", color: "bg-indigo-950 text-indigo-300 border-indigo-800" },
              { label: "EXPLAIN", color: "bg-emerald-950 text-emerald-300 border-emerald-800" },
            ].map((step, idx) => (
              <div key={idx} className={`p-2 rounded-xl border text-[10px] font-black tracking-wider ${step.color}`}>
                {step.label}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950/80 border border-indigo-950 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span className="text-xs text-slate-200">Monitors weather, routes, venue status & budget live</span>
            </div>
            <div className="p-3.5 bg-slate-950/80 border border-indigo-950 rounded-2xl flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-indigo-400 shrink-0 animate-spin-slow" />
              <span className="text-xs text-slate-200">Auto-replaces outdoor spots with indoor alternatives</span>
            </div>
            <div className="p-3.5 bg-indigo-950/60 border border-indigo-700/80 rounded-2xl flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs text-white font-semibold">Generates Before/After diff for 1-click user approval</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs font-mono text-indigo-300 bg-indigo-950 px-3.5 py-1 rounded-full border border-indigo-800 font-bold">
              ✓ PLAN → MONITOR → DETECT → ADAPT → EXPLAIN
            </span>
          </div>
        </div>
      </div>

      {/* Real World Interactive Scenarios */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Test Real-World Disruption Scenarios Live
          </h3>
          <span className="text-xs text-slate-400 font-mono">Interactive Demo Mode</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            return (
              <div
                key={sc.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition group space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${sc.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Live Simulation</span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition">{sc.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{sc.subtitle}</p>
                </div>

                <button
                  onClick={async () => {
                    await loadDemoTrip("jaipur");
                    await triggerDisruption(sc.id);
                    setActiveTab("diff");
                  }}
                  className="w-full py-2.5 px-3 bg-slate-800 hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <span>{sc.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
