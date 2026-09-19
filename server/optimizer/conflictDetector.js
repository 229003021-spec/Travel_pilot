/**
 * Conflict Detection Engine
 * Inspects trip itinerary and rules for hard and soft constraint violations.
 */

import { calculateTravelTimeMin } from "./travelTime.js";
import { calculateBudgetBreakdown } from "./budgetOptimizer.js";

export function detectConflicts(trip) {
  const conflicts = [];
  const itinerary = trip.itinerary || [];
  const activityMap = new Map((trip.activityPool || []).map((a) => [a.id, a]));

  const timeToMin = (tStr) => {
    if (!tStr) return 0;
    const [h, m] = tStr.split(":").map(Number);
    return h * 60 + m;
  };

  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const startDateObj = trip.startDate ? new Date(trip.startDate) : new Date();

  // Group items by day
  const itemsByDay = {};
  for (const item of itinerary) {
    if (!itemsByDay[item.day]) itemsByDay[item.day] = [];
    itemsByDay[item.day].push(item);
  }

  // Check each day's schedule
  for (const dayStr of Object.keys(itemsByDay)) {
    const day = Number(dayStr);
    const dayItems = itemsByDay[day].sort((a, b) => timeToMin(a.startTime) - timeToMin(b.startTime));

    const dateForDay = new Date(startDateObj);
    dateForDay.setDate(dateForDay.getDate() + (day - 1));
    const dayName = dayNames[dateForDay.getDay()];

    for (let i = 0; i < dayItems.length; i++) {
      const current = dayItems[i];
      const curAct = activityMap.get(current.activityId);
      const curStart = timeToMin(current.startTime);
      const curEnd = timeToMin(current.endTime);

      if (!curAct) continue;

      // 1. Walking preference conflict
      if (trip.preferences && trip.preferences.walking === "low" && curAct.walkingIntensity === 3) {
        conflicts.push({
          type: "preference_conflict",
          severity: "warning",
          message: `${curAct.name} requires high walking intensity (Level 3), which conflicts with your low walking preference.`,
          activityIds: [curAct.id],
        });
      }

      // 2. Opening hours check
      if (curAct.openingHours && curAct.openingHours.value) {
        const hours = curAct.openingHours.value[dayName];

        if (hours === "closed") {
          conflicts.push({
            type: "opening_hours",
            severity: "critical",
            message: `${curAct.name} is closed on Day ${day} (${dayName.toUpperCase()}).`,
            activityIds: [curAct.id],
          });
        } else if (hours === null) {
          conflicts.push({
            type: "unverified_hours",
            severity: "info",
            message: `Opening hours for ${curAct.name} could not be verified from live data sources.`,
            activityIds: [curAct.id],
          });
        } else if (Array.isArray(hours) && hours.length > 0) {
          let isOpen = false;
          for (const [openStr, closeStr] of hours) {
            const openMin = timeToMin(openStr);
            const closeMin = timeToMin(closeStr);
            if (curStart >= openMin && curEnd <= closeMin) {
              isOpen = true;
              break;
            }
          }
          if (!isOpen) {
            conflicts.push({
              type: "opening_hours",
              severity: "warning",
              message: `${curAct.name} is scheduled (${current.startTime}-${current.endTime}), outside its opening hours.`,
              activityIds: [curAct.id],
            });
          }
        }
      }

      // Inter-item checks with next item
      if (i < dayItems.length - 1) {
        const next = dayItems[i + 1];
        const nextAct = activityMap.get(next.activityId);
        const nextStart = timeToMin(next.startTime);

        // 3. Time Overlap
        if (curEnd > nextStart) {
          conflicts.push({
            type: "time_overlap",
            severity: "critical",
            message: `Schedule overlap on Day ${day} between ${curAct.name} (ends ${current.endTime}) and ${nextAct ? nextAct.name : next.activityId} (starts ${next.startTime}).`,
            activityIds: [current.activityId, next.activityId],
          });
        } else if (nextAct) {
          // 4. Insufficient Travel Time
          const requiredTravel = calculateTravelTimeMin(curAct.lat, curAct.lng, nextAct.lat, nextAct.lng, "drive").timeMin;
          const availableGap = nextStart - curEnd;
          if (availableGap < requiredTravel) {
            conflicts.push({
              type: "insufficient_travel_time",
              severity: "warning",
              message: `Insufficient travel time between ${curAct.name} and ${nextAct.name} on Day ${day}. Needs ~${requiredTravel} min drive, but gap is ${availableGap} min.`,
              activityIds: [current.activityId, next.activityId],
            });
          }
        }
      }
    }
  }

  // 5. Over Budget Check
  if (trip.budget) {
    const budgetInfo = calculateBudgetBreakdown(trip, itinerary);
    if (budgetInfo.remaining < 0) {
      conflicts.push({
        type: "over_budget",
        severity: "critical",
        message: `Estimated trip spend (${trip.budget.currency} ${budgetInfo.estimatedSpend.toLocaleString()}) exceeds budget (${trip.budget.currency} ${trip.budget.total.toLocaleString()}) by ${trip.budget.currency} ${Math.abs(budgetInfo.remaining).toLocaleString()}.`,
        activityIds: [],
      });
    }
  }

  return conflicts;
}
