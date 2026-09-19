/**
 * Replanning Engine (The Heart of TravelPilot)
 * Dynamic local perturbation replanning with window freezing and factual explanations.
 */

import { calculateTravelTimeMin } from "./travelTime.js";
import { scoreActivity } from "./scoring.js";
import { detectConflicts } from "./conflictDetector.js";
import { calculateBudgetBreakdown } from "./budgetOptimizer.js";

function timeToMin(tStr) {
  if (!tStr) return 0;
  const [h, m] = tStr.split(":").map(Number);
  return h * 60 + m;
}

function minToTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function replanTrip(trip, reason, options = {}) {
  const { affectedActivityId, affectedDay } = options;
  const beforeItinerary = [...(trip.itinerary || [])];
  const activityMap = new Map((trip.activityPool || []).map((a) => [a.id, a]));

  const steps = [];
  steps.push(`Disruption detected (${reason}). Identifying affected items.`);

  let targetDay = affectedDay;
  const removedIds = [];
  const addedIds = [];
  const movedIds = [];

  // 1. Identify items to remove or re-schedule
  let itemsToReplace = [];
  if (affectedActivityId) {
    const item = beforeItinerary.find((i) => i.activityId === affectedActivityId);
    if (item) {
      targetDay = item.day;
      itemsToReplace.push(item);
      removedIds.push(item.activityId);
      // Update activity status in pool
      const act = activityMap.get(affectedActivityId);
      if (act) act.status = "unavailable";
    }
  }

  // Weather disruption handling for day
  if (reason === "weather" && targetDay) {
    const dayWeather = (trip.weather || []).find((w) => w.day === targetDay);
    if (dayWeather && (dayWeather.rainProbability > 0.4 || dayWeather.condition === "rainy")) {
      for (const item of beforeItinerary) {
        if (item.day === targetDay && !item.locked) {
          const act = activityMap.get(item.activityId);
          if (act && !act.indoor) {
            itemsToReplace.push(item);
            if (!removedIds.includes(item.activityId)) removedIds.push(item.activityId);
          }
        }
      }
    }
  }

  steps.push(`Freezing locked and non-affected itinerary items.`);

  // Separate frozen vs affected items
  const newItinerary = [];
  const usedActivityIds = new Set();

  for (const item of beforeItinerary) {
    const isAffected =
      (affectedActivityId && item.activityId === affectedActivityId) ||
      (reason === "weather" && item.day === targetDay && !item.locked && activityMap.get(item.activityId)?.indoor === false);

    if (!isAffected || item.locked) {
      newItinerary.push({ ...item });
      usedActivityIds.add(item.activityId);
    }
  }

  // 2. Find replacement candidates for the gap(s)
  const remainingBudgetInfo = calculateBudgetBreakdown(trip, newItinerary);
  const candidates = (trip.activityPool || []).filter(
    (a) =>
      !usedActivityIds.has(a.id) &&
      a.status === "available" &&
      !removedIds.includes(a.id)
  );

  steps.push(`Evaluating ${candidates.length} candidate alternatives from pool.`);

  let explanationText = "";

  if (targetDay) {
    const dayWeather = (trip.weather || []).find((w) => w.day === targetDay);
    const dayItems = newItinerary.filter((i) => i.day === targetDay).sort((a, b) => timeToMin(a.startTime) - timeToMin(b.startTime));

    let prevLat = trip.startingPoint.lat;
    let prevLng = trip.startingPoint.lng;
    let prevEndTime = trip.preferences.dayStart || "09:00";

    if (dayItems.length > 0) {
      const last = dayItems[dayItems.length - 1];
      const lastAct = activityMap.get(last.activityId);
      if (lastAct) {
        prevLat = lastAct.lat;
        prevLng = lastAct.lng;
      }
      prevEndTime = last.endTime;
    }

    // Score candidates for this window
    const scoredCandidates = candidates.map((act) => {
      const scoreObj = scoreActivity(act, trip, {
        currentLat: prevLat,
        currentLng: prevLng,
        dayWeather,
        remainingBudget: remainingBudgetInfo.remaining,
        dayNumber: targetDay,
      });

      // Bonus for low added travel and matching interests
      const travel = calculateTravelTimeMin(prevLat, prevLng, act.lat, act.lng, "drive");
      const travelBonus = travel.timeMin <= 20 ? 3 : 0;
      const totalScore = scoreObj.total + travelBonus;

      return { act, score: { ...scoreObj, total: totalScore }, travel };
    });

    scoredCandidates.sort((a, b) => b.score.total - a.score.total);

    const bestMatch = scoredCandidates[0];

    if (bestMatch && bestMatch.score.total > 0) {
      const act = bestMatch.act;
      const startTime = minToTime(timeToMin(prevEndTime) + bestMatch.travel.timeMin);
      const endTime = minToTime(timeToMin(startTime) + act.durationMin);
      const cost = act.costPerPerson ? act.costPerPerson.value : 0;

      const replacementItem = {
        activityId: act.id,
        day: targetDay,
        startTime,
        endTime,
        travelTimeBefore: bestMatch.travel.timeMin,
        travelMode: bestMatch.travel.mode,
        estimatedCost: cost,
        locked: false,
        score: bestMatch.score,
      };

      newItinerary.push(replacementItem);
      addedIds.push(act.id);
      steps.push(`Selected best replacement: ${act.name} (Score: ${bestMatch.score.total}).`);

      const removedActName = affectedActivityId ? activityMap.get(affectedActivityId)?.name || affectedActivityId : "outdoor activities";
      explanationText = `Replaced ${removedActName} with ${act.name} because it scored highest on interest match (${bestMatch.score.interestMatch}/10), schedule fit, and location efficiency (${bestMatch.travel.timeMin} min travel).`;
    } else {
      steps.push(`No feasible candidate found. Preserved time gap in schedule.`);
      explanationText = `No feasible alternative candidate was found in the pool that fits the opening hours and remaining budget. A free time gap has been preserved.`;
    }
  }

  // Sort final itinerary by day and startTime
  newItinerary.sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return timeToMin(a.startTime) - timeToMin(b.startTime);
  });

  // Calculate deltas
  const beforeBudget = calculateBudgetBreakdown(trip, beforeItinerary);
  const afterBudget = calculateBudgetBreakdown(trip, newItinerary);
  const budgetDelta = afterBudget.estimatedSpend - beforeBudget.estimatedSpend;

  const beforeTravelMin = beforeItinerary.reduce((sum, i) => sum + (i.travelTimeBefore || 0), 0);
  const afterTravelMin = newItinerary.reduce((sum, i) => sum + (i.travelTimeBefore || 0), 0);
  const travelDelta = afterTravelMin - beforeTravelMin;

  const updatedTrip = { ...trip, itinerary: newItinerary };
  const conflictsAfter = detectConflicts(updatedTrip);

  steps.push(`Validated recalculated trip against conflict rules and budget constraints.`);

  const replanResult = {
    before: beforeItinerary,
    after: newItinerary,
    removed: removedIds,
    added: addedIds,
    moved: movedIds,
    budgetDelta,
    travelDelta,
    conflictsAfter,
    explanation: explanationText,
    steps,
  };

  return {
    trip: updatedTrip,
    replanResult,
  };
}
