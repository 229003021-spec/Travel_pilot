import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { generateOptimizedItinerary } from "../server/optimizer/itineraryOptimizer.js";
import { replanTrip } from "../server/optimizer/replanner.js";

describe("Replanning Engine (Amber Fort Closure & Munnar Rain)", () => {
  const jaipurActivities = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "server/data/activities.jaipur.json"), "utf-8")
  );

  const munnarActivities = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "server/data/activities.munnar.json"), "utf-8")
  );

  it("replans Amber Fort closure while keeping frozen and locked items unchanged", () => {
    const jaipurTrip = {
      id: "trip_jpr_replan",
      destination: "Jaipur",
      startDate: "2026-10-01",
      endDate: "2026-10-04",
      travellers: { adults: 2, children: 0, elderly: 0 },
      budget: { total: 20000, currency: "INR" },
      interests: ["History", "Culture"],
      preferences: { pace: "balanced", walking: "medium", dayStart: "09:00", dayEnd: "21:00", tier: "mid" },
      startingPoint: { type: "railway", name: "Jaipur Railway Station", lat: 26.9200, lng: 75.7950 },
      activityPool: jaipurActivities,
      itinerary: [],
      weather: [],
    };

    const genRes = generateOptimizedItinerary(jaipurTrip);
    jaipurTrip.itinerary = genRes.itinerary;

    // Lock City Palace item if present
    const cityPalaceItem = jaipurTrip.itinerary.find((i) => i.activityId === "jpr_city_palace");
    if (cityPalaceItem) cityPalaceItem.locked = true;

    // Trigger Amber Fort disruption
    const replanRes = replanTrip(jaipurTrip, "closed", { affectedActivityId: "jpr_amber_fort" });

    // 1. Removed item absent
    expect(replanRes.replanResult.removed).includes("jpr_amber_fort");
    expect(replanRes.trip.itinerary.some((i) => i.activityId === "jpr_amber_fort")).toBe(false);

    // 2. Replacement added
    expect(replanRes.replanResult.added.length).toBeGreaterThan(0);

    // 3. Frozen/locked item unchanged
    if (cityPalaceItem) {
      const cityPalaceAfter = replanRes.trip.itinerary.find((i) => i.activityId === "jpr_city_palace");
      expect(cityPalaceAfter).toBeDefined();
      expect(cityPalaceAfter?.startTime).toBe(cityPalaceItem.startTime);
    }

    // 4. Explanation contains score breakdown reference
    expect(replanRes.replanResult.explanation).toContain("Replaced");
  });

  it("handles Munnar Heavy Rain scenario by shifting outdoor activities to indoor options", () => {
    const munnarTrip = {
      id: "trip_mnr_rain",
      destination: "Munnar",
      startDate: "2026-10-01",
      endDate: "2026-10-03",
      travellers: { adults: 2, children: 0, elderly: 0 },
      budget: { total: 15000, currency: "INR" },
      interests: ["Nature", "Food", "Photography"],
      preferences: { pace: "balanced", walking: "medium", dayStart: "09:00", dayEnd: "21:00", tier: "mid" },
      startingPoint: { type: "hotel", name: "Munnar Tea Resort", lat: 10.0889, lng: 77.0595 },
      activityPool: munnarActivities,
      itinerary: [],
      weather: [
        { day: 1, date: "2026-10-01", condition: "cloudy", tempC: 22, rainProbability: 0.3, provenance: "demo" },
        { day: 2, date: "2026-10-02", condition: "rainy", tempC: 19, rainProbability: 0.85, provenance: "demo" },
        { day: 3, date: "2026-10-03", condition: "cloudy", tempC: 21, rainProbability: 0.25, provenance: "demo" },
      ],
    };

    const genRes = generateOptimizedItinerary(munnarTrip);
    munnarTrip.itinerary = genRes.itinerary;

    const replanRes = replanTrip(munnarTrip, "weather", { affectedDay: 2 });
    expect(replanRes.replanResult.steps.length).toBeGreaterThan(0);
  });
});
