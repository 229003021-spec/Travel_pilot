import React from "react";
import { Sparkles, Eye, Layers, RefreshCw, Check } from "lucide-react";
import { useTripStore } from "../../store/useTripStore";

interface RouteDiffOverlayProps {
  showDiffMode: boolean;
  setShowDiffMode: (val: boolean) => void;
  onOptimizeRoute: () => void;
  isOptimizing?: boolean;
}

export const RouteDiffOverlay: React.FC<RouteDiffOverlayProps> = ({
  showDiffMode,
  setShowDiffMode,
  onOptimizeRoute,
  isOptimizing = false,
}) => {
  const { trip, replanResult } = useTripStore();
  const hasDisruption = Boolean(replanResult || trip?.alerts?.some((a) => a.type === "warning" || a.type === "critical"));

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2 font-sans">
      {/* Action Buttons Group */}
      <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1.5 shadow-xl text-xs">
        {/* Diff Mode Toggle */}
        <button
          onClick={() => setShowDiffMode(!showDiffMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
            showDiffMode
              ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
              : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
          }`}
          title="Toggle comparison between Original Plan and Re-optimized Route"
        >
          <Eye className="w-3.5 h-3.5" />
          {showDiffMode ? "Showing Changes (Before/After)" : "Compare Before/After"}
        </button>

        {/* Optimize Route Button */}
        <button
          onClick={onOptimizeRoute}
          disabled={isOptimizing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
        >
          {isOptimizing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          )}
          <span>{isOptimizing ? "Optimizing..." : "✨ Optimize Route"}</span>
        </button>
      </div>

      {/* Disruption Route Legend (Shown when diff mode or disruption active) */}
      {(showDiffMode || hasDisruption) && (
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-[10px] text-slate-300 shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-b-2 border-dashed border-red-500 inline-block" />
            <span className="text-red-400 font-semibold">Disrupted Segment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-blue-500 inline-block rounded-full" />
            <span className="text-blue-400 font-semibold">Optimized Route</span>
          </div>
        </div>
      )}
    </div>
  );
};
