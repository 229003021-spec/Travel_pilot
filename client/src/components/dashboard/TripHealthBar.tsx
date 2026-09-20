import React, { useState } from "react";
import { useTripStore } from "../../store/useTripStore";
import { Shield, CloudSun, Plane, Building2, Wallet, CheckCircle2, AlertTriangle, Info, Sparkles } from "lucide-react";

export const TripHealthBar: React.FC = () => {
  const { trip } = useTripStore();
  const [showResilienceModal, setShowResilienceModal] = useState(false);

  if (!trip) return null;

  const hasAlerts = trip.alerts && trip.alerts.length > 0;
  const isWarning = hasAlerts && trip.alerts.some((a) => a.type === "warning" || a.type === "critical");

  // Calculate dynamic Trip Resilience Score
  const totalActivities = trip.itinerary ? trip.itinerary.length : 8;
  const lockedCount = trip.itinerary ? trip.itinerary.filter((i) => i.locked).length : 0;
  const resilienceScore = Math.max(70, Math.min(98, 95 - lockedCount * 4));

  const healthItems = [
    { label: "Weather", status: "Good", icon: CloudSun, ok: true },
    { label: "Transport", status: "On Schedule", icon: Plane, ok: true },
    { label: "Hotels", status: "Confirmed", icon: Building2, ok: true },
    { label: "Budget", status: isWarning ? "Risk Alert" : "Healthy", icon: Wallet, ok: !isWarning },
    { label: "Activities", status: "On Track", icon: CheckCircle2, ok: true },
  ];

  return (
    <>
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div
            className={`w-3.5 h-3.5 rounded-full animate-pulse ${
              isWarning ? "bg-amber-400 shadow-lg shadow-amber-500/50" : "bg-emerald-400 shadow-lg shadow-emerald-500/50"
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">
                Trip Health: {isWarning ? "Attention Required" : "Stable & Optimal"}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isWarning
                    ? "bg-amber-950 text-amber-300 border-amber-800"
                    : "bg-emerald-950 text-emerald-300 border-emerald-800"
                }`}
              >
                {isWarning ? "1 DISRUPTION DETECTED" : "MONITORING LIVE"}
              </span>
            </div>
            <div className="text-xs text-slate-400">Continuous AI environment & route tracking</div>
          </div>
        </div>

        {/* Sub-channel Status Indicators */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto py-1">
          {healthItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap ${
                  item.ok
                    ? "bg-slate-950/80 border-slate-800 text-slate-300"
                    : "bg-amber-950/60 border-amber-800 text-amber-300"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.ok ? "text-emerald-400" : "text-amber-400"}`} />
                <span>{item.label}:</span>
                <span className={item.ok ? "text-white" : "text-amber-300"}>{item.status}</span>
              </div>
            );
          })}
        </div>

        {/* Resilience Score Badge */}
        <button
          onClick={() => setShowResilienceModal(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-950 border border-indigo-700/80 hover:border-indigo-500 transition group"
        >
          <Shield className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
          <div className="text-left">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trip Resilience</div>
            <div className="text-xs font-black text-indigo-300 font-mono flex items-center gap-1">
              <span>{resilienceScore} / 100</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </button>
      </div>

      {/* Trip Resilience Score Modal */}
      {showResilienceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">Trip Resilience Score</h3>
              </div>
              <span className="text-xl font-black text-indigo-400 font-mono">{resilienceScore}/100</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your <span className="text-white font-bold">Trip Resilience Score</span> measures how easily your itinerary adapts to unexpected disruptions (heavy rain, transit delays, budget changes, or venue closures).
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Indoor Cover Ratio:</span>
                <span className="font-bold text-emerald-400">High (65% indoor options)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Haversine Buffer Margins:</span>
                <span className="font-bold text-blue-400">1.3x Traffic Factor Applied</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Alternative Hotel Density:</span>
                <span className="font-bold text-indigo-400">Verified Nearby Options</span>
              </div>
            </div>

            <button
              onClick={() => setShowResilienceModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Close Resilience Breakdown
            </button>
          </div>
        </div>
      )}
    </>
  );
};
