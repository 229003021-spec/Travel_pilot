import { describe, it, expect } from "vitest";
import { calculateDistanceKm, calculateTravelTimeMin } from "../server/optimizer/travelTime.js";

describe("Travel Time & Distance Engine", () => {
  it("computes accurate haversine distance with 1.3 detour factor", () => {
    // Jaipur station (26.9200, 75.7950) to Amber Fort (26.9855, 75.8513)
    const dist = calculateDistanceKm(26.9200, 75.7950, 26.9855, 75.8513);
    expect(dist).toBeGreaterThan(9);
    expect(dist).toBeLessThan(18);
  });

  it("calculates symmetric travel distances", () => {
    const d1 = calculateDistanceKm(26.9200, 75.7950, 26.9258, 75.8237);
    const d2 = calculateDistanceKm(26.9258, 75.8237, 26.9200, 75.7950);
    expect(d1).toEqual(d2);
  });

  it("calculates travel time by mode with estimated provenance", () => {
    const drive = calculateTravelTimeMin(26.9200, 75.7950, 26.9258, 75.8237, "drive");
    const walk = calculateTravelTimeMin(26.9200, 75.7950, 26.9258, 75.8237, "walk");

    expect(drive.provenance).toBe("estimated");
    expect(walk.timeMin).toBeGreaterThan(drive.timeMin);
  });
});
