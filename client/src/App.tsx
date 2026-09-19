import React from "react";
import { useTripStore } from "./store/useTripStore";
import { Navbar } from "./components/common/Navbar";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TripWizard } from "./components/wizard/TripWizard";
import { BeforeAfterView } from "./components/diff/BeforeAfterView";
import { BudgetBreakdownView } from "./components/budget/BudgetBreakdownView";
import { MapView } from "./components/map/MapView";
import { ResearchSourcesView } from "./components/sources/ResearchSourcesView";
import { ChatDrawer } from "./components/assistant/ChatDrawer";

export const App: React.FC = () => {
  const { trip, activeTab } = useTripStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {!trip && activeTab !== "wizard" && <LandingPage />}

        {activeTab === "wizard" && <TripWizard />}

        {trip && activeTab === "dashboard" && <DashboardPage />}

        {trip && activeTab === "diff" && <BeforeAfterView />}

        {trip && activeTab === "budget" && <BudgetBreakdownView />}

        {trip && activeTab === "map" && <MapView />}

        {trip && activeTab === "sources" && <ResearchSourcesView />}
      </main>

      <ChatDrawer />
    </div>
  );
};

export default App;
