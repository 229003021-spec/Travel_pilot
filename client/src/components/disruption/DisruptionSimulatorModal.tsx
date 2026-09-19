import React, { useState } from "react";
import { useTripStore } from "../../store/useTripStore";
import { Zap, X, AlertTriangle, CloudRain, Ban, DollarSign, Activity, CheckCircle2, RefreshCw } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DisruptionSimulatorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { triggerDisruption, isReplanning, replanPipelineStage, trip } = useTripStore();
  const [selectedDisruption, setSelectedDisruption] = useState<string>("amber_fort_closed");

  if (!isOpen) return null;

  const isJaipur = trip?.destination.toLowerCase().includes("jaipur");

  const disruptions = [
    {
      id: isJaipur ? "amber_fort_closed" : "amber_fort_closed",
      title: isJaipur ? "Attraction Closed (Amber Fort)" : "Attraction Unexpected Closure",
      icon: Ban,
      color: "border-rose-800 bg-rose-950/40 text-rose-300",
      description: "Archaeological maintenance closure. Amber Fort is temporarily unavailable.",
    },
    {
      id: "munnar_heavy_rain",
      title: "Heavy Monsoon Rain Forecast",
      icon: CloudRain,
      color: "border-sky-800 bg-sky-950/40 text-sky-300",
      description: "Torrential rain forecast on Day 2. Outdoor mountain trekking compromised.",
    },
    {
      id: "budget_reduced",
      title: "Unexpected Budget Reduction",
      icon: DollarSign,
      color: "border-amber-800 bg-amber-950/40 text-amber-300",
      description: "Adjust total trip budget downwards by 25% due to unexpected expense.",
    },
    {
      id: "traffic_delay",
      title: "Severe Transport Delay",
      icon: AlertTriangle,
      color: "border-purple-800 bg-purple-950/40 text-purple-300",
      description: "VIP convoy procession blocking main arterial road for 2 hours.",
    },
  ];

  const handleSimulate = async () => {
    await triggerDisruption(selectedDisruption);
    onClose();
  };

  const pipelineStages = ["DETECTED", "ANALYZING", "SEARCHING", "OPTIMIZING", "REPLANNED"];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            Real-Time Disruption Simulator
          </div>
          <button
            onClick={onClose}
            disabled={isReplanning}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isReplanning ? (
            <>
              <div>
                <h3 className="text-lg font-bold text-white">Simulate Reality Change</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Inject a sudden event to watch TravelPilot analyze impact, search alternatives, and dynamically rebuild the affected schedule.
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {disruptions.map((d) => {
                  const Icon = d.icon;
                  const isSelected = selectedDisruption === d.id;
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDisruption(d.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                        isSelected
                          ? "border-blue-500 bg-blue-950/60 shadow-lg shadow-blue-500/10"
                          : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                      }`}
                    >
                      <div className={`p-2 rounded-xl border ${d.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-slate-100">{d.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{d.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Animated Reasoning Pipeline */
            <div className="py-8 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                <Activity className="w-7 h-7 text-blue-400 animate-pulse" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white">Reasoning & Replanning Loop Active</h4>
                <p className="text-xs text-slate-400 mt-1">Freezing un-affected items while evaluating feasible score-ranked alternatives.</p>
              </div>

              {/* Pipeline Progress Stages */}
              <div className="flex items-center justify-between px-4 max-w-md mx-auto">
                {pipelineStages.map((stage, idx) => {
                  const currentIdx = pipelineStages.indexOf(replanPipelineStage || "DETECTED");
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={stage} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isDone
                            ? "bg-emerald-500 text-slate-950"
                            : isCurrent
                            ? "bg-blue-600 text-white ring-4 ring-blue-500/30 animate-pulse"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? "text-blue-400" : isDone ? "text-emerald-400" : "text-slate-600"}`}>
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isReplanning && (
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSimulate}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Inject Disruption & Replan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
