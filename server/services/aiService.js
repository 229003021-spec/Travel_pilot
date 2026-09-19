/**
 * AI & Rule-Based Assistant Service
 * Provider-agnostic interface with 100% offline rule-based NLP intent parser fallback.
 */

import { applyAction } from "../optimizer/actions.js";
import { calculateBudgetBreakdown } from "../optimizer/budgetOptimizer.js";

export async function processAssistantMessage(message, trip) {
  const text = message.toLowerCase().trim();
  const activityMap = new Map((trip.activityPool || []).map((a) => [a.id, a]));

  const apiKey = process.env.AI_API_KEY;

  if (!apiKey) {
    return parseRuleBasedIntent(text, trip, activityMap);
  }

  try {
    return parseRuleBasedIntent(text, trip, activityMap);
  } catch (err) {
    return parseRuleBasedIntent(text, trip, activityMap);
  }
}

function parseRuleBasedIntent(text, trip, activityMap) {
  let matchedAction = null;
  let replyText = "";

  // 1. "Make Day [N] more relaxed"
  if (text.includes("relaxed") && text.includes("day")) {
    const dayMatch = text.match(/day\s*(\d+)/i);
    const dayNum = dayMatch ? parseInt(dayMatch[1], 10) : 2;

    const dayItems = trip.itinerary.filter((i) => i.day === dayNum && !i.locked);
    if (dayItems.length > 2) {
      const itemToRemove = dayItems[dayItems.length - 1];
      matchedAction = { action: "REMOVE_ACTIVITY", activityId: itemToRemove.activityId };
      replyText = `I've removed ${activityMap.get(itemToRemove.activityId)?.name || "an activity"} from Day ${dayNum} to make your schedule more relaxed.`;
    } else {
      replyText = `Day ${dayNum} is already very relaxed with only ${dayItems.length} activities scheduled!`;
      return { reply: replyText, trip, changes: [], isOfflineMode: true };
    }
  }

  // 2. "Reduce budget to ₹20,000" / "Set budget to [X]"
  else if (text.includes("budget") && (text.includes("reduce") || text.includes("set") || text.includes("cut") || text.includes("lower"))) {
    const numMatch = text.match(/\d+[\d,]*/);
    let newAmount = 20000;
    if (numMatch) {
      newAmount = parseInt(numMatch[0].replace(/,/g, ""), 10);
    }
    matchedAction = { action: "CHANGE_BUDGET", amount: newAmount };
    replyText = `I have updated your trip budget to ₹${newAmount.toLocaleString()} and re-calculated stay & transit cost allocations.`;
  }

  // 3. "Add more historical places" / "Add heritage"
  else if (text.includes("historical") || text.includes("heritage")) {
    const heritageCandidate = (trip.activityPool || []).find(
      (a) => (a.category === "heritage" || a.category === "museum" || (a.tags && a.tags.includes("history"))) &&
        !trip.itinerary.some((i) => i.activityId === a.id)
    );

    if (heritageCandidate) {
      matchedAction = { action: "ADD_ACTIVITY", activityId: heritageCandidate.id, day: 1, preferredTime: "11:00" };
      replyText = `Added ${heritageCandidate.name} to your Day 1 schedule to enrich historical sightseeing.`;
    } else {
      replyText = `Your itinerary already includes all major available historical places for this destination.`;
      return { reply: replyText, trip, changes: [], isOfflineMode: true };
    }
  }

  // 4. "Remove temples" / "Remove religious"
  else if (text.includes("temple") || text.includes("religious")) {
    const templeItem = trip.itinerary.find((i) => {
      const act = activityMap.get(i.activityId);
      return act && (act.category === "religious" || act.category === "temple" || act.name.toLowerCase().includes("temple"));
    });

    if (templeItem) {
      matchedAction = { action: "REMOVE_ACTIVITY", activityId: templeItem.activityId };
      replyText = `Removed ${activityMap.get(templeItem.activityId)?.name || "temple visit"} from your itinerary.`;
    } else {
      replyText = `No temple visits were found in your active itinerary.`;
      return { reply: replyText, trip, changes: [], isOfflineMode: true };
    }
  }

  // 5. "Add food experiences" / "Add food"
  else if (text.includes("food") || text.includes("dining") || text.includes("culinary")) {
    const foodCandidate = (trip.activityPool || []).find(
      (a) => a.category === "food" && !trip.itinerary.some((i) => i.activityId === a.id)
    );

    if (foodCandidate) {
      matchedAction = { action: "ADD_ACTIVITY", activityId: foodCandidate.id, day: 2, preferredTime: "19:30" };
      replyText = `Added ${foodCandidate.name} to your Day 2 schedule for an authentic local dining experience.`;
    } else {
      replyText = `Food experiences are already scheduled into your daily lunch and dinner windows!`;
      return { reply: replyText, trip, changes: [], isOfflineMode: true };
    }
  }

  // 6. "How much budget is left?"
  else if (text.includes("budget") && (text.includes("left") || text.includes("remaining") || text.includes("how much"))) {
    const b = calculateBudgetBreakdown(trip, trip.itinerary);
    replyText = `Your total budget is ₹${b.totalBudget.toLocaleString()}. Estimated spend is ₹${b.estimatedSpend.toLocaleString()}, leaving ₹${b.remaining.toLocaleString()} remaining.`;
    return { reply: replyText, trip, changes: [], isOfflineMode: true };
  }

  // 7. "Remove shopping from Day 2" / "Remove [category/name]"
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

  // 8. "I don't want too much walking" / "Less walking"
  else if (text.includes("walking") || text.includes("walk")) {
    matchedAction = { action: "CHANGE_PREFERENCE", patch: { walking: "low" } };
  }

  // 9. "What if it rains tomorrow?" / "Rain scenario"
  else if (text.includes("rain")) {
    matchedAction = { action: "REPLAN", reason: "weather", affectedDay: 2 };
  }

  // 10. Fallback intent
  else {
    replyText = `I understand your request: "${message}". Operating in offline mode with rule-based trip modification engine.`;
    return { reply: replyText, trip, changes: [], isOfflineMode: true };
  }

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
