import { create } from "zustand";
import { Trip, Activity, ReplanResult, Action } from "../../../shared/types";
import { generateTripApi, applyActionApi, replanTripApi, sendAssistantMessageApi } from "../services/api";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  changes?: string[];
  replanResult?: ReplanResult;
  timestamp: string;
}

export type TabType = "explore" | "dashboard" | "wizard" | "budget" | "map" | "sources" | "diff" | "hotels" | "restaurants";

interface TripState {
  trip: Trip | null;
  activeTab: TabType;
  activeDay: number;
  activePlanPace: "relaxed" | "balanced" | "packed";
  isGenerating: boolean;
  generationStage: number;
  isReplanning: boolean;
  replanPipelineStage: string | null;
  replanResult: ReplanResult | null;
  isAssistantOpen: boolean;
  chatMessages: ChatMessage[];
  whyModalActivity: Activity | null;
  whyModalScore: any | null;

  // Actions
  setTrip: (trip: Trip | null) => void;
  setActiveTab: (tab: TabType) => void;
  setActiveDay: (day: number) => void;
  setActivePlanPace: (pace: "relaxed" | "balanced" | "packed") => void;
  toggleAssistant: () => void;
  setWhyModal: (activity: Activity | null, score?: any) => void;

  // Complex Async Actions
  generateTrip: (payload: any) => Promise<void>;
  loadDemoTrip: (destination: "jaipur" | "munnar" | "agra") => Promise<void>;
  toggleLockItem: (activityId: string) => void;
  executeAction: (action: Action) => Promise<void>;
  triggerDisruption: (disruptionId: string) => Promise<void>;
  undoLastAction: () => void;
  sendChatMessage: (text: string) => Promise<void>;
}

