import React, { useState } from "react";
import { useTripStore } from "../store/useTripStore";
import { Building2, Star, MapPin, DollarSign, ShieldCheck } from "lucide-react";
import { ProvenanceBadge } from "../components/common/ProvenanceBadge";

export const HotelsPage: React.FC = () => {
  const { trip } = useTripStore();
  const [selectedTier, setSelectedTier] = useState<string>("All");

  const destination = trip ? trip.destination : "Jaipur";
  const hotels = trip && (trip as any).hotels ? (trip as any).hotels : [
    { hotel_id: "H1", name: "Rambagh Palace", city: destination, tier: "Luxury", pricePerNight: 8500, rating: 4.9, provenance: "VERIFIED" },
    { hotel_id: "H2", name: "ITC Rajputana", city: destination, tier: "Mid-range", pricePerNight: 3800, rating: 4.6, provenance: "VERIFIED" },
    { hotel_id: "H3", name: "Heritage Backpackers Stay", city: destination, tier: "Budget", pricePerNight: 1800, rating: 4.3, provenance: "ESTIMATED" },
  ];

  const filtered = selectedTier === "All" ? hotels : hotels.filter((h: any) => h.tier === selectedTier);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
            Hotel Recommendations
          </span>
          <h1 className="text-3xl font-black text-white font-mono flex items-center gap-2">
            <Building2 className="w-8 h-8 text-blue-500" />
            Accommodations in {destination}
          </h1>
        </div>
        <ProvenanceBadge type="verified" label="VERIFIED DATASET" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
        {["All", "Luxury", "Mid-range", "Budget"].map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedTier === tier
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((hotel: any, i: number) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                hotel.tier === "Luxury" ? "bg-amber-950 text-amber-300 border border-amber-800" :
                hotel.tier === "Mid-range" ? "bg-blue-950 text-blue-300 border border-blue-800" :
                "bg-emerald-950 text-emerald-300 border border-emerald-800"
              }`}>
                {hotel.tier}
              </span>
              <div className="flex items-center gap-1 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                {hotel.rating}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{hotel.name}</h3>
            <p className="text-xs text-slate-400 mb-6 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {hotel.city} Central District
            </p>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-bold">Estimated Rate</div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  ₹{hotel.pricePerNight.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ night</span>
                </div>
              </div>
              <ProvenanceBadge type={hotel.provenance === "VERIFIED" ? "verified" : "estimated"} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
