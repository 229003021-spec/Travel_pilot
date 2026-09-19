/**
 * Budget Optimizer & Tier Cost Model
 * Calculates estimated breakdown per category and remaining budget.
 */

export function calculateBudgetBreakdown(trip, itineraryItems = []) {
  const { total, currency } = trip.budget;
  const { adults, children, elderly } = trip.travellers;
  const totalPeople = adults + children * 0.5 + elderly;

  const startMs = new Date(trip.startDate).getTime();
  const endMs = new Date(trip.endDate).getTime();
  const numDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);

  const tier = trip.preferences.tier || "mid";

  // Daily base rates per person per day by tier (in destination currency, e.g. INR)
  const tierRates = {
    budget: { foodDailyPerPerson: 400, hotelPerNight: 1500, transportDaily: 300 },
    mid: { foodDailyPerPerson: 900, hotelPerNight: 3500, transportDaily: 700 },
    luxury: { foodDailyPerPerson: 2500, hotelPerNight: 9000, transportDaily: 2000 },
  };

  const rates = tierRates[tier] || tierRates.mid;

  // 1. Accommodation
  const nights = Math.max(1, numDays - 1);
  const accommodation = rates.hotelPerNight * nights;

  // 2. Transport
  const transport = rates.transportDaily * numDays;

  // 3. Food
  const food = rates.foodDailyPerPerson * totalPeople * numDays;

  // 4. Activities (sum from itinerary items)
  const activityPoolMap = new Map((trip.activityPool || []).map((a) => [a.id, a]));
  let activitiesCost = 0;
  for (const item of itineraryItems) {
    if (item.estimatedCost !== undefined) {
      activitiesCost += item.estimatedCost * (adults + children * 0.5 + elderly);
    } else {
      const act = activityPoolMap.get(item.activityId);
      const cost = act && act.costPerPerson ? act.costPerPerson.value : 0;
      activitiesCost += cost * (adults + children * 0.5 + elderly);
    }
  }

  // 5. Miscellaneous (8% of subtotal)
  const subtotal = accommodation + transport + food + activitiesCost;
  const misc = Math.round(subtotal * 0.08);

  const estimatedSpend = Math.round(subtotal + misc);
  const remaining = total - estimatedSpend;

  const categoryBreakdown = {
    accommodation: Math.round(accommodation),
    transport: Math.round(transport),
    food: Math.round(food),
    activities: Math.round(activitiesCost),
    miscellaneous: misc,
  };

  return {
    totalBudget: total,
    currency,
    estimatedSpend,
    remaining,
    categories: categoryBreakdown,
    numDays,
    totalPeople,
  };
}
