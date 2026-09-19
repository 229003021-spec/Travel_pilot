import React, { useState } from "react";
import { useTripStore } from "../../store/useTripStore";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { DollarSign, Edit3, Check, AlertTriangle, ShieldCheck } from "lucide-react";
import { calculateBudgetBreakdown } from "../../../../server/optimizer/budgetOptimizer.js";

export const BudgetBreakdownView: React.FC = () => {
  const { trip, executeAction } = useTripStore();
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(trip?.budget.total || 20000);

  if (!trip) return null;

  const budgetInfo = calculateBudgetBreakdown(trip, trip.itinerary);

  const pieData = [
    { name: "Accommodation", value: budgetInfo.categories.accommodation, color: "#3b82f6" },
    { name: "Transport", value: budgetInfo.categories.transport, color: "#8b5cf6" },
    { name: "Food & Dining", value: budgetInfo.categories.food, color: "#ec4899" },
    { name: "Activities & Fees", value: budgetInfo.categories.activities, color: "#10b981" },
    { name: "Miscellaneous (8%)", value: budgetInfo.categories.miscellaneous, color: "#f59e0b" },
  ];

  const handleSaveBudget = async () => {
    setIsEditing(false);
    if (newBudget !== trip.budget.total) {
      await executeAction({ action: "CHANGE_BUDGET", amount: Number(newBudget) });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Trip Budget</span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {!isEditing ? (
            <div className="text-2xl font-black text-white mt-2">
              {trip.budget.currency} {trip.budget.total.toLocaleString()}
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-blue-500 rounded-xl px-3 py-1.5 text-sm text-white outline-none"
              />
              <button
                onClick={handleSaveBudget}
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Estimated Spend */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estimated Total Spend</span>
          <div className="text-2xl font-black text-blue-400 mt-2">
            {trip.budget.currency} {budgetInfo.estimatedSpend.toLocaleString()}
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Remaining Buffer</span>
          <div className={`text-2xl font-black mt-2 ${budgetInfo.remaining >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {trip.budget.currency} {budgetInfo.remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown Donut */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Category Cost Breakdown
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${trip.budget.currency} ${val.toLocaleString()}`, "Estimated"]}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{trip.budget.currency} {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Cost Model Reference */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Documented Tier Cost Model
            </h3>
            <span className="text-xs uppercase font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
              {trip.preferences.tier} Tier
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Costs are modeled using TravelPilot's per-person-per-day tier rates combined with itemized activity fees.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
              <div className="font-bold text-slate-200">Accommodation Model</div>
              <div className="text-slate-400">Calculated per room night for {budgetInfo.numDays - 1} night(s).</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
              <div className="font-bold text-slate-200">Local Transport Model</div>
              <div className="text-slate-400">Calculated per day ({budgetInfo.numDays} days total).</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1">
              <div className="font-bold text-slate-200">Food & Dining Model</div>
              <div className="text-slate-400">Calculated for {budgetInfo.totalPeople} travellers over {budgetInfo.numDays} days.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
