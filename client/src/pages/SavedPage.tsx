import React from "react";
import { useTripStore } from "../store/useTripStore";
import { Heart, Calendar, Bookmark, User, Sparkles, MapPin, Trash2, ArrowRight } from "lucide-react";
import top15Destinations from "../data/top15_destinations.json";

export const SavedPage: React.FC = () => {
  const { trip, setTrip, setActiveTab } = useTripStore();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Bookmark className="w-4 h-4 text-blue-400" />
            <span>Personal Workspace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
            My Saved Trips & Wishlist
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access your saved itineraries, bookmarked destinations, and travel preferences.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("wizard")}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition"
        >
          <Sparkles className="w-4 h-4" />
          Plan New Itinerary
        </button>
      </div>

      {/* Active Trip Banner */}
      {trip ? (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-800/60 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-indigo-900/80 text-indigo-300 border border-indigo-700/80 text-xs font-bold rounded-full uppercase tracking-wider">
              Active Active Trip
            </span>
            <span className="text-xs text-slate-400">
              Updated: {new Date(trip.lastUpdated).toLocaleDateString()}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                {trip.destination} ({trip.itinerary.length} Days)
              </h2>
              <div className="text-xs text-slate-300 mt-1 space-x-3">
                <span>Budget: ₹{trip.budget.total.toLocaleString()}</span>
                <span>•</span>
                <span>Travelers: {trip.travellers.adults} Adults</span>
                <span>•</span>
                <span>Pace: {trip.preferences?.pace || "Balanced"}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("dashboard")}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              Open Active Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">No Active Trip Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Select one of the 15 Hackathon Featured Destinations to generate your custom AI itinerary.
          </p>
        </div>
      )}

      {/* Featured Hackathon Wishlist Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
          Hackathon Featured Destinations Wishlist (15 Iconic Places)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {top15Destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800 font-mono">
                    {dest.type}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {dest.idealStayDays} Days
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition">
                  {dest.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {dest.state} • {dest.bestTimeToVisit}
                </p>
              </div>

              <button
                onClick={() => {
                  setTrip(null);
                  setActiveTab("wizard");
                }}
                className="mt-4 w-full py-2 bg-slate-800 hover:bg-blue-600 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1"
              >
                <span>Plan {dest.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
