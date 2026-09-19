import React from "react";
import { useTripStore } from "../../store/useTripStore";
import { GitCompare, ArrowRight, ShieldCheck, RefreshCw, DollarSign, Clock, AlertTriangle, Plus, Minus, Move } from "lucide-react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";

export const BeforeAfterView: React.FC = () => {
  const { trip, replanResult, undoLastAction } = useTripStore();

  if (!trip) return null;

  const activityMap = new Map((trip.activityPool || []).map((a) => [a.id, a]));

  const beforeItems = replanResult ? replanResult.before : [];
  const afterItems = replanResult ? replanResult.after : trip.itinerary;
  const removedIds = replanResult ? replanResult.removed : [];
  const addedIds = replanResult ? replanResult.added : [];
  const movedIds = replanResult ? replanResult.moved : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <GitCompare className="w-4 h-4" />
              Before & After Schedule Comparison
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Adaptive Replanning Audit Trail</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspect exactly which itinerary items were replaced, frozen, or adjusted during disruption recovery.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {replanResult && (
              <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-xs">
                <div>
                  <div className="text-slate-500 font-semibold uppercase text-[10px]">Budget Delta</div>
                  <div className={`font-bold ${replanResult.budgetDelta <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {replanResult.budgetDelta <= 0 ? "" : "+"}{trip.budget.currency} {replanResult.budgetDelta.toLocaleString()}
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-800" />

                <div>
                  <div className="text-slate-500 font-semibold uppercase text-[10px]">Travel Time Delta</div>
                  <div className={`font-bold ${replanResult.travelDelta <= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {replanResult.travelDelta <= 0 ? "" : "+"}{replanResult.travelDelta} min
                  </div>
                </div>
              </div>
            )}

            {trip.history && trip.history.length > 0 && (
              <button
                onClick={undoLastAction}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 shadow transition"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                Undo Action
              </button>
            )}
          </div>
        </div>

        {/* Factual Explanation Box */}
        {replanResult && replanResult.explanation && (
          <div className="mt-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200 flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-indigo-300 mr-2">[Replanning Rationale]</span>
              {replanResult.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Timeline Diff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BEFORE TIMELINE */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              Prior Itinerary Schedule
            </div>
            <span className="text-xs text-slate-500 font-mono">{beforeItems.length} activities</span>
          </div>

          <div className="space-y-3">
            {beforeItems.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-4 text-center">No prior snapshot available</div>
            ) : (
              beforeItems.map((item, idx) => {
                const act = activityMap.get(item.activityId);
                const isRemoved = removedIds.includes(item.activityId);

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs transition ${
                      isRemoved
                        ? "bg-rose-950/30 border-rose-800/80 text-rose-200 line-through opacity-75"
                        : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-400">Day {item.day} • {item.startTime}-{item.endTime}</span>
                      {isRemoved && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                          <Minus className="w-3 h-3" /> Removed
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-white mt-1">{act ? act.name : item.activityId}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AFTER TIMELINE */}
        <div className="bg-slate-900/90 border border-blue-900/60 rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="font-bold text-sm text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
              Adapted Itinerary Schedule
            </div>
            <span className="text-xs text-blue-400 font-mono font-bold">{afterItems.length} activities</span>
          </div>

          <div className="space-y-3">
            {afterItems.map((item, idx) => {
              const act = activityMap.get(item.activityId);
              const isAdded = addedIds.includes(item.activityId);
              const isMoved = movedIds.includes(item.activityId);

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-xs transition ${
                    isAdded
                      ? "bg-emerald-950/40 border-emerald-700 text-emerald-200 shadow-md shadow-emerald-950/30"
                      : isMoved
                      ? "bg-amber-950/40 border-amber-700 text-amber-200"
                      : "bg-slate-800/60 border-slate-700/60 text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-blue-400">Day {item.day} • {item.startTime}-{item.endTime}</span>
                    {isAdded && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                        <Plus className="w-3 h-3" /> Replanned Addition
                      </span>
                    )}
                    {isMoved && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                        <Move className="w-3 h-3" /> Rescheduled
                      </span>
                    )}
                    {!isAdded && !isMoved && (
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Frozen</span>
                    )}
                  </div>

                  <div className="font-bold text-sm text-white mt-1 flex items-center justify-between">
                    <span>{act ? act.name : item.activityId}</span>
                    {act && <ProvenanceBadge provenance={act.costPerPerson.provenance} />}
                  </div>

                  {act && (
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                      <span>Area: {act.area}</span>
                      <span>•</span>
                      <span>Walk Level: {act.walkingIntensity}/3</span>
                      <span>•</span>
                      <span>{act.indoor ? "Indoor" : "Outdoor"}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
