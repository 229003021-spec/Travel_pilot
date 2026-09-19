import { describe, it, expect } from "vitest";
import { calculateBudgetBreakdown } from "../server/optimizer/budgetOptimizer.js";
import { applyAction } from "../server/optimizer/actions.js";

describe("Budget Optimizer Engine", () => {
  const mockTrip = {
    id: "trip_1",
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    travellers: { adults: 2, children: 0, elderly: 0 },
    budget: { total: 20000, currency: "INR" },
    preferences: { tier: "mid" },
    activityPool: [],
    itinerary: [
      { activityId: "jpr_amber_fort", day: 1, startTime: "09:30", endTime: "12:00", travelTimeBefore: 20, travelMode: "drive", estimatedCost: 500 },
      { activityId: "jpr_city_palace", day: 1, startTime: "13:00", endTime: "15:00", travelTimeBefore: 15, travelMode: "drive", estimatedCost: 300 },
    ],
  };

  it("calculates total budget and breakdown correctly", () => {
    const res = calculateBudgetBreakdown(mockTrip, mockTrip.itinerary);
    expect(res.totalBudget).toBe(20000);
    const sumCategories = res.categories.accommodation + res.categories.transport + res.categories.food + res.categories.activities + res.categories.miscellaneous;
    expect(res.estimatedSpend).toBe(sumCategories);
    expect(res.remaining).toBe(20000 - res.estimatedSpend);
  });

  it("handles lowered budget gracefully with over-budget critical alert", () => {
    const actionRes = applyAction(mockTrip, { action: "CHANGE_BUDGET", amount: 5000 });
    expect(actionRes.trip.budget.total).toBe(5000);
    expect(actionRes.alerts.some((a) => a.title.includes("BUDGET"))).toBe(true);
  });
});
