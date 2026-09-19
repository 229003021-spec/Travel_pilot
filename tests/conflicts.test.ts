import { describe, it, expect } from "vitest";
import { detectConflicts } from "../server/optimizer/conflictDetector.js";

describe("Conflict Detection Engine", () => {
  const sampleTrip = {
    id: "trip_1",
    startDate: "2026-10-01",
    endDate: "2026-10-01",
    travellers: { adults: 2, children: 0, elderly: 0 },
    budget: { total: 20000, currency: "INR" },
    preferences: { walking: "low", tier: "mid" },
    activityPool: [
      {
        id: "act_high_walk",
        name: "Mountain Hike",
        category: "adventure",
        walkingIntensity: 3,
        openingHours: { value: { thu: [["08:00", "18:00"]] } },
      },
      {
        id: "act_closed",
        name: "Closed Museum",
        category: "museum",
        walkingIntensity: 1,
        openingHours: { value: { thu: "closed" } },
      },
    ],
    itinerary: [
      { activityId: "act_high_walk", day: 1, startTime: "09:00", endTime: "11:00", travelTimeBefore: 10, travelMode: "drive" },
      { activityId: "act_closed", day: 1, startTime: "10:30", endTime: "12:00", travelTimeBefore: 10, travelMode: "drive" },
    ],
  };

  it("detects walking preference, opening hours, and time overlap conflicts", () => {
    const conflicts = detectConflicts(sampleTrip);
    expect(conflicts.length).toBeGreaterThan(0);
    expect(conflicts.some((c) => c.type === "preference_conflict")).toBe(true);
    expect(conflicts.some((c) => c.type === "opening_hours")).toBe(true);
    expect(conflicts.some((c) => c.type === "time_overlap")).toBe(true);
  });
});
