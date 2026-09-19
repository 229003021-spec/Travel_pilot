import React, { useState } from "react";
import { useTripStore } from "../store/useTripStore";
import { AlertBanner } from "../components/common/AlertBanner";
import { ActivityCard } from "../components/dashboard/ActivityCard";
import { WhyExplanationModal } from "../components/dashboard/WhyExplanationModal";
import { DisruptionSimulatorModal } from "../components/disruption/DisruptionSimulatorModal";
import { calculateBudgetBreakdown } from "../../../server/optimizer/budgetOptimizer.js";
import { Calendar, Users, DollarSign, Zap, CloudSun, ShieldCheck, Clock, Compass, Plus } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { trip, activeDay, setActiveDay, isReplanning } = useTripStore();
  const [isDisruptionModalOpen, setIsDisruptionModalOpen] = useState(false);

  if (!trip) return null;

  const activityMap = new Map((trip.activityPool || []).map((a) => [a.id, a]));
  const budgetInfo = calculateBudgetBreakdown(trip, trip.itinerary);

  const startMs = new Date(trip.startDate).getTime();
  const endMs = new Date(trip.endDate).getTime();
  const numDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);

  const currentDayItems = trip.itinerary.filter((i) => i.day === activeDay);
  const currentDayWeather = (trip.weather || []).find((w) => w.day === activeDay);

  // Total travel time for current trip
  const totalTravelMin = trip.itinerary.reduce((sum, i) => sum + (i.travelTimeBefore || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Alert Banner */}
      <AlertBanner alerts={trip.alerts} />

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
              <Compass className="w-4 h-4" /> Active Trip Workspace
            </div>
            <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-3">
              {trip.destination} Expedition
              <span className="text-xs font-semibold text-slate-400 font-mono bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                {numDays} Days ({trip.startDate} to {trip.endDate})
              </span>
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                {trip.travellers.adults} Adults
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                Budget: {trip.budget.currency} {trip.budget.total.toLocaleString()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                Estimated travel saved: ~45 min
              </span>
            </div>
          </div>

          {/* Primary Disruption Simulation Action */}
          <button
            onClick={() => setIsDisruptionModalOpen(true)}
            disabled={isReplanning}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 transition shrink-0"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Simulate Reality Disruption</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Budget</div>
          <div className="text-lg font-black text-white mt-1">{trip.budget.currency} {trip.budget.total.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Estimated Spend</div>
          <div className="text-lg font-black text-blue-400 mt-1">{trip.budget.currency} {budgetInfo.estimatedSpend.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Travel Time</div>
          <div className="text-lg font-black text-slate-200 mt-1">{totalTravelMin} min total</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Day {activeDay} Forecast</div>
            <div className="text-sm font-bold text-slate-200 capitalize mt-1">
              {currentDayWeather ? `${currentDayWeather.condition} (${currentDayWeather.tempC}°C)` : "Sunny (30°C)"}
            </div>
          </div>
          <CloudSun className="w-6 h-6 text-amber-400 shrink-0" />
        </div>
      </div>

      {/* Day Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {Array.from({ length: numDays }, (_, idx) => idx + 1).map((day) => {
            const isActive = activeDay === day;
            const dayItemsCount = trip.itinerary.filter((i) => i.day === day).length;
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                <span>Day {day}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-blue-800 text-white" : "bg-slate-800 text-slate-400"}`}>
                  {dayItemsCount}
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Showing Day {activeDay} Schedule ({currentDayItems.length} activities)
        </span>
      </div>

      {/* Timeline Items */}
      <div className="space-y-4">
        {currentDayItems.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
            <div className="text-slate-400 text-sm font-semibold">No activities scheduled for Day {activeDay}</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Use the AI Assistant chat drawer or click "Simulate Disruption" to automatically add or replan activities.
            </p>
          </div>
        ) : (
          currentDayItems.map((item, idx) => {
            const act = activityMap.get(item.activityId);
            if (!act) return null;
            return <ActivityCard key={idx} item={item} activity={act} trip={trip} />;
          })
        )}
      </div>

      {/* Why Explanation Modal */}
      <WhyExplanationModal />

      {/* Disruption Simulator Modal */}
      <DisruptionSimulatorModal isOpen={isDisruptionModalOpen} onClose={() => setIsDisruptionModalOpen(false)} />
    </div>
  );
};
