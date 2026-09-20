import React from "react";
import { useTripStore } from "./store/useTripStore";
import { Navbar } from "./components/common/Navbar";
import { MobileNav } from "./components/common/MobileNav";
import { ExplorePage } from "./pages/ExplorePage";
import { SavedPage } from "./pages/SavedPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HotelsPage } from "./pages/HotelsPage";
import { RestaurantsPage } from "./pages/RestaurantsPage";
import { TripWizard } from "./components/wizard/TripWizard";
import { BeforeAfterView } from "./components/diff/BeforeAfterView";
import { BudgetBreakdownView } from "./components/budget/BudgetBreakdownView";
import { MapView } from "./components/map/MapView";
import { ResearchSourcesView } from "./components/sources/ResearchSourcesView";
import { ChatDrawer } from "./components/assistant/ChatDrawer";

export const App: React.FC = () => {
  const { trip, activeTab } = useTripStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      <Navbar />

      <main className="flex-1 w-full mx-auto">
        {activeTab === "explore" && <ExplorePage />}

        {activeTab === "saved" && <SavedPage />}

        {activeTab === "wizard" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <TripWizard />
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <DashboardPage />
          </div>
        )}

        {activeTab === "hotels" && <HotelsPage />}

        {activeTab === "restaurants" && <RestaurantsPage />}

        {activeTab === "diff" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <BeforeAfterView />
          </div>
        )}

        {activeTab === "budget" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <BudgetBreakdownView />
          </div>
        )}

        {activeTab === "map" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <MapView />
          </div>
        )}

        {activeTab === "sources" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <ResearchSourcesView />
          </div>
        )}
      </main>

      <ChatDrawer />
      <MobileNav />
    </div>
  );
};

export default App;
