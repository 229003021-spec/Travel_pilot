import React from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface Props {
  currentStage: number;
}

export const ProgressChecklist: React.FC<Props> = ({ currentStage }) => {
  const stages = [
    "Understanding traveller constraints & preferences",
    "Researching destination activity pool",
    "Filtering feasible attraction & dining candidates",
    "Checking operational opening hours & closed days",
    "Evaluating road network travel times (Haversine x 1.3)",
    "Clustering activities geographically into day slots",
    "Calculating tier budget & category cost breakdown",
    "Validating schedule for overlap & walking intensity conflicts",
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto shadow-2xl space-y-6 text-center animate-in fade-in zoom-in duration-300">
      <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <Sparkles className="w-7 h-7 text-blue-400 animate-pulse" />
      </div>

      <div>
        <h3 className="text-xl font-bold text-white">TravelPilot Optimization Pipeline</h3>
        <p className="text-xs text-slate-400 mt-1">Executing deterministic candidate scoring and schedule assembly...</p>
      </div>

      <div className="space-y-3 text-left">
        {stages.map((label, idx) => {
          const isDone = idx + 1 < currentStage;
          const isCurrent = idx + 1 === currentStage;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-2xl border text-xs transition-all ${
                isDone
                  ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
                  : isCurrent
                  ? "bg-blue-950/60 border-blue-700 text-white shadow-lg shadow-blue-500/10 font-bold"
                  : "bg-slate-950/40 border-slate-800 text-slate-600"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
              )}
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
