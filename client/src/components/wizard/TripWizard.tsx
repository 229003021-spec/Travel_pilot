import React, { useState, useEffect } from "react";
import { useTripStore } from "../../store/useTripStore";
import { fetchDestinations } from "../../services/api";
import { ProgressChecklist } from "./ProgressChecklist";
import { Compass, Calendar, Users, DollarSign, Heart, Sliders, MapPin, ArrowRight } from "lucide-react";

export const TripWizard: React.FC = () => {
  const { generateTrip, isGenerating, generationStage } = useTripStore();

  const [destinations, setDestinations] = useState<any[]>([]);
  const [destination, setDestination] = useState("Jaipur");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-10-04");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [budgetTotal, setBudgetTotal] = useState(20000);
  const [currency, setCurrency] = useState<"INR" | "USD" | "EUR" | "GBP" | "AED">("INR");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["History", "Culture", "Food", "Architecture"]);
  const [pace, setPace] = useState<"relaxed" | "balanced" | "packed">("balanced");
  const [walking, setWalking] = useState<"low" | "medium" | "high">("medium");
  const [tier, setTier] = useState<"budget" | "mid" | "luxury">("mid");

  useEffect(() => {
    fetchDestinations()
      .then(setDestinations)
      .catch(() => {});
  }, []);

  const interestOptions = [
    "History", "Culture", "Architecture", "Food", "Shopping", "Nature",
    "Adventure", "Museums", "Spiritual", "Nightlife", "Photography", "Entertainment"
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedDestObj = destinations.find((d) => d.name.toLowerCase() === destination.toLowerCase());
    const lat = selectedDestObj ? selectedDestObj.lat : 26.9124;
    const lng = selectedDestObj ? selectedDestObj.lng : 75.7873;

    const payload = {
      destination,
      startDate,
      endDate,
      travellers: { adults, children, elderly: 0 },
      budget: { total: budgetTotal, currency },
      interests: selectedInterests,
      preferences: {
        pace,
        walking,
        food: [],
        setting: "mixed",
        tier,
        dayStart: "09:00",
        dayEnd: "21:00",
        familyFriendly: children > 0,
      },
      startingPoint: {
        type: "railway",
        name: `${destination} Central Station`,
        lat,
        lng,
      },
    };

    await generateTrip(payload);
  };

  if (isGenerating) {
    return <ProgressChecklist currentStage={generationStage} />;
  }

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Compass className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Create Custom Adaptive Trip</h2>
          <p className="text-xs text-slate-400">Configure parameters for AI candidate optimization.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destination */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-400" /> Destination
          </label>
          <input
            type="text"
            list="dest-list"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-2.5 text-sm text-white outline-none transition"
            placeholder="Type or select destination (e.g. Jaipur, Munnar, Goa, Paris...)"
            required
          />
          <datalist id="dest-list">
            {destinations.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}, {d.country}
              </option>
            ))}
          </datalist>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-2.5 text-sm text-white outline-none"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-2.5 text-sm text-white outline-none"
              required
            />
          </div>
        </div>

        {/* Travellers & Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" /> Travellers (Adults)
            </label>
            <input
              type="number"
              min={1}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-2.5 text-sm text-white outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Total Budget
            </label>
            <div className="flex gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-2xl px-3 text-xs text-white outline-none"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AED">AED</option>
              </select>
              <input
                type="number"
                min={1000}
                step={500}
                value={budgetTotal}
                onChange={(e) => setBudgetTotal(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Interests Pills */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-blue-400" /> Travel Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((interest) => {
              const isSelected = selectedInterests.includes(interest);
              return (
                <button
                  type="button"
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preferences */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Pace</label>
            <select
              value={pace}
              onChange={(e) => setPace(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none"
            >
              <option value="relaxed">Relaxed (~3/day)</option>
              <option value="balanced">Balanced (~4/day)</option>
              <option value="packed">Packed (~6/day)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Walking</label>
            <select
              value={walking}
              onChange={(e) => setWalking(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none"
            >
              <option value="low">Low Walking</option>
              <option value="medium">Medium</option>
              <option value="high">High Walking</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none"
            >
              <option value="budget">Budget Tier</option>
              <option value="mid">Mid Tier</option>
              <option value="luxury">Luxury Tier</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
        >
          <span>Generate Optimized Itinerary</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
