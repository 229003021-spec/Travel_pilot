import React from "react";
import { useTripStore, TabType } from "../../store/useTripStore";
import { Search, Sparkles, Calendar, Heart, MessageSquare } from "lucide-react";

export const MobileNav: React.FC = () => {
  const { trip, activeTab, setActiveTab, toggleAssistant, isAssistantOpen } = useTripStore();

  const navItems: { id: TabType | "assistant" | "saved"; label: string; icon: any }[] = [
    { id: "explore", label: "Explore", icon: Search },
    { id: "wizard", label: "Plan", icon: Sparkles },
    ...(trip ? [{ id: "dashboard" as TabType, label: "Trip", icon: Calendar }] : []),
    { id: "saved" as TabType, label: "Saved", icon: Heart },
    { id: "assistant", label: "AI Chat", icon: MessageSquare },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.id === "assistant" ? isAssistantOpen : activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === "assistant") {
                toggleAssistant();
              } else {
                setActiveTab(item.id as TabType);
              }
            }}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl text-[11px] font-bold transition ${
              isActive
                ? "text-blue-400 font-extrabold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className={`p-1.5 rounded-xl ${isActive ? "bg-blue-950/80 border border-blue-800/80 text-blue-400" : ""}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
