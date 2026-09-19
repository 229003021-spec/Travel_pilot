/**
 * Pure Action Reducer for Trip Mutations
 * All state modifications must pass through this reducer.
 */

import { replanTrip } from "./replanner.js";
import { detectConflicts } from "./conflictDetector.js";
import { calculateBudgetBreakdown } from "./budgetOptimizer.js";

export function applyAction(tripState, action) {
  // Deep clone state to ensure pure mutation
  const trip = JSON.parse(JSON.stringify(tripState));

  // Push current state snapshot to history for Undo before mutating
  const snapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    label: `Before ${action.action}`,
    tripStateJson: JSON.stringify(tripState),
    actionReason: action.action,
  };

  if (!trip.history) trip.history = [];
  trip.history.push(snapshot);

  const changes = [];
  const alerts = [];
  let explanation = "";
  let replanResult = null;

  switch (action.action) {
    case "REMOVE_ACTIVITY": {
      const idx = trip.itinerary.findIndex((i) => i.activityId === action.activityId);
      if (idx !== -1) {
        const removedItem = trip.itinerary.splice(idx, 1)[0];
        const act = trip.activityPool.find((a) => a.id === action.activityId);
        changes.push(`Removed activity ${act ? act.name : action.activityId} from itinerary.`);
        explanation = `Activity ${act ? act.name : action.activityId} was removed from Day ${removedItem.day}.`;
      }
      break;
    }

    case "ADD_ACTIVITY": {
      const act = trip.activityPool.find((a) => a.id === action.activityId);
      if (act) {
        const targetDay = action.day || 1;
        const startTime = action.preferredTime || "14:00";
        const [h, m] = startTime.split(":").map(Number);
        const endMins = h * 60 + m + act.durationMin;
        const endTime = `${String(Math.floor(endMins / 60) % 24).padStart(2, "0")}:${String(endMins % 60).padStart(2, "0")}`;

        const newItem = {
          activityId: act.id,
          day: targetDay,
          startTime,
          endTime,
          travelTimeBefore: 15,
          travelMode: "drive",
          estimatedCost: act.costPerPerson ? act.costPerPerson.value : 0,
          locked: false,
          score: {
            interestMatch: 8,
            scheduleFit: 8,
            locationEfficiency: 8,
            budgetFit: 8,
            preferenceMatch: 8,
            weatherSuitability: 8,
            quality: 8,
            travelPenalty: 0,
            conflictPenalty: 0,
            total: 80,
          },
        };
        trip.itinerary.push(newItem);
        changes.push(`Added ${act.name} to Day ${targetDay} at ${startTime}.`);
        explanation = `Added ${act.name} to Day ${targetDay} at ${startTime}.`;
      }
      break;
    }

    case "MOVE_ACTIVITY": {
      const item = trip.itinerary.find((i) => i.activityId === action.activityId);
      if (item) {
        const act = trip.activityPool.find((a) => a.id === action.activityId);
        item.startTime = action.newTime;
        if (action.day) item.day = action.day;
        const [h, m] = action.newTime.split(":").map(Number);
        const duration = act ? act.durationMin : 60;
        const endMins = h * 60 + m + duration;
        item.endTime = `${String(Math.floor(endMins / 60) % 24).padStart(2, "0")}:${String(endMins % 60).padStart(2, "0")}`;
        changes.push(`Moved ${act ? act.name : action.activityId} to ${action.newTime} on Day ${item.day}.`);
        explanation = `Moved ${act ? act.name : action.activityId} to start at ${action.newTime}.`;
      }
      break;
    }

    case "REPLACE_ACTIVITY": {
      const result = replanTrip(trip, "disruption", { affectedActivityId: action.activityId });
      Object.assign(trip, result.trip);
      replanResult = result.replanResult;
      changes.push(`Replaced activity ${action.activityId}.`);
      explanation = result.replanResult.explanation;
      break;
    }

    case "CHANGE_BUDGET": {
      trip.budget.total = action.amount;
      changes.push(`Updated total trip budget to ${trip.budget.currency} ${action.amount.toLocaleString()}.`);
      explanation = `Total budget was updated to ${trip.budget.currency} ${action.amount.toLocaleString()}.`;

      const budgetInfo = calculateBudgetBreakdown(trip, trip.itinerary);
      if (budgetInfo.remaining < 0) {
        // Over budget -> remove or replace expensive low-score activities
        alerts.push({
          id: `alt_${Date.now()}`,
          type: "critical",
          title: "Budget Exceeded",
          message: `Trip estimated spend (${trip.budget.currency} ${budgetInfo.estimatedSpend.toLocaleString()}) exceeds updated budget by ${trip.budget.currency} ${Math.abs(budgetInfo.remaining).toLocaleString()}.`,
          timestamp: new Date().toISOString(),
        });
      }
      break;
    }

    case "CHANGE_PREFERENCE": {
      trip.preferences = { ...trip.preferences, ...action.patch };
      changes.push(`Updated trip preferences.`);
      explanation = `Preferences were updated.`;
      break;
    }

    case "MARK_UNAVAILABLE": {
      const result = replanTrip(trip, action.reason, { affectedActivityId: action.activityId });
      Object.assign(trip, result.trip);
      replanResult = result.replanResult;
      changes.push(`Marked ${action.activityId} as ${action.reason} and replanned affected schedule.`);
      explanation = result.replanResult.explanation;
      break;
    }

    case "REPLAN": {
      const result = replanTrip(trip, action.reason, { affectedDay: action.affectedDay });
      Object.assign(trip, result.trip);
      replanResult = result.replanResult;
      changes.push(`Replanned trip due to ${action.reason}.`);
      explanation = result.replanResult.explanation;
      break;
    }

    default:
      throw new Error(`Unsupported action type: ${action.action}`);
  }

  // Validate conflicts
  const conflicts = detectConflicts(trip);
  trip.alerts = conflicts.map((c, i) => ({
    id: `cfl_${i}_${Date.now()}`,
    type: c.severity === "critical" ? "critical" : c.severity === "warning" ? "warning" : "info",
    title: c.type.replace("_", " ").toUpperCase(),
    message: c.message,
    timestamp: new Date().toISOString(),
  }));

  trip.lastUpdated = new Date().toISOString();

  return {
    trip,
    changes,
    explanation,
    alerts: trip.alerts,
    replanResult,
  };
}
