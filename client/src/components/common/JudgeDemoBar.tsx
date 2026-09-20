import React, { useState } from "react";
import { useTripStore } from "../../store/useTripStore";
import { Zap, CloudRain, Building2, Wallet, Share2, HelpCircle, Sparkles } from "lucide-react";
import { WhatIfSimulator } from "../disruption/WhatIfSimulator";
import { ShareTripModal } from "./ShareTripModal";

export const JudgeDemoBar: React.FC = () => {
  const { loadDemoTrip, triggerDisruption, setActiveTab } = useTripStore();
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <div className="bg-slate-950 border-b border-indigo-900/60 px-4 py-2 flex items-center justify-between text-xs overflow-x-auto shadow-md">
        <div className="flex items-center gap-2 font-mono font-bold text-indigo-400 shrink-0">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>HACKATHON DEMO CONTROLLER:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <button
            onClick={() => loadDemoTrip("jaipur")}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow transition whitespace-nowrap"
          >
            <Zap className="w-3 h-3 text-yellow-300" />
            1-Click Jaipur Demo
          </button>

          <button
            onClick={async () => {
              await loadDemoTrip("jaipur");
              await triggerDisruption("munnar_heavy_rain");
              setActiveTab("diff");
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900 font-bold rounded-lg transition whitespace-nowrap"
          >
            <CloudRain className="w-3 h-3 text-amber-400" />
            🌧️ Rain Alert
          </button>

          <button
            onClick={async () => {
              await loadDemoTrip("jaipur");
              await triggerDisruption("amber_fort_closed");
              setActiveTab("diff");
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900 font-bold rounded-lg transition whitespace-nowrap"
          >
            <Building2 className="w-3 h-3 text-purple-400" />
            🏛️ Venue Closed
          </button>

          <button
            onClick={async () => {
              await loadDemoTrip("jaipur");
              await triggerDisruption("budget_reduced");
              setActiveTab("diff");
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 font-bold rounded-lg transition whitespace-nowrap"
          >
            <Wallet className="w-3 h-3 text-emerald-400" />
            💰 Budget Drop
          </button>

          <button
            onClick={() => setShowWhatIf(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-lg transition whitespace-nowrap"
          >
            <HelpCircle className="w-3 h-3 text-purple-400" />
            🎮 What-If Simulator
          </button>

          <button
            onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-lg transition whitespace-nowrap"
          >
            <Share2 className="w-3 h-3 text-blue-400" />
            📢 Share Card
          </button>
        </div>
      </div>

      {/* What-If Simulator Modal */}
      {showWhatIf && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full">
            <WhatIfSimulator onClose={() => setShowWhatIf(false)} />
          </div>
        </div>
      )}

      {/* Share Trip Modal */}
      {showShare && <ShareTripModal onClose={() => setShowShare(false)} />}
    </>
  );
};
