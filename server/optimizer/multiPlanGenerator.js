import { generateOptimizedItinerary } from "./itineraryOptimizer.js";
import { detectConflicts } from "./conflictDetector.js";
import { calculateBudgetBreakdown } from "./budgetOptimizer.js";

export function generateAlternativePlans(tripBase) {
  const paces = ["relaxed", "balanced", "packed"];
  const plans = {};

  paces.forEach((pace) => {
    const tripCopy = JSON.parse(JSON.stringify(tripBase));
    tripCopy.preferences = {
      ...(tripCopy.preferences || {}),
      pace
    };

    const { itinerary, breakdown, statistics } = generateOptimizedItinerary(tripCopy);
    tripCopy.itinerary = itinerary;
    const conflicts = detectConflicts(tripCopy);
    const budgetBreakdown = calculateBudgetBreakdown(tripCopy);

    // Calculate compatibility score (0 to 100%)
    let score = 85;
    if (pace === (tripBase.preferences?.pace || "balanced")) score += 10;
    if (conflicts.length === 0) score += 5;
    else score -= conflicts.length * 5;
    if (budgetBreakdown.overBudget) score -= 10;

    score = Math.max(50, Math.min(100, score));

    plans[pace] = {
      pace,
      title: pace === "relaxed" ? "Relaxed & Leisurely Plan" : pace === "packed" ? "Action-Packed Explorer Plan" : "Balanced Standard Plan",
      compatibilityScore: score,
      itinerary,
      conflicts,
      budgetBreakdown,
      statistics,
      summary: pace === "relaxed"
        ? "Designed for easy pacing with extra leisure time, 2-3 key attractions per day, and unhurried meals."
        : pace === "packed"
        ? "Maximizes sightseeing with 5+ places per day, early starts, and dense activity coverage."
        : "Optimal blend of major landmarks, cultural spots, and comfortable transit buffers."
    };
  });

  return plans;
}
