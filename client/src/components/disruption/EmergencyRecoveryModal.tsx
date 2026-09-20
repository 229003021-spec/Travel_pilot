import React, { useState } from "react";
import { useTripStore } from "../../store/useTripStore";
import { AlertOctagon, CloudRain, Plane, Building2, RefreshCw, CheckCircle2, ArrowRight, X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export const EmergencyRecoveryModal: React.FC<Props> = ({ onClose }) => {
  const { trip, loadDemoTrip, triggerDisruption, setActiveTab } = useTripStore();
  const [isRecovering, setIsRecovering] = useState(false);

  const disruptions = [
    { icon: Plane, label: "Flight Delayed by 3.5 Hours", severity: "High" },
    { icon: CloudRain, label: "Heavy Rain Expected in Destination", severity: "High" },
    { icon: Building2, label: "Initial Hotel Check-In Window Missed", severity: "Medium" },
  ];

  const handleRunRecovery = async () => {
    setIsRecovering(true);
    if (!trip) {
      await loadDemoTrip("jaipur");
    }
    await triggerDisruption("munnar_heavy_rain");
    setIsRecovering(false);
    onClose();
    setActiveTab("diff");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-red-900/80 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/30">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xl text-white">Trip Recovery Mode</h3>
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-mono uppercase font-bold">
                EMERGENCY
              </span>
            </div>
            <p className="text-xs text-slate-400">Multiple cascading disruptions detected concurrently.</p>
          </div>
        </div>

        {/* Disruption List */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Detected Issues:</span>
          {disruptions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3 bg-red-950/40 border border-red-900/60 rounded-2xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 text-red-200">
                  <Icon className="w-4 h-4 text-red-400" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] bg-red-900 text-white font-mono font-bold px-2 py-0.5 rounded-full">
                  {item.severity}
                </span>
              </div>
            );
          })}
        </div>

        {/* Recovery Action Preview */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs text-slate-300">
          <div className="font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>TravelPilot Recovery Solution:</span>
          </div>
          <p className="leading-relaxed">
            TravelPilot will recalculate arrival times, shift hotel check-in, move Day 1 outdoor sightseeing to Day 2, and insert indoor dining & museum experiences.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunRecovery}
          disabled={isRecovering}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isRecovering ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Rebuilding Clean Itinerary...</span>
            </>
          ) : (
            <>
              <span>Rebuild & Adapt Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
