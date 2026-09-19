import React, { useState, useEffect } from "react";
import { Search, Calendar, DollarSign, MapPin, Sparkles, ArrowRight, CheckCircle2, Building, Utensils, Award } from "lucide-react";
import { useTripStore } from "../store/useTripStore";
import { ProvenanceBadge } from "../components/common/ProvenanceBadge";
import { searchDestinationsApi, fetchDestinationOverviewApi } from "../services/api";

interface DestinationItem {
  dest_id?: string;
  city: string;
  state: string;
  region?: string;
  type?: string;
  ideal_stay_days?: number;
  best_season?: string;
}

export const FAMOUS_DESTINATIONS = [
  { name: "Taj Mahal (Agra)", city: "Agra", state: "Uttar Pradesh", type: "Heritage & Monument", img: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800" },
  { name: "Jaipur (Rajasthan)", city: "Jaipur", state: "Rajasthan", type: "Palaces & Culture", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800" },
  { name: "New Delhi", city: "New Delhi", state: "Delhi", type: "Capital & History", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800" },
  { name: "Goa", city: "Goa", state: "Goa", type: "Beaches & Nightlife", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800" },
  { name: "Kerala Backwaters", city: "Kerala Backwaters", state: "Kerala", type: "Nature & Houseboats", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800" },
  { name: "Varanasi (Uttar Pradesh)", city: "Varanasi", state: "Uttar Pradesh", type: "Spiritual & Ghats", img: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800" },
  { name: "Mumbai (Maharashtra)", city: "Mumbai", state: "Maharashtra", type: "Metropolis & Colonial", img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800" },
  { name: "Hampi (Karnataka)", city: "Hampi", state: "Karnataka", type: "UNESCO Ruins", img: "https://images.unsplash.com/photo-1600100395168-9844e99f6916?w=800" },
  { name: "Leh-Ladakh", city: "Leh", state: "Ladakh", type: "Himalayas & Adventure", img: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=800" },
  { name: "Mysuru (Karnataka)", city: "Mysuru", state: "Karnataka", type: "Royal Palaces", img: "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800" },
  { name: "Udaipur (Rajasthan)", city: "Udaipur", state: "Rajasthan", type: "Lakes & Luxury", img: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=800" },
  { name: "Ajanta and Ellora Caves (Maharashtra)", city: "Aurangabad", state: "Maharashtra", type: "Ancient Rock-cut Caves", img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=800" },
  { name: "Golden Temple (Amritsar)", city: "Amritsar", state: "Punjab", type: "Sacred Shrine & Culture", img: "https://images.unsplash.com/photo-1588096344356-788874a7813a?w=800" },
  { name: "Andaman and Nicobar Islands", city: "Port Blair", state: "Andaman & Nicobar", type: "Islands & Coral Reefs", img: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800" },
  { name: "Darjeeling (West Bengal)", city: "Darjeeling", state: "West Bengal", type: "Tea Gardens & Peaks", img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800" }
];

export const ExplorePage: React.FC = () => {
  const { generateTrip, isGenerating, generationStage } = useTripStore();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DestinationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDest, setSelectedDest] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);

  // Form states
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-10-04");
  const [budget, setBudget] = useState(25000);

  // Fetch search suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const data = await searchDestinationsApi(query);
        if (Array.isArray(data)) {
          setSearchResults(data);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error(err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch destination overview when selected
  useEffect(() => {
    if (selectedDest) {
      fetchDestinationOverviewApi(selectedDest).then((data) => setOverview(data));
    } else {
      setOverview(null);
    }
  }, [selectedDest]);

  const handleSelectDestination = (cityName: string) => {
    setSelectedDest(cityName);
    setQuery(cityName);
    setShowDropdown(false);
  };

  const handleStartPlanning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDest) return;

    generateTrip({
      destination: selectedDest,
      startDate,
      endDate,
      travellers: { adults: 2, children: 0, elderly: 0 },
      budget: { total: budget, currency: "INR" },
      interests: ["Sightseeing", "Heritage", "Food", "Culture"],
      preferences: { pace: "balanced", walking: "medium", dayStart: "08:30", dayEnd: "21:00", tier: "mid" },
      startingPoint: { type: "center", name: `${selectedDest} City Center` }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Hero Header & Search Section */}
      <div className="relative bg-gradient-to-b from-blue-950/60 via-slate-900 to-slate-950 border-b border-slate-800 pt-12 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-blue-300 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            AI Travel Planning Engine
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-mono mb-3">
            TRAVEL PILOT
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-sans">
            Autonomous trip planning powered by structured Indian tourism datasets. Search any city, state, or destination for an instant 17-step optimized itinerary.
          </p>

          {/* Search Bar Container */}
          <div className="relative max-w-2xl mx-auto z-20">
            <div className="relative flex items-center bg-slate-900 border-2 border-blue-600/80 rounded-2xl shadow-2xl shadow-blue-950 focus-within:border-blue-400 transition">
              <Search className="w-6 h-6 text-blue-400 ml-4 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setShowDropdown(true)}
                placeholder="Search destination (e.g. Bangalore, Jaipur, Goa, Tamil Nadu...)"
                className="w-full bg-transparent px-4 py-4 text-white text-lg placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setShowDropdown(false);
                  }}
                  className="mr-3 px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Vertical Alphabetical Suggestions Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto text-left z-30 divide-y divide-slate-800">
                <div className="px-4 py-2 bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Matching Destinations ({searchResults.length})</span>
                  <ProvenanceBadge type="verified" label="VERIFIED DATASET" />
                </div>
                {searchResults.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectDestination(item.city)}
                    className="px-4 py-3 hover:bg-blue-950/60 cursor-pointer flex items-center justify-between transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-900/40 text-blue-400 flex items-center justify-center font-bold text-sm">
                        {item.city.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-blue-300 transition">
                          {item.city}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.state} • {item.type || "Tourist Hub"}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 pt-10">
        {/* Selected Destination Card */}
        {selectedDest && (
          <div className="mb-12 bg-slate-900/90 border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/50 backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                  Selected Destination
                </span>
                <h2 className="text-3xl font-black text-white font-mono">{selectedDest}</h2>
              </div>
              <ProvenanceBadge type="verified" label="VERIFIED DATASET" />
            </div>

            {/* Overview Details Grid */}
            {overview && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-blue-400" />
                  <div>
                    <div className="text-xs text-slate-400">Places to Visit</div>
                    <div className="text-lg font-bold text-white">{overview.place_count} Places</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs text-slate-400">Ideal Stay</div>
                    <div className="text-lg font-bold text-white">{overview.ideal_stay_days} Days</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs text-slate-400">Dining Options</div>
                    <div className="text-lg font-bold text-white">{overview.restaurant_count} Spots</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-xs text-slate-400">Best Season</div>
                    <div className="text-lg font-bold text-white">{overview.best_season || "Oct-Mar"}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Trip Configuration Form */}
            <form onSubmit={handleStartPlanning} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  From Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  To Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Total Budget (₹ INR)
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  step={1000}
                  min={5000}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-3 mt-4">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-900/50 flex items-center justify-center gap-3 transition transform active:scale-98"
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                  {isGenerating ? `Optimizing Trip... Stage ${generationStage}/6` : `Generate Optimized Itinerary for ${selectedDest}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Famous Places Grid */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white font-mono flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-400" />
              Famous Places in India
            </h2>
            <p className="text-slate-400 text-xs">
              Select any destination to fetch dataset details and configure your itinerary.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-800 rounded-full text-slate-300 border border-slate-700">
            15 Curated Top Spots
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FAMOUS_DESTINATIONS.map((dest, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectDestination(dest.city)}
              className="group relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-blue-500/70 cursor-pointer shadow-lg transition duration-300 hover:shadow-2xl hover:shadow-blue-950/40 hover:-translate-y-1"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur text-blue-300 text-[11px] font-bold rounded-lg border border-slate-800">
                    {dest.type}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition flex items-center justify-between">
                  {dest.name}
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition transform group-hover:translate-x-1" />
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {dest.city}, {dest.state}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Dataset Available
                  </span>
                  <span className="text-blue-400 font-bold group-hover:underline">Select & Plan</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
