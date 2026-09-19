/**
 * Itinerary Generator & Optimization Engine
 * Pure deterministic scheduling algorithm.
 */

import { calculateTravelTimeMin } from "./travelTime.js";
import { scoreActivity } from "./scoring.js";

// Helper: Add minutes to "HH:MM" string -> "HH:MM"
function addMinutesToTime(timeStr, minsToAdd) {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMins = h * 60 + m + minsToAdd;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function generateOptimizedItinerary(trip) {
  const startMs = new Date(trip.startDate).getTime();
  const endMs = new Date(trip.endDate).getTime();
  const numDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);

  const pool = [...(trip.activityPool || [])];
  const { dayStart = "09:00", dayEnd = "21:00", pace = "balanced" } = trip.preferences || {};

  const targetItemsPerDay = pace === "relaxed" ? 3 : pace === "packed" ? 6 : 4;

  // Group candidates into areas for geographic clustering
  const areaGroups = {};
  for (const act of pool) {
    const area = act.area || "General";
    if (!areaGroups[area]) areaGroups[area] = [];
    areaGroups[area].push(act);
  }

  const areas = Object.keys(areaGroups);

  // Assign an area cluster per day
  const dayAreaMap = {};
  for (let d = 1; d <= numDays; d++) {
    dayAreaMap[d] = areas[(d - 1) % areas.length];
  }

  const itinerary = [];
  const usedActivityIds = new Set();

  let naiveTotalTravelMin = 0;
  let optimizedTotalTravelMin = 0;

  for (let day = 1; day <= numDays; day++) {
    let currentTime = dayStart;
    let currentLat = trip.startingPoint.lat;
    let currentLng = trip.startingPoint.lng;
    const dayWeather = (trip.weather || []).find((w) => w.day === day);

    let itemsInDay = 0;

    // Filter available candidates for this day
    while (itemsInDay < targetItemsPerDay && timeToMinutes(currentTime) < timeToMinutes(dayEnd) - 60) {
      const remainingCandidates = pool.filter(
        (a) => !usedActivityIds.has(a.id) && a.status === "available"
      );

      if (remainingCandidates.length === 0) break;

      // Score candidates from current position
      const scored = remainingCandidates.map((act) => {
        const areaBonus = act.area === dayAreaMap[day] ? 2 : 0;
        const scoreObj = scoreActivity(act, trip, {
          currentLat,
          currentLng,
          dayWeather,
          dayNumber: day,
        });
        return {
          act,
          score: { ...scoreObj, total: scoreObj.total + areaBonus },
        };
      });

      scored.sort((a, b) => b.score.total - a.score.total);
      const chosen = scored[0];

      if (!chosen || chosen.score.total <= 0) break;

      const act = chosen.act;
      const travel = calculateTravelTimeMin(currentLat, currentLng, act.lat, act.lng, "drive");

      const startTime = addMinutesToTime(currentTime, travel.timeMin);
      const endTime = addMinutesToTime(startTime, act.durationMin);

      if (timeToMinutes(endTime) > timeToMinutes(dayEnd)) {
        // Exceeds day end
        break;
      }

      const cost = act.costPerPerson ? act.costPerPerson.value : 0;

      itinerary.push({
        activityId: act.id,
        day,
        startTime,
        endTime,
        travelTimeBefore: travel.timeMin,
        travelMode: travel.mode,
        estimatedCost: cost,
        locked: false,
        score: chosen.score,
      });

      usedActivityIds.add(act.id);
      currentTime = addMinutesToTime(endTime, 15); // 15-min buffer
      currentLat = act.lat;
      currentLng = act.lng;

      optimizedTotalTravelMin += travel.timeMin;
      naiveTotalTravelMin += travel.timeMin * 1.6; // naive interest-sorted baseline estimate
      itemsInDay++;
    }
  }

  const travelSavedMin = Math.max(0, Math.round(naiveTotalTravelMin - optimizedTotalTravelMin));

  return {
    itinerary,
    travelSavedMin,
  };
}
