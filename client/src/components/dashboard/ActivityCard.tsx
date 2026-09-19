import React from "react";
import { ItineraryItem, Activity, Trip } from "../../../../shared/types";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { Clock, Navigation, Lock, Unlock, HelpCircle, MapPin, Footprints, DollarSign, Home, Sun } from "lucide-react";
import { useTripStore } from "../../store/useTripStore";

interface Props {
  item: ItineraryItem;
  activity: Activity;
  trip: Trip;
}

export const ActivityCard: React.FC<Props> = ({ item, activity, trip }) => {
  const { toggleLockItem, setWhyModal } = useTripStore();

  const isLocked = !!item.locked;

  return (
    <div className={`relative bg-slate-800/80 rounded-2xl border transition-all hover:border-slate-600 p-4 shadow-lg ${isLocked ? "border-amber-500/50 bg-amber-950/10" : "border-slate-700/60"}`}>
      {/* Travel-before indicator pill */}
      {item.travelTimeBefore > 0 && (
        <div className="flex items-center gap-2 mb-3 text-[11px] font-medium text-slate-400 bg-slate-900/60 w-fit px-2.5 py-1 rounded-full border border-slate-700/40">
          <Navigation className="w-3 h-3 text-blue-400" />
          <span>~{item.travelTimeBefore} min travel ({item.travelMode})</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono">Estimated route</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Header & Badges */}
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2 py-0.5 rounded">
              {item.startTime} - {item.endTime}
            </span>

            <span className="text-xs uppercase font-semibold text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded">
              {activity.category}
            </span>

            {activity.indoor ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-purple-300 bg-purple-950/60 border border-purple-800/40 px-1.5 py-0.5 rounded">
                <Home className="w-3 h-3" /> Indoor
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded">
                <Sun className="w-3 h-3" /> Outdoor
              </span>
            )}

            <ProvenanceBadge provenance={activity.costPerPerson.provenance} />
          </div>

          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {activity.name}
            {isLocked && <span className="text-xs text-amber-400 font-normal">(User Locked)</span>}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{activity.description}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Lock Toggle */}
          <button
            onClick={() => toggleLockItem(activity.id)}
            className={`p-2 rounded-xl border text-xs font-medium transition ${
              isLocked
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60 hover:bg-amber-500/30"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title={isLocked ? "Unlock item (Replanner can adjust)" : "Lock item (Freeze during replanning)"}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Why Explanation Trigger */}
          <button
            onClick={() => setWhyModal(activity, item.score)}
            className="flex items-center gap-1 bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 hover:bg-indigo-900/80 px-2.5 py-2 rounded-xl text-xs font-semibold transition"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Why?</span>
          </button>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-700/40 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            {activity.durationMin} min
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            {activity.area}
          </span>
          <span className="flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5 text-slate-500" />
            Walk Level {activity.walkingIntensity}/3
          </span>
        </div>

        <div className="font-semibold text-slate-200">
          {item.estimatedCost > 0 ? (
            <span>{trip.budget.currency} {item.estimatedCost.toLocaleString()} / person</span>
          ) : (
            <span className="text-emerald-400">Free Entry</span>
          )}
        </div>
      </div>
    </div>
  );
};
