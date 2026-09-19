import React from "react";
import { useTripStore } from "../../store/useTripStore";
import { Compass, Calendar, PieChart, Map, BookOpen, GitCompare, MessageSquare, Zap, RefreshCw } from "lucide-react";

export const Navbar: React.FC = () => {
  const { trip, activeTab, setActiveTab, toggleAssistant, isAssistantOpen, loadDemoTrip, undoLastAction, setTrip } = useTripStore();

  const navItems = [
    { id: "dashboard", label: "Itinerary Timeline", icon: Calendar },
    { id: "diff", label: "Before & After Diff", icon: GitCompare },
    { id: "budget", label: "Budget Intelligence", icon: PieChart },
    { id: "map", label: "Interactive Map", icon: Map },
    { id: "sources", label: "Research & Sources", icon: BookOpen },
  ] as const;

  return (
    <nav className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            setTrip(null);
            setActiveTab("dashboard");
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-black text-xl tracking-wider text-white flex items-center gap-2 font-mono">
              TRAVEL PILOT
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/80">
                AI AGENT
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Adaptive Tourism Intelligence</div>
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

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {trip ? (
            <>
              {trip.history && trip.history.length > 0 && (
                <button
                  onClick={undoLastAction}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition"
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
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadDemoTrip("jaipur")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                Quick Jaipur Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
