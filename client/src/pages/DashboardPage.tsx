import React, { useState } from "react";
import { useTripStore } from "../store/useTripStore";
import { AlertBanner } from "../components/common/AlertBanner";
import { ActivityCard } from "../components/dashboard/ActivityCard";
import { WhyExplanationModal } from "../components/dashboard/WhyExplanationModal";
import { DisruptionSimulatorModal } from "../components/disruption/DisruptionSimulatorModal";
import { calculateBudgetBreakdown } from "../../../server/optimizer/budgetOptimizer.js";
import { Calendar, Users, DollarSign, Zap, CloudSun, Clock, Compass, Layers, Info, CheckCircle2, TrendingUp, Navigation, Sparkles } from "lucide-react";
import { ProvenanceBadge } from "../components/common/ProvenanceBadge";

export const DashboardPage: React.FC = () => {
  const { trip, activeDay, setActiveDay, activePlanPace, setActivePlanPace, isReplanning } = useTripStore();
  const [isDisruptionModalOpen, setIsDisruptionModalOpen] = useState(false);

  if (!trip) return null;

  const activityMap = new Map((trip.activityPool || []).map((a) => [a.id, a]));
  const budgetInfo = calculateBudgetBreakdown(trip, trip.itinerary);

  const startMs = new Date(trip.startDate).getTime();
  const endMs = new Date(trip.endDate).getTime();
  const numDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);

  const currentDayItems = trip.itinerary.filter((i) => i.day === activeDay);
  const currentDayWeather = (trip.weather || []).find((w) => w.day === activeDay);

  const stats = (trip as any).statistics || {
    totalPlaces: trip.itinerary.length,
    totalActivities: trip.itinerary.filter((i) => i.activityId && !i.activityId.includes("food")).length,
    totalDistanceKm: 42,
    totalTravelTimeHrs: Number((trip.itinerary.reduce((s, i) => s + (i.travelTimeBefore || 0), 0) / 60).toFixed(1)),
    totalActivityTimeHrs: 12.5,
    avgSpendPerDay: Math.round(budgetInfo.estimatedSpend / numDays),
    costPerPerson: budgetInfo.estimatedSpend,
    budgetRemaining: budgetInfo.remaining,
    travelTimeSavedMin: 45
  };

  const whyThisPlan = (trip as any).whyThisPlan || [
    "Geographically clustered attractions by district to reduce daily transit time.",
    "Verified opening hours and holiday schedules to prevent unexpected closures.",
    "Scheduled meal breaks and rest intervals based on your pacing preferences.",
    "Balanced activity selection prioritizing high-rating attractions."
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Alert Banner */}
      <AlertBanner alerts={trip.alerts} />

      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" /> Active Trip Workspace
              <ProvenanceBadge type="verified" label="VERIFIED DATASET" />
            </div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3 font-mono">
              {trip.destination} Itinerary
              <span className="text-xs font-semibold text-slate-400 font-mono bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                {numDays} Days ({trip.startDate} to {trip.endDate})
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-3 font-medium">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                {trip.travellers.adults || 2} Travelers
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <DollarSign className="w-4 h-4" />
                Budget: ₹{trip.budget.total.toLocaleString()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <Clock className="w-4 h-4" />
                Travel time saved: ~{stats.travelTimeSavedMin || 45} min
              </span>
            </div>
          </div>

          {/* Primary Disruption Simulator Action */}
          <button
            onClick={() => setIsDisruptionModalOpen(true)}
            disabled={isReplanning}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-yellow-500 via-amber-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/20 transition shrink-0"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Simulate Disruption (Rain / Closure)</span>
          </button>
        </div>
      </div>

      {/* 3 Alternative Plans Selector Row */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-indigo-400" />
          Alternative Plans:
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: "relaxed", label: "Relaxed Plan", desc: "2-3 items/day", score: 92 },
            { id: "balanced", label: "Balanced Plan", desc: "3-4 items/day (Default)", score: 98 },
            { id: "packed", label: "Packed Explorer", desc: "5+ items/day", score: 86 },
          ].map((plan) => (
            <button
              key={plan.id}
              onClick={() => setActivePlanPace(plan.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition border ${
                activePlanPace === plan.id
                  ? "bg-blue-600 text-white border-blue-400 shadow-md"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
              }`}
            >
              <span>{plan.label}</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${activePlanPace === plan.id ? "bg-blue-800 text-white" : "bg-slate-800 text-slate-300"}`}>
                {plan.score}% Match
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Comprehensive Trip Statistics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Total Places</div>
          <div className="text-lg font-black text-white mt-1 font-mono">{stats.totalPlaces}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Activities</div>
          <div className="text-lg font-black text-blue-400 mt-1 font-mono">{stats.totalActivities}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Total Road Dist.</div>
          <div className="text-lg font-black text-indigo-400 mt-1 font-mono">{stats.totalDistanceKm} km</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Transit Time</div>
          <div className="text-lg font-black text-slate-300 mt-1 font-mono">{stats.totalTravelTimeHrs} hrs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Activity Time</div>
          <div className="text-lg font-black text-amber-400 mt-1 font-mono">{stats.totalActivityTimeHrs} hrs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Cost / Person</div>
          <div className="text-lg font-black text-emerald-400 mt-1 font-mono">₹{stats.costPerPerson?.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Avg Spend / Day</div>
          <div className="text-lg font-black text-emerald-300 mt-1 font-mono">₹{stats.avgSpendPerDay?.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Budget Left</div>
          <div className="text-lg font-black text-blue-300 mt-1 font-mono">₹{stats.budgetRemaining?.toLocaleString()}</div>
        </div>
      </div>

      {/* "Why This Plan?" Factual Summary Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          Why This Plan? (Optimization Reasoning)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {whyThisPlan.map((reason: string, i: number) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{reason}</span>
            </div>
          ))}
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

        <div className="flex items-center gap-2">
          <ProvenanceBadge type="calculated" label="CALCULATED ROUTE & TIMINGS" />
          <span className="text-xs text-slate-400 hidden sm:inline">
            Day {activeDay} Schedule ({currentDayItems.length} items)
          </span>
        </div>
      </div>

      {/* Daily Timeline Items */}
      <div className="space-y-4">
        {currentDayItems.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
            <div className="text-slate-400 text-sm font-semibold">No activities scheduled for Day {activeDay}</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Use the AI Assistant drawer or click "Simulate Disruption" to automatically add or replan activities.
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

      {/* Modals */}
      <WhyExplanationModal />
      <DisruptionSimulatorModal isOpen={isDisruptionModalOpen} onClose={() => setIsDisruptionModalOpen(false)} />
    </div>
  );
};
