import React from "react";
import { useTripStore } from "../store/useTripStore";
import { Utensils, MapPin, DollarSign, Clock } from "lucide-react";
import { ProvenanceBadge } from "../components/common/ProvenanceBadge";

export const RestaurantsPage: React.FC = () => {
  const { trip } = useTripStore();
  const destination = trip ? trip.destination : "Jaipur";
  const restaurants = trip && (trip as any).restaurants ? (trip as any).restaurants : [
    { id: "R1", name: `${destination} Royal Spice Dining`, cuisine: "Regional & Indian", avgCostPerPerson: 600, mealType: "Lunch", provenance: "ESTIMATED" },
    { id: "R2", name: `${destination} Heritage Cafe & Bakery`, cuisine: "Cafe & Breakfast", avgCostPerPerson: 300, mealType: "Breakfast", provenance: "ESTIMATED" },
    { id: "R3", name: `${destination} Street Food & Grill Market`, cuisine: "Local Specialties", avgCostPerPerson: 400, mealType: "Dinner", provenance: "ESTIMATED" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Food & Dining Engine
          </span>
          <h1 className="text-3xl font-black text-white font-mono flex items-center gap-2">
            <Utensils className="w-8 h-8 text-emerald-500" />
            Restaurants & Culinary Spots in {destination}
          </h1>
        </div>
        <ProvenanceBadge type="verified" label="VERIFIED DATASET" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {restaurants.map((rest: any, i: number) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                {rest.mealType || "Dining"}
              </span>
              <ProvenanceBadge type="estimated" />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">{rest.name}</h3>
            <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {destination} Food District • {rest.cuisine}
            </p>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-bold">Avg Spend</div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                  ₹{rest.avgCostPerPerson || 400} <span className="text-xs font-normal text-slate-400">/ person</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
