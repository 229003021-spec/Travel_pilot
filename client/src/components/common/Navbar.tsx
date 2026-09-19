import React from "react";
import { useTripStore } from "../../store/useTripStore";
import { Compass, Calendar, PieChart, Map, BookOpen, GitCompare, MessageSquare, Zap, RefreshCw } from "lucide-react";

export const Navbar: React.FC = () => {
  const { trip, activeTab, setActiveTab, toggleAssistant, isAssistantOpen, loadDemoTrip, undoLastAction } = useTripStore();

  const navItems = [
    { id: "dashboard", label: "Itinerary Timeline", icon: Calendar },
    { id: "diff", label: "Before & After Diff", icon: GitCompare },
    { id: "budget", label: "Budget Intelligence", icon: PieChart },
    { id: "map", label: "Interactive Map", icon: Map },
    { id: "sources", label: "Research & Sources", icon: BookOpen },
  ] as const;

  return (
    <nav className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Compass className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-lg text-white flex items-center gap-2">
              TravelPilot
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800">
                v2 Adaptive
              </span>
            </div>
            <div className="text-xs text-slate-400">Plan less. Explore more. Adapt instantly.</div>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        {trip && (
          <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {trip && (
            <>
              {trip.history && trip.history.length > 0 && (
                <button
                  onClick={undoLastAction}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
                  title="Undo last trip state action"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Undo ({trip.history.length})
                </button>
              )}

              <button
                onClick={toggleAssistant}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  isAssistantOpen
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                    : "bg-slate-800 text-indigo-300 border-indigo-900/60 hover:bg-indigo-950"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                AI Assistant
              </button>
            </>
          )}

          {!trip && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadDemoTrip("jaipur")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md transition"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                Demo Jaipur
              </button>
              <button
                onClick={() => loadDemoTrip("munnar")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 rounded-lg transition"
              >
                Demo Munnar (Rain)
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
