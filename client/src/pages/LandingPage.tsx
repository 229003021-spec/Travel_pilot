import React, { useState } from "react";
import { SearchAutocomplete } from "../components/landing/SearchAutocomplete";
import { FamousPlacesGrid } from "../components/landing/FamousPlacesGrid";
import { PlanningModal } from "../components/planning/PlanningModal";
import { useTripStore } from "../store/useTripStore";
import { Compass, Sparkles, Cpu, RefreshCw, BarChart3, HelpCircle, ArrowRight } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { loadDemoTrip, setActiveTab } = useTripStore();
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);

  const features = [
    {
      title: "Antigravity AI Agent",
      icon: Sparkles,
      desc: "Designed to build clean, concise itineraries tailored to your dates and budget.",
    },
    {
      title: "Real-Time Adaptation",
      icon: RefreshCw,
      desc: "Automatically replans around rain, attraction closures, or budget cuts without clutter.",
    },
    {
      title: "Increasing Budget Plans",
      icon: BarChart3,
      desc: "If entered budget is low, presents options in increasing budget order (Budget, Standard, Premium).",
    },
  ];

  return (
    <div className="space-y-12 py-6 animate-in fade-in duration-300 pb-16">
      {/* Search Header Banner */}
      <div className="text-center space-y-6 max-w-3xl mx-auto relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/80 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Powered by Antigravity AI Agent
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight font-mono">
          TRAVEL PILOT
        </h1>

        <p className="text-base text-slate-300 leading-relaxed">
          Where do you want to explore? Search 500+ Indian destinations or select a famous landmark below.
        </p>

        {/* Search Bar with Vertical Alphabetical Suggestions */}
        <div className="pt-2">
          <SearchAutocomplete onSelectDestination={(destName) => setSelectedDestination(destName)} />
        </div>
      </div>

      {/* Famous Places in India (15 Cards) */}
      <FamousPlacesGrid onSelectPlace={(placeName) => setSelectedDestination(placeName)} />

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">{f.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Guided Step-by-Step Planning Modal */}
      <PlanningModal destinationName={selectedDestination} onClose={() => setSelectedDestination(null)} />
    </div>
  );
};
