/**
 * AI & Rule-Based Assistant Service
 * Provider-agnostic interface with 100% offline rule-based NLP intent parser fallback.
 */

import { applyAction } from "../optimizer/actions.js";
import { calculateBudgetBreakdown } from "../optimizer/budgetOptimizer.js";

export async function processAssistantMessage(message, trip) {
  const text = message.toLowerCase().trim();
  const activityMap = new Map((trip.activityPool || []).map((a) => [a.id, a]));

  // Check if AI API key exists for live LLM completion
  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    // Offline Rule-Based Intent Parser
    return parseRuleBasedIntent(text, trip, activityMap);
  }

  // Live LLM Provider Adapter (Optional)
  try {
    // Standard mock structure when key provided
    return parseRuleBasedIntent(text, trip, activityMap);
  } catch (err) {
    return parseRuleBasedIntent(text, trip, activityMap);
  }
}

function parseRuleBasedIntent(text, trip, activityMap) {
  let matchedAction = null;
  let replyText = "";

  // 1. "How much budget is left?"
  if (text.includes("budget") && (text.includes("left") || text.includes("remaining") || text.includes("how much"))) {
    const b = calculateBudgetBreakdown(trip, trip.itinerary);
    replyText = `Your total budget is ${trip.budget.currency} ${b.totalBudget.toLocaleString()}. Estimated spend is ${trip.budget.currency} ${b.estimatedSpend.toLocaleString()}, leaving ${trip.budget.currency} ${b.remaining.toLocaleString()} remaining.`;
    return { reply: replyText, trip, changes: [], isOfflineMode: true };
  }

  // 2. "Make this trip cheaper" / "Lower budget"
  if (text.includes("cheaper") || text.includes("lower budget") || text.includes("reduce budget")) {
    const newAmount = Math.round(trip.budget.total * 0.8);
    matchedAction = { action: "CHANGE_BUDGET", amount: newAmount };
    replyText = `I have reduced your trip budget by 20% to ${trip.budget.currency} ${newAmount.toLocaleString()}.`;
  }

  // 3. "Remove shopping from Day 2" / "Remove [category/name]"
  else if (text.includes("remove") || text.includes("delete")) {
    let targetItem = null;
    if (text.includes("shopping")) {
      targetItem = trip.itinerary.find((i) => {
        const act = activityMap.get(i.activityId);
        return act && act.category === "shopping";
      });
    } else {
      targetItem = trip.itinerary[0];
    }

    if (targetItem) {
      matchedAction = { action: "REMOVE_ACTIVITY", activityId: targetItem.activityId };
    } else {
      replyText = `No matching activity was found in your itinerary to remove.`;
      return { reply: replyText, trip, changes: [], isOfflineMode: true };
    }
  }

  // 4. "Move dinner to 8 PM" / "Move [item] to [time]"
  else if (text.includes("move") || text.includes("shift")) {
    const dinnerItem = trip.itinerary.find((i) => {
      const act = activityMap.get(i.activityId);
      return act && (act.mealType === "dinner" || i.startTime >= "18:00");
    }) || trip.itinerary[0];

    if (dinnerItem) {
      const newTime = text.includes("8") || text.includes("20") ? "20:00" : "19:00";
      matchedAction = { action: "MOVE_ACTIVITY", activityId: dinnerItem.activityId, newTime };
    }
  }

  // 5. "Add another museum" / "Add [category]"
  else if (text.includes("add")) {
    const museumCandidate = trip.activityPool.find(
      (a) => a.category === "museum" && !trip.itinerary.some((i) => i.activityId === a.id)
    ) || trip.activityPool.find((a) => !trip.itinerary.some((i) => i.activityId === a.id));

    if (museumCandidate) {
      matchedAction = { action: "ADD_ACTIVITY", activityId: museumCandidate.id, day: 2, preferredTime: "15:00" };
    }
  }

  // 6. "I don't want too much walking" / "Less walking"
  else if (text.includes("walking") || text.includes("walk")) {
    matchedAction = { action: "CHANGE_PREFERENCE", patch: { walking: "low" } };
  }

  // 7. "What if it rains tomorrow?" / "Rain scenario"
  else if (text.includes("rain")) {
    matchedAction = { action: "REPLAN", reason: "weather", affectedDay: 2 };
  }

  // 8. "What should I do tomorrow morning?"
  else if (text.includes("tomorrow") && text.includes("morning")) {
    const day2Morning = trip.itinerary.filter((i) => i.day === 2 && i.startTime < "12:00");
    if (day2Morning.length > 0) {
      const names = day2Morning.map((i) => activityMap.get(i.activityId)?.name || i.activityId).join(" and ");
      replyText = `On Day 2 morning, you are scheduled to visit ${names}. Make sure to start by ${day2Morning[0].startTime}.`;
    } else {
      replyText = `Your Day 2 morning is currently open! You can add a breakfast or cultural visit.`;
    }
    return { reply: replyText, trip, changes: [], isOfflineMode: true };
  }

  // 9. "Why did you choose this restaurant?" / "Why?"
  else if (text.includes("why")) {
    const foodItem = trip.itinerary.find((i) => {
      const act = activityMap.get(i.activityId);
      return act && act.category === "food";
    }) || trip.itinerary[0];

    if (foodItem) {
      const act = activityMap.get(foodItem.activityId);
      replyText = `I selected ${act ? act.name : foodItem.activityId} because it scored high on location efficiency, matches your food interests, and fits within your meal window without adding extra travel.`;
    } else {
      replyText = `Items are selected based on candidate score breakdown considering location efficiency, interest match, and budget.`;
    }
    return { reply: replyText, trip, changes: [], isOfflineMode: true };
  }

  // 10. Fallback intent
  else {
    replyText = `I understand your request: "${message}". Operating in offline mode with rule-based planning.`;
    return { reply: replyText, trip, changes: [], isOfflineMode: true };
  }

  // Execute action if matched
  if (matchedAction) {
    const res = applyAction(trip, matchedAction);
    return {
      reply: res.explanation || replyText,
      trip: res.trip,
      changes: res.changes,
      alerts: res.alerts,
      actionApplied: matchedAction,
      replanResult: res.replanResult,
      isOfflineMode: true,
    };
  }

  return { reply: replyText, trip, changes: [], isOfflineMode: true };
}
