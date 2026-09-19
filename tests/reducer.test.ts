import { describe, it, expect } from "vitest";
import { applyAction } from "../server/optimizer/actions.js";

describe("Action Reducer & Undo History", () => {
  const initialTrip = {
    id: "trip_reducer",
    destination: "Jaipur",
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    travellers: { adults: 2, children: 0, elderly: 0 },
    budget: { total: 20000, currency: "INR" },
    preferences: { pace: "balanced", walking: "medium" },
    startingPoint: { type: "railway", name: "Station", lat: 26.92, lng: 75.79 },
    activityPool: [
      { id: "act_1", name: "Attraction 1", category: "attraction", durationMin: 60, status: "available" },
      { id: "act_2", name: "Attraction 2", category: "museum", durationMin: 60, status: "available" },
    ],
    itinerary: [
      { activityId: "act_1", day: 1, startTime: "09:00", endTime: "10:00", travelTimeBefore: 10, travelMode: "drive" },
    ],
    history: [],
  };

  it("applies action, updates itinerary, and pushes snapshot to history", () => {
    const res = applyAction(initialTrip, { action: "REMOVE_ACTIVITY", activityId: "act_1" });
    expect(res.trip.itinerary.length).toBe(0);
    expect(res.trip.history.length).toBe(1);

    // Test Undo
    const lastSnap = res.trip.history[res.trip.history.length - 1];
    const restoredTrip = JSON.parse(lastSnap.tripStateJson);
    expect(restoredTrip.itinerary.length).toBe(1);
    expect(restoredTrip.itinerary[0].activityId).toBe("act_1");
  });
});
