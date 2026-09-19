/**
 * Candidate Activity Scoring Engine
 * Evaluates candidates based on interests, schedule, location, budget, preferences, weather, and penalties.
 */

import { calculateTravelTimeMin } from "./travelTime.js";

export function scoreActivity(activity, trip, context = {}) {
  const { currentLat, currentLng, dayWeather, remainingBudget, dayNumber } = context;

  // 1. Interest Match (0 - 10)
  const tripInterests = (trip.interests || []).map((i) => i.toLowerCase());
  const actTags = (activity.tags || []).map((t) => t.toLowerCase());
  let matchingTags = actTags.filter((t) =>
    tripInterests.some((interest) => interest.includes(t) || t.includes(interest))
  );
  if (tripInterests.includes(activity.category.toLowerCase())) {
    matchingTags.push(activity.category);
  }
  const interestMatch = Math.min(10, Math.round((matchingTags.length / Math.max(1, tripInterests.length)) * 10 + 2));

  // 2. Schedule Fit (0 - 10)
  let scheduleFit = 8;
  if (activity.openingHours && activity.openingHours.value) {
    const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dayName = dayNames[(dayNumber || 1) % 7];
    const hoursToday = activity.openingHours.value[dayName];
    if (hoursToday === "closed") {
      scheduleFit = 0;
    } else if (hoursToday === null) {
      scheduleFit = 6; // unverified / unknown
    }
  }

  // 3. Location Efficiency (0 - 10)
  let locationEfficiency = 7;
  let travelPenalty = 0;
  if (currentLat !== undefined && currentLng !== undefined) {
    const travel = calculateTravelTimeMin(currentLat, currentLng, activity.lat, activity.lng, "drive");
    if (travel.timeMin <= 15) {
      locationEfficiency = 10;
      travelPenalty = 0;
    } else if (travel.timeMin <= 30) {
      locationEfficiency = 8;
      travelPenalty = 1;
    } else if (travel.timeMin <= 45) {
      locationEfficiency = 5;
      travelPenalty = 3;
    } else {
      locationEfficiency = 2;
      travelPenalty = 6;
    }
  }

  // 4. Budget Fit (0 - 10)
  let budgetFit = 8;
  const cost = activity.costPerPerson ? activity.costPerPerson.value : 0;
  if (remainingBudget !== undefined && remainingBudget > 0) {
    if (cost <= remainingBudget * 0.15) {
      budgetFit = 10;
    } else if (cost <= remainingBudget * 0.3) {
      budgetFit = 7;
    } else if (cost <= remainingBudget) {
      budgetFit = 4;
    } else {
      budgetFit = 0;
    }
  }

  // 5. Preference Match (0 - 10)
  let preferenceMatch = 8;
  const pref = trip.preferences || {};
  if (pref.setting === "indoor" && !activity.indoor) preferenceMatch -= 3;
  if (pref.setting === "outdoor" && activity.indoor) preferenceMatch -= 3;

  if (pref.walking === "low" && activity.walkingIntensity === 3) preferenceMatch -= 4;
  if (pref.walking === "high" && activity.walkingIntensity === 1) preferenceMatch -= 1;

  if (pref.familyFriendly && !activity.familyFriendly) preferenceMatch -= 5;
  preferenceMatch = Math.max(0, Math.min(10, preferenceMatch));

  // 6. Weather Suitability (0 - 10)
  let weatherSuitability = 8;
  if (dayWeather) {
    if (dayWeather.rainProbability > 0.4 || dayWeather.condition === "rainy") {
      weatherSuitability = activity.indoor ? 10 : 2;
    } else if (dayWeather.condition === "sunny") {
      weatherSuitability = activity.indoor ? 7 : 10;
    }
  }

  // 7. Quality (0 - 10)
  const ratingScore = (activity.rating || 4.0) * 2; // 4.5 -> 9
  const popScore = (activity.popularity || 0.8) * 10; // 0.9 -> 9
  const quality = Math.min(10, Math.round((ratingScore + popScore) / 2));

  // 8. Conflict Penalty
  let conflictPenalty = 0;
  if (activity.status === "closed" || activity.status === "unavailable" || activity.status === "cancelled") {
    conflictPenalty = 10;
  }

  // Total weighted score computation
  const w = {
    interestMatch: 0.25,
    scheduleFit: 0.15,
    locationEfficiency: 0.15,
    budgetFit: 0.10,
    preferenceMatch: 0.10,
    weatherSuitability: 0.15,
    quality: 0.10,
    travelPenalty: 0.10,
    conflictPenalty: 0.30,
  };

  const totalRaw =
    w.interestMatch * interestMatch +
    w.scheduleFit * scheduleFit +
    w.locationEfficiency * locationEfficiency +
    w.budgetFit * budgetFit +
    w.preferenceMatch * preferenceMatch +
    w.weatherSuitability * weatherSuitability +
    w.quality * quality -
    w.travelPenalty * travelPenalty -
    w.conflictPenalty * conflictPenalty;

  const total = Math.max(0, parseFloat((totalRaw * 10).toFixed(1)));

  return {
    interestMatch,
    scheduleFit,
    locationEfficiency,
    budgetFit,
    preferenceMatch,
    weatherSuitability,
    quality,
    travelPenalty,
    conflictPenalty,
    total,
  };
}
