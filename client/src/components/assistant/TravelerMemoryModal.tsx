import React from "react";
import { useTripStore } from "../../store/useTripStore";
import { Brain, Heart, Utensils, Car, Wallet, Sparkles, Check, X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export const TravelerMemoryModal: React.FC<Props> = ({ onClose }) => {
  const { trip } = useTripStore();

  const memories = [
    { icon: Heart, label: "Travel Interests", value: trip ? trip.interests.join(", ") : "Heritage, Culture, Food, Architecture" },
    { icon: Car, label: "Transit Preference", value: "Shorter Transit Routes (< 30 min)" },
    { icon: Utensils, label: "Dining Preference", value: "Authentic Local Cuisine & Regional Delicacies" },
    { icon: Wallet, label: "Budget Tier", value: trip ? `₹${trip.budget.total.toLocaleString()} (${trip.preferences?.tier || "Mid-range"})` : "₹25,000 (Mid-range)" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Traveler Intent Memory</h3>
            <p className="text-xs text-slate-400">TravelPilot remembers your travel style across sessions.</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          {memories.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div key={idx} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-400 uppercase text-[10px]">{m.label}</div>
                  <div className="font-semibold text-white mt-0.5">{m.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition"
        >
          Close Memory Inspector
        </button>
      </div>
    </div>
  );
};
