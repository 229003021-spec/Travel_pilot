import React, { useState } from "react";
import { useTripStore } from "../../store/useTripStore";
import { X, Calendar, DollarSign, Sparkles, ArrowRight, ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { calculateBudgetBreakdown } from "../../../../server/optimizer/budgetOptimizer.js";

interface Props {
  destinationName: string | null;
  onClose: () => void;
}

export const PlanningModal: React.FC<Props> = ({ destinationName, onClose }) => {
  const { generateTrip, isGenerating, setTrip, setActiveTab } = useTripStore();

  const [step, setStep] = useState<"dates" | "budget" | "options">("dates");
  const [fromDate, setFromDate] = useState("2026-10-01");
  const [toDate, setToDate] = useState("2026-10-04");
  const [budgetTotal, setBudgetTotal] = useState(15000);
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP" | "AED">("INR");
  const [underBudgetOptions, setUnderBudgetOptions] = useState<any[] | null>(null);

  if (!destinationName) return null;

  const startMs = new Date(fromDate).getTime();
  const endMs = new Date(toDate).getTime();
  const numDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);

  const handleNextToBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("budget");
  };

  const handleExecuteGeneration = async (targetBudget: number) => {
    const payload = {
      destination: destinationName,
      startDate: fromDate,
      endDate: toDate,
      travellers: { adults: 2, children: 0, elderly: 0 },
      budget: { total: targetBudget, currency },
      interests: ["History", "Culture", "Food", "Sightseeing"],
      preferences: {
        pace: "balanced",
        walking: "medium",
        food: [],
        setting: "mixed",
        tier: targetBudget < 12000 ? "budget" : targetBudget < 25000 ? "mid" : "luxury",
        dayStart: "09:00",
        dayEnd: "21:00",
        familyFriendly: false,
      },
      startingPoint: {
        type: "railway",
        name: `${destinationName} Central Station`,
        lat: 26.9124,
        lng: 75.7873,
      },
    };

    // Calculate minimum required expense baseline
    const mockTrip = {
      destination: destinationName,
      startDate: fromDate,
      endDate: toDate,
      travellers: { adults: 2, children: 0, elderly: 0 },
      budget: { total: targetBudget, currency },
      preferences: { tier: targetBudget < 12000 ? "budget" : targetBudget < 25000 ? "mid" : "luxury" },
      activityPool: [],
      itinerary: [],
    };

    const budgetInfo = calculateBudgetBreakdown(mockTrip, []);

    // Check if budget is significantly below real estimated spend
    if (targetBudget < budgetInfo.estimatedSpend * 0.8 && step !== "options") {
      // Build 3 plans in INCREASING budget order
      const budgetPlan = Math.round(budgetInfo.estimatedSpend * 0.75);
      const balancedPlan = Math.round(budgetInfo.estimatedSpend);
      const deluxePlan = Math.round(budgetInfo.estimatedSpend * 1.5);

      setUnderBudgetOptions([
        {
          tier: "Budget-Saver Plan",
          tag: "Minimal Cost",
          amount: budgetPlan,
          desc: "Free entry highlights, street dining, and budget accommodation.",
          color: "border-emerald-800 bg-emerald-950/40 text-emerald-300",
        },
        {
          tier: "Balanced Standard Plan",
          tag: "Recommended",
          amount: balancedPlan,
          desc: "Optimal mix of heritage sites, comfortable stay, and dining.",
          color: "border-blue-800 bg-blue-950/40 text-blue-300",
        },
        {
          tier: "Deluxe Premium Plan",
          tag: "Full Experience",
          amount: deluxePlan,
          desc: "Luxury hotel stay, fine dining, and full activity passes.",
          color: "border-purple-800 bg-purple-950/40 text-purple-300",
        },
      ]);
      setStep("options");
      return;
    }

    // Run Antigravity AI Agent Generation
    await generateTrip(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
            <Sparkles className="w-4 h-4" /> Antigravity AI Tourism Agent
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">Selected Destination</div>
            <h3 className="text-2xl font-black text-white mt-0.5">{destinationName}</h3>
          </div>

          {/* STEP 1: Date Range Entry */}
          {step === "dates" && (
            <form onSubmit={handleNextToBudget} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" /> Select Travel Dates
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">From Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none mt-1"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400">To Date</label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none mt-1"
                      required
                    />
                  </div>
                </div>

                <div className="text-xs text-blue-400 font-semibold pt-1">
                  Trip Duration: <span className="font-bold">{numDays} Days</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
              >
                <span>Continue to Budget Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: Budget Entry */}
          {step === "budget" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Enter Total Trip Budget
                </div>

                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white outline-none font-bold"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED</option>
                  </select>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={budgetTotal}
                    onChange={(e) => setBudgetTotal(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono font-bold outline-none"
                    placeholder="Enter total budget (e.g. 15000)"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Selected: {numDays} Days in {destinationName}</span>
                <button onClick={() => setStep("dates")} className="text-blue-400 hover:underline">
                  Change dates
                </button>
              </div>

              <button
                onClick={() => handleExecuteGeneration(budgetTotal)}
                disabled={isGenerating}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>Let Antigravity AI Agent Design Itinerary</span>
              </button>
            </div>
          )}

          {/* STEP 3: Under-Budget Increasing Order Plans */}
          {step === "options" && underBudgetOptions && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-800 text-xs text-amber-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-300 uppercase tracking-wider">Budget Shortfall Detected</div>
                  Your entered budget ({currency} {budgetTotal.toLocaleString()}) is below estimated real expenses for a {numDays}-day trip to {destinationName}. Below are options sorted in <b>increasing budget order</b>:
                </div>
              </div>

              <div className="space-y-2.5">
                {underBudgetOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleExecuteGeneration(opt.amount)}
                    className={`p-4 rounded-2xl border cursor-pointer hover:scale-[1.02] transition shadow-md ${opt.color} flex items-center justify-between gap-3`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{opt.tier}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300">
                          {opt.tag}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">{opt.desc}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-white font-mono">{currency} {opt.amount.toLocaleString()}</div>
                      <button className="text-[11px] font-bold text-blue-400 flex items-center gap-1 mt-1 justify-end">
                        <span>Select Plan</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