export const useTripStore = create<TripState>((set, get) => ({
  trip: null,
  activeTab: "explore",
  activeDay: 1,
  activePlanPace: "balanced",
  isGenerating: false,
  generationStage: 0,
  isReplanning: false,
  replanPipelineStage: null,
  replanResult: null,
  isAssistantOpen: false,
  chatMessages: [
    {
      id: "msg_init",
      sender: "assistant",
      text: "Hello! I am TravelPilot. I monitor your trip and adapt automatically when plans change. Ask me anything or tell me what to adjust!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ],
  whyModalActivity: null,
  whyModalScore: null,

  setTrip: (trip) => set({ trip }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveDay: (activeDay) => set({ activeDay }),
  setActivePlanPace: (activePlanPace) => {
    const { trip } = get();
    if (trip && (trip as any).plans && (trip as any).plans[activePlanPace]) {
      const planVariant = (trip as any).plans[activePlanPace];
      set({
        activePlanPace,
        trip: {
          ...trip,
          itinerary: planVariant.itinerary,
          statistics: planVariant.statistics || trip.statistics,
        },
      });
    } else {
      set({ activePlanPace });
    }
  },
  toggleAssistant: () => set((s) => ({ isAssistantOpen: !s.isAssistantOpen })),
  setWhyModal: (activity, score = null) => set({ whyModalActivity: activity, whyModalScore: score }),

  generateTrip: async (payload) => {
    set({ isGenerating: true, generationStage: 0 });

    for (let stage = 1; stage <= 6; stage++) {
      await new Promise((r) => setTimeout(r, 200));
      set({ generationStage: stage });
    }

    const trip = await generateTripApi(payload);
    set({ trip, isGenerating: false, activeTab: "dashboard", activeDay: 1, activePlanPace: "balanced" });
  },

  loadDemoTrip: async (destination) => {
    set({ isGenerating: true, generationStage: 0 });

    for (let stage = 1; stage <= 6; stage++) {
      await new Promise((r) => setTimeout(r, 150));
      set({ generationStage: stage });
    }

    let payload: any;
    if (destination === "agra") {
      payload = {
        destination: "Agra",
        startDate: "2026-10-01",
        endDate: "2026-10-03",
        travellers: { adults: 2, children: 0, elderly: 0 },
        budget: { total: 18000, currency: "INR" },
        interests: ["Heritage", "Architecture", "Photography"],
        preferences: { pace: "balanced", walking: "medium", dayStart: "08:00", dayEnd: "20:00", tier: "mid" },
        startingPoint: { type: "railway", name: "Agra Cantt Railway Station", lat: 27.1582, lng: 78.0064 },
      };
    } else if (destination === "munnar") {
      payload = {
        destination: "Munnar",
        startDate: "2026-10-01",
        endDate: "2026-10-03",
        travellers: { adults: 2, children: 0, elderly: 0 },
        budget: { total: 15000, currency: "INR" },
        interests: ["Nature", "Food", "Photography"],
        preferences: { pace: "balanced", walking: "medium", dayStart: "09:00", dayEnd: "21:00", tier: "mid" },
        startingPoint: { type: "hotel", name: "Munnar Tea Resort", lat: 10.0889, lng: 77.0595 },
      };
    } else {
      payload = {
        destination: "Jaipur",
        startDate: "2026-10-01",
        endDate: "2026-10-04",
        travellers: { adults: 2, children: 0, elderly: 0 },
        budget: { total: 20000, currency: "INR" },
        interests: ["History", "Culture", "Food", "Architecture"],
        preferences: { pace: "balanced", walking: "medium", dayStart: "09:00", dayEnd: "21:00", tier: "mid" },
        startingPoint: { type: "railway", name: "Jaipur Railway Station", lat: 26.9200, lng: 75.7950 },
      };
    }

    const trip = await generateTripApi(payload);
    set({ trip, isGenerating: false, activeTab: "dashboard", activeDay: 1, activePlanPace: "balanced" });
  },

  toggleLockItem: (activityId) => {
    const { trip } = get();
    if (!trip) return;

    const newItinerary = trip.itinerary.map((item) =>
      item.activityId === activityId ? { ...item, locked: !item.locked } : item
    );

    set({ trip: { ...trip, itinerary: newItinerary } });
  },

  executeAction: async (action) => {
    const { trip } = get();
    if (!trip) return;

    set({ isReplanning: true });
    const res = await applyActionApi(trip, action);
    set({
      trip: res.trip,
      replanResult: res.replanResult || null,
      isReplanning: false,
    });
  },

  triggerDisruption: async (disruptionId) => {
    const { trip } = get();
    if (!trip) return;

    set({ isReplanning: true, replanPipelineStage: "DETECTED" });
    await new Promise((r) => setTimeout(r, 400));
    set({ replanPipelineStage: "ANALYZING" });
    await new Promise((r) => setTimeout(r, 400));
    set({ replanPipelineStage: "SEARCHING" });
    await new Promise((r) => setTimeout(r, 400));
    set({ replanPipelineStage: "OPTIMIZING" });
    await new Promise((r) => setTimeout(r, 400));

    let action: Action;
    if (disruptionId === "amber_fort_closed") {
      action = { action: "MARK_UNAVAILABLE", activityId: "jpr_amber_fort", reason: "closed" };
    } else if (disruptionId === "munnar_heavy_rain") {
      action = { action: "REPLAN", reason: "weather", affectedDay: 2 };
    } else if (disruptionId === "budget_reduced") {
      action = { action: "CHANGE_BUDGET", amount: Math.round(trip.budget.total * 0.75) };
    } else {
      action = { action: "REPLAN", reason: "disruption", affectedDay: 1 };
    }

    const res = await applyActionApi(trip, action);

    set({
      trip: res.trip,
      replanResult: res.replanResult || null,
      replanPipelineStage: "REPLANNED",
      isReplanning: false,
      activeTab: "diff",
    });
  },

  undoLastAction: () => {
    const { trip } = get();
    if (!trip || !trip.history || trip.history.length === 0) return;

    const historyCopy = [...trip.history];
    const lastSnap = historyCopy.pop();

    if (lastSnap) {
      const restoredTrip: Trip = JSON.parse(lastSnap.tripStateJson);
      restoredTrip.history = historyCopy;
      set({ trip: restoredTrip, replanResult: null });
    }
  },

  sendChatMessage: async (text) => {
    const { trip, chatMessages } = get();
    if (!trip) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    set({ chatMessages: [...chatMessages, userMsg] });

    try {
      const res = await sendAssistantMessageApi(text, trip);
      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: "assistant",
        text: res.reply,
        changes: res.changes,
        replanResult: res.replanResult,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      set({
        trip: res.trip || trip,
        chatMessages: [...get().chatMessages, assistantMsg],
        replanResult: res.replanResult || get().replanResult,
      });
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: "assistant",
        text: "I encountered an error processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      set({ chatMessages: [...get().chatMessages, errorMsg] });
    }
  },
}));
