import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { generateOptimizedItinerary } from "../server/optimizer/itineraryOptimizer.js";
import { detectConflicts } from "../server/optimizer/conflictDetector.js";

describe("Jaipur Itinerary Generation", () => {
  const jaipurActivities = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "server/data/activities.jaipur.json"), "utf-8")
  );

  const jaipurTripReq = {
    id: "trip_jaipur_demo",
    destination: "Jaipur",
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    travellers: { adults: 2, children: 0, elderly: 0 },
    budget: { total: 40000, currency: "INR" },
    interests: ["History", "Culture", "Food", "Architecture"],
    preferences: {
      pace: "balanced",
      walking: "medium",
      food: [],
      setting: "mixed",
      tier: "mid",
      dayStart: "09:00",
      dayEnd: "21:00",
      familyFriendly: false,
    },
    startingPoint: { type: "railway", name: "Jaipur Railway Station", lat: 26.9200, lng: 75.7950 },
    activityPool: jaipurActivities,
    itinerary: [],
    weather: [
      { day: 1, date: "2026-10-01", condition: "sunny", tempC: 31, rainProbability: 0.05, provenance: "demo" },
      { day: 2, date: "2026-10-02", condition: "sunny", tempC: 32, rainProbability: 0.1, provenance: "demo" },
      { day: 3, date: "2026-10-03", condition: "cloudy", tempC: 29, rainProbability: 0.2, provenance: "demo" },
      { day: 4, date: "2026-10-04", condition: "sunny", tempC: 30, rainProbability: 0.05, provenance: "demo" },
    ],
    alerts: [],
    sources: [],
    history: [],
    lastUpdated: new Date().toISOString(),
  };

  it("generates a 4-day Jaipur itinerary without duplicates or critical conflicts", () => {
    const res = generateOptimizedItinerary(jaipurTripReq);
    expect(res.itinerary.length).toBeGreaterThan(5);

    const activityIds = res.itinerary.map((i) => i.activityId);
    const uniqueIds = new Set(activityIds);
    expect(uniqueIds.size).toEqual(activityIds.length);

    jaipurTripReq.itinerary = res.itinerary;
    const conflicts = detectConflicts(jaipurTripReq);
    const criticalConflicts = conflicts.filter((c) => c.severity === "critical");
    expect(criticalConflicts.length).toBe(0);
  });
});
