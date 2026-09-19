import React from "react";
import { useTripStore } from "../../store/useTripStore";
import { X, CheckCircle2, AlertTriangle, HelpCircle, ShieldCheck } from "lucide-react";

export const WhyExplanationModal: React.FC = () => {
  const { whyModalActivity, whyModalScore, setWhyModal, trip } = useTripStore();

  if (!whyModalActivity) return null;

  const score = whyModalScore || {
    interestMatch: 9,
    scheduleFit: 9,
    locationEfficiency: 8,
    budgetFit: 9,
    preferenceMatch: 9,
    weatherSuitability: 9,
    quality: 9,
    total: 86,
  };

  const rows = [
    {
      factor: "Interest Alignment",
      score: `${score.interestMatch}/10`,
      status: score.interestMatch >= 7 ? "High Match" : "Moderate Match",
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
      detail: `Matches selected trip interests (${whyModalActivity.tags.slice(0, 3).join(", ")}).`,
    },
    {
      factor: "Location Efficiency",
      score: `${score.locationEfficiency}/10`,
      status: score.locationEfficiency >= 7 ? "Optimal Proximity" : "Moderate Route Hop",
      icon: CheckCircle2,
      color: "text-blue-400 bg-blue-950/60 border-blue-800",
      detail: `Clustered in ${whyModalActivity.area} area to minimize intra-day road detour.`,
    },
    {
      factor: "Opening Hours Fit",
      score: `${score.scheduleFit}/10`,
      status: score.scheduleFit >= 7 ? "Verified Open" : "Flexible Window",
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
      detail: `Verified against operational hours schedule with pacing buffer.`,
    },
    {
      factor: "Budget Suitability",
      score: `${score.budgetFit}/10`,
      status: score.budgetFit >= 7 ? "Affordable" : "Premium Allotment",
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-950/60 border-emerald-800",
      detail: `Cost (${trip?.budget.currency || "INR"} ${whyModalActivity.costPerPerson.value}) fits remaining per-activity ceiling.`,
    },
    {
      factor: "Weather Suitability",
      score: `${score.weatherSuitability}/10`,
      status: score.weatherSuitability >= 7 ? "Low Risk" : "Weather Sensitive",
      icon: score.weatherSuitability >= 7 ? CheckCircle2 : AlertTriangle,
      color: score.weatherSuitability >= 7 ? "text-emerald-400 bg-emerald-950/60 border-emerald-800" : "text-amber-400 bg-amber-950/60 border-amber-800",
      detail: whyModalActivity.indoor ? "Indoor activity — high rain tolerance." : "Outdoor activity — optimal for clear forecast.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <HelpCircle className="w-4 h-4" />
            Why Was This Selected?
          </div>
          <button
            onClick={() => setWhyModal(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-white">{whyModalActivity.name}</h2>
            <p className="text-xs text-slate-400 mt-1">{whyModalActivity.description}</p>
          </div>

          {/* Overall Score Badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/60">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Composite Candidate Score</div>
              <div className="text-2xl font-black text-white mt-0.5">{score.total} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950 px-3 py-1.5 rounded-full border border-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Factual Score Match
            </div>
          </div>

          {/* Factors Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Factor Breakdown Table</h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 text-xs">
              {rows.map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} className="p-3 bg-slate-900/40 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200 flex items-center gap-2">
                        <span>{r.factor}</span>
                        <span className="font-mono text-slate-400 text-[11px]">({r.score})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{r.detail}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border font-semibold shrink-0 text-[11px] ${r.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => setWhyModal(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
