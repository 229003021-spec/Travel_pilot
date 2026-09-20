import React, { useState } from "react";
import { Sparkles, CloudRain, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Clock, Compass, Zap } from "lucide-react";
import { useTripStore } from "../../store/useTripStore";

interface AiMapOverlayProps {
  isLiveTrip?: boolean;
}

export const AiMapOverlay: React.FC<AiMapOverlayProps> = ({ isLiveTrip = false }) => {
  const { trip, replanResult, activeDay } = useTripStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const activeAlert = trip?.alerts?.find((a) => a.type === "warning" || a.type === "critical");
  const activeDisruption = activeAlert
    ? {
        severity: activeAlert.type,
        description: activeAlert.message,
        delayMinutes: 30,
        impactedActivities: activeAlert.activityId ? [activeAlert.activityId] : [],
      }
    : replanResult
    ? {
        severity: "warning",
        description: replanResult.explanation || "Route automatically optimized due to plan changes",
        delayMinutes: Math.abs(replanResult.travelDelta || 0),
        impactedActivities: replanResult.removed || [],
      }
    : null;

  return (
    <div className="absolute top-4 left-4 z-[1000] max-w-sm w-full font-sans transition-all duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 text-xs">
        {/* Header Bar */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="font-bold font-mono tracking-tight text-white flex items-center gap-2">
                TravelPilot AI Route Engine
                {isLiveTrip && (
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-red-500/20 border border-red-500/40 text-red-400 rounded-full animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400">
                Day {activeDay === 0 ? "All Days" : activeDay} Optimization
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable Body */}
        {isExpanded && (
          <div className="p-3.5 space-y-3">
            {/* Status Indicator */}
            {activeDisruption ? (
              <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-red-400">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    ⚠️ Active Disruption Detected
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-900/60 text-red-300 font-mono">
                    {activeDisruption.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] leading-tight text-red-200/90">{activeDisruption.description}</p>
                <div className="text-[10px] text-red-300/80 font-mono pt-1 border-t border-red-900/50">
                  Impact: {activeDisruption.delayMinutes} mins delay • {activeDisruption.impactedActivities.length} stops affected
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium text-[11px]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Route Status: <strong>Optimal & Clear</strong></span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-md border border-emerald-700/50">
                  🟢 Stable
                </span>
              </div>
            )}

            {/* Weather & Road Advisory */}
            <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px]">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                Live Micro-Climate Advisory
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                Clear skies forecasted for morning stops. Moderate hill fog expected after 4:30 PM along high-altitude viewpoints.
              </p>
            </div>

            {/* Time Saved & Efficiency Metric */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-[10px] mb-0.5">
                  <Zap className="w-3 h-3" /> Time Saved
                </div>
                <div className="text-sm font-black text-white font-mono">⚡ 42 Mins</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-[10px] mb-0.5">
                  <Compass className="w-3 h-3" /> Driving Efficiency
                </div>
                <div className="text-sm font-black text-white font-mono">94% Geo-Fit</div>
              </div>
            </div>

            {/* Why This Route? Explanation */}
            <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/50 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-300 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Why this route sequence?
              </div>
              <ul className="text-[10px] text-slate-300 space-y-1 list-disc list-inside">
                <li>Sequenced by proximity to reduce hairpin bend transit times.</li>
                <li>Lunch break slotted near top-rated dining at 1:15 PM.</li>
                <li>Opening hours synchronized with arrival timestamps.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
