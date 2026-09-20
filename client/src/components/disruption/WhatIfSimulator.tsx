import React, { useState } from "react";
import { useTripStore } from "../../store/useTripStore";
import { HelpCircle, CloudRain, Plane, Wallet, Clock, ArrowRight, RefreshCw, CheckCircle2, Sparkles, X } from "lucide-react";

interface Props {
  onClose?: () => void;
}

export const WhatIfSimulator: React.FC<Props> = ({ onClose }) => {
  const { trip, triggerDisruption, loadDemoTrip, setActiveTab } = useTripStore();
  const [selectedScenario, setSelectedScenario] = useState<string>("rain");
  const [isSimulating, setIsSimulating] = useState(false);

  const scenarios = [
    {
      id: "rain",
      title: "What if it rains heavily tomorrow?",
      icon: CloudRain,
      disruptionId: "munnar_heavy_rain",
      color: "border-amber-500/50 bg-amber-950/30 text-amber-300",
      description: "TravelPilot shifts outdoor sightseeing to covered indoor museums, art galleries & local dining.",
      impact: "High Impact • 3 Activities Adjusted"
    },
    {
      id: "flight",
      title: "What if my flight is delayed by 4 hours?",
      icon: Plane,
      disruptionId: "flight_delay",
      color: "border-blue-500/50 bg-blue-950/30 text-blue-300",
      description: "TravelPilot reschedules hotel check-in time and compresses Day 1 afternoon sightseeing.",
      impact: "Medium Impact • Route Buffer Recalculated"
    },
    {
      id: "budget",
      title: "What if my budget decreases by ₹5,000?",
      icon: Wallet,
      disruptionId: "budget_reduced",
      color: "border-emerald-500/50 bg-emerald-950/30 text-emerald-300",
      description: "TravelPilot switches accommodation to mid-tier boutique stay and optimizes daily dining costs.",
      impact: "Medium Impact • ₹5,000 Cost Saved"
    },
    {
      id: "closure",
      title: "What if a key attraction is closed?",
      icon: Clock,
      disruptionId: "amber_fort_closed",
      color: "border-purple-500/50 bg-purple-950/30 text-purple-300",
      description: "TravelPilot replaces closed venue with top-rated nearby heritage monument of equal popularity.",
      impact: "Low Impact • 1 Swap Applied"
    },
  ];

  const currentSc = scenarios.find((s) => s.id === selectedScenario) || scenarios[0];

  const handleApplyScenario = async () => {
    setIsSimulating(true);
    if (!trip) {
      await loadDemoTrip("jaipur");
    }
    await triggerDisruption(currentSc.disruptionId);
    setIsSimulating(false);
    if (onClose) onClose();
    setActiveTab("diff");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            What-If Simulator
            <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-mono uppercase">
              Predictive AI
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Simulate real-world disruptions before they happen and preview TravelPilot&apos;s adaptive solution.
          </p>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isSelected = selectedScenario === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                isSelected
                  ? `${sc.color} shadow-lg ring-1 ring-indigo-500`
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-850"
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-white">{sc.title}</div>
                <div className="text-[11px] text-slate-400">{sc.impact}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Scenario Preview */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Adaptation Preview
          </span>
          <span className="text-xs font-mono text-slate-400">100% User Control</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {currentSc.description}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
          <div className="text-xs text-slate-400">
            Current Destination: <span className="text-white font-bold">{trip ? trip.destination : "Jaipur"}</span>
          </div>

          <button
            onClick={handleApplyScenario}
            disabled={isSimulating}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating Scenario...</span>
              </>
            ) : (
              <>
                <span>Run Scenario & Review Diff</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
