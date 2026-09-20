import React from "react";
import { Cpu, Compass, Activity, Zap, ArrowRight, ShieldCheck } from "lucide-react";

export const AiArchitectureCard: React.FC = () => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">TravelPilot Agentic AI Architecture</h3>
            <p className="text-xs text-slate-400">Concurrent multi-agent decision & replanning engine.</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-bold rounded-full">
          3 AGENTS ACTIVE
        </span>
      </div>

      {/* Agents Flow Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Planner Agent */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
              <Compass className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full">
              PLANNER AGENT
            </span>
          </div>
          <h4 className="font-bold text-sm text-white">Itinerary Generation</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Constructs 17-step spatial clusters, Haversine travel time vectors, venue opening hours & meal windows.
          </p>
        </div>

        {/* Monitor Agent */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full">
              MONITOR AGENT
            </span>
          </div>
          <h4 className="font-bold text-sm text-white">Environment Detection</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Continuously monitors weather forecasts, transport delays, budget caps & emergency closure alerts.
          </p>
        </div>

        {/* Optimizer Agent */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-full">
              OPTIMIZER AGENT
            </span>
          </div>
          <h4 className="font-bold text-sm text-white">Autonomous Replanning</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Calculates indoor fallbacks, recalculates routes, updates budget breakdown & generates user diff.
          </p>
        </div>
      </div>

      <div className="pt-2 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>User Control Guaranteed: AI recommends changes with explicit Before/After diffs for user approval.</span>
        </div>
        <span className="font-mono text-indigo-400 font-bold shrink-0">Zero Hidden Chain-of-Thought</span>
      </div>
    </div>
  );
};
