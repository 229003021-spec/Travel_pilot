import React, { useState, useEffect, useRef } from "react";
import { Search, Calendar, DollarSign, MapPin, Sparkles, ArrowRight, CheckCircle2, Building, Utensils, Award, X } from "lucide-react";
import { useTripStore } from "../store/useTripStore";
import { ProvenanceBadge } from "../components/common/ProvenanceBadge";
import { searchDestinationsApi, fetchDestinationOverviewApi } from "../services/api";
import { searchDestinationsClient } from "../services/clientOptimizer";
import top15Destinations from "../data/top15_destinations.json";

interface DestinationItem {
  dest_id?: string;
  city: string;
  state: string;
  region?: string;
  type?: string;
  ideal_stay_days?: number;
  best_season?: string;
}

export const FAMOUS_DESTINATIONS = top15Destinations.map((d) => ({
  name: `${d.name} (${d.state})`,
  city: d.name,
  state: d.state,
  type: d.type,
  idealStayDays: d.idealStayDays,
  bestSeason: d.bestTimeToVisit,
  img: d.image || "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800"
}));

export const ExplorePage: React.FC = () => {
  const { generateTrip, isGenerating, generationStage } = useTripStore();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<DestinationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDest, setSelectedDest] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Form states
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-10-04");
  const [budget, setBudget] = useState(25000);

  // Instant local search calculation on query change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    const results = searchDestinationsClient(val);
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  };

  const handleInputFocus = () => {
    const results = searchDestinationsClient(query);
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSearchFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (searchResults.length > 0) {
      handleSelectDestination(searchResults[0].city);
    } else {
      handleSelectDestination(query.trim());
    }
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
          <div ref={searchContainerRef} className="relative max-w-2xl mx-auto z-20">
            <form onSubmit={handleSearchFormSubmit} className="relative flex items-center bg-slate-900 border-2 border-blue-600/80 rounded-2xl shadow-2xl shadow-blue-950 focus-within:border-blue-400 transition p-1.5">
              <Search className="w-6 h-6 text-blue-400 ml-3 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder="Search destination (e.g. Bangalore, Jaipur, Goa, Tamil Nadu...)"
                className="w-full bg-transparent px-3 py-3 text-white text-base sm:text-lg placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setSelectedDest(null);
                    setShowDropdown(false);
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 shrink-0 ml-1"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Vertical Alphabetical Suggestions Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto text-left z-30 divide-y divide-slate-800">
                <div className="px-4 py-2 bg-slate-950 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{query.trim() ? `Matching Suggestions (${searchResults.length})` : `Popular Destinations (${searchResults.length})`}</span>
                  <ProvenanceBadge type="verified" label="VERIFIED DATASET" />
                </div>
                {searchResults.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectDestination(item.city)}
                    className="px-4 py-3 hover:bg-blue-950/80 cursor-pointer flex items-center justify-between transition group"
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
          <div className="mb-12 bg-slate-900/90 border border-blue-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/50 backdrop-blur animate-in fade-in duration-300">
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
