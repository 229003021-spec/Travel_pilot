import { describe, it, expect } from "vitest";
import { processAssistantMessage } from "../server/services/aiService.js";

describe("Rule-Based Offline Assistant Parser", () => {
  const mockTrip = {
    id: "trip_ast",
    destination: "Jaipur",
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    travellers: { adults: 2, children: 0, elderly: 0 },
    budget: { total: 20000, currency: "INR" },
    preferences: { pace: "balanced", walking: "medium", tier: "mid" },
    startingPoint: { type: "railway", name: "Station", lat: 26.92, lng: 75.79 },
    activityPool: [
      { id: "jpr_amber_fort", name: "Amber Fort", category: "attraction", durationMin: 120, status: "available" },
      { id: "jpr_city_palace", name: "City Palace", category: "museum", durationMin: 90, status: "available" },
    ],
    itinerary: [
      { activityId: "jpr_amber_fort", day: 1, startTime: "09:00", endTime: "11:00", travelTimeBefore: 15, travelMode: "drive" },
      { activityId: "jpr_city_palace", day: 2, startTime: "10:00", endTime: "11:30", travelTimeBefore: 15, travelMode: "drive" },
    ],
    weather: [],
  };

  it("handles 'How much budget is left?' without API key", async () => {
    const res = await processAssistantMessage("How much budget is left?", mockTrip);
    expect(res.reply).toContain("budget");
    expect(res.isOfflineMode).toBe(true);
  });

  it("handles 'I don't want too much walking' and applies action", async () => {
    const res = await processAssistantMessage("I don't want too much walking", mockTrip);
    expect(res.trip.preferences.walking).toBe("low");
  });

  it("handles 'What if it rains tomorrow?' and replans day 2", async () => {
    const res = await processAssistantMessage("What if it rains tomorrow?", mockTrip);
    expect(res.actionApplied?.action).toBe("REPLAN");
  });
});
