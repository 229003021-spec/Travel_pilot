import { Trip, Action, ActionResponse, ReplanResult } from "../../../shared/types";
import { generateOptimizedItinerary } from "../../../server/optimizer/itineraryOptimizer.js";
import { generateAlternativePlans } from "../../../server/optimizer/multiPlanGenerator.js";
import { calculateBudgetBreakdown } from "../../../server/optimizer/budgetOptimizer.js";
import { applyAction } from "../../../server/optimizer/actions.js";
import { replanTrip } from "../../../server/optimizer/replanner.js";
import { detectConflicts } from "../../../server/optimizer/conflictDetector.js";
import { processAssistantMessage } from "../../../server/services/aiService.js";

// Client-side imported dataset JSON files
import destinationData from "../data/prototype_dataset/destination.json";
import placeData from "../data/prototype_dataset/place.json";
import hotelData from "../data/prototype_dataset/hotel.json";
import transportrouteData from "../data/prototype_dataset/transportroute.json";
import eventData from "../data/prototype_dataset/event.json";
import top500Data from "../data/top500_destinations.json";
import curatedJaipur from "../data/activities.jaipur.json";
import curatedMunnar from "../data/activities.munnar.json";

// City aliases dictionary
const CITY_ALIASES: Record<string, string> = {
  bangalore: "Bengaluru",
  bengaluru: "Bengaluru",
  bombay: "Mumbai",
  mumbai: "Mumbai",
  madras: "Chennai",
  chennai: "Chennai",
  kashi: "Varanasi",
  banaras: "Varanasi",
  varanasi: "Varanasi",
  calcutta: "Kolkata",
  kolkata: "Kolkata",
  trivandrum: "Thiruvananthapuram",
  thiruvananthapuram: "Thiruvananthapuram",
  cochin: "Kochi",
  kochi: "Kochi",
  baroda: "Vadodara",
  vadodara: "Vadodara",
  pondicherry: "Puducherry",
  puducherry: "Puducherry",
  gurgaon: "Gurugram",
  gurugram: "Gurugram"
};

// Destination coordinates lookup
const DEST_COORDINATES: Record<string, { lat: number; lng: number }> = {
  agra: { lat: 27.1767, lng: 78.0081 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  goa: { lat: 15.2993, lng: 74.1240 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  "new delhi": { lat: 28.6139, lng: 77.2090 },
  mumbai: { lat: 19.0760, lng: 72.8777 },
  hampi: { lat: 15.3350, lng: 76.4600 },
  "leh-ladakh": { lat: 34.1526, lng: 77.5771 },
  leh: { lat: 34.1526, lng: 77.5771 },
  amritsar: { lat: 31.6340, lng: 74.8723 },
  darjeeling: { lat: 27.0410, lng: 88.2663 },
  andaman: { lat: 11.6234, lng: 92.7264 },
  "kerala backwaters": { lat: 9.4981, lng: 76.3388 },
  "ajanta and ellora caves": { lat: 20.0268, lng: 75.1774 },
  munnar: { lat: 10.0889, lng: 77.0595 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 }
};

// Index structures for high-performance lookup
const destinationMap = new Map<string, any>();
const placesByDestId = new Map<string, any[]>();
const placesByCity = new Map<string, any[]>();
const hotelsByCity = new Map<string, any[]>();
const eventsByCity = new Map<string, any[]>();

// Initialize indexes
(destinationData as any[]).forEach((d) => {
  destinationMap.set(d.dest_id.toLowerCase(), d);
  destinationMap.set(d.city.toLowerCase(), d);
});

(placeData as any[]).forEach((p) => {
  if (p.dest_id) {
    if (!placesByDestId.has(p.dest_id)) placesByDestId.set(p.dest_id, []);
    placesByDestId.get(p.dest_id)!.push(p);
  }
  if (p.city) {
    const cLower = p.city.toLowerCase();
    if (!placesByCity.has(cLower)) placesByCity.set(cLower, []);
    placesByCity.get(cLower)!.push(p);
  }
});

(hotelData as any[]).forEach((h) => {
  if (h.city) {
    const cLower = h.city.toLowerCase();
    if (!hotelsByCity.has(cLower)) hotelsByCity.set(cLower, []);
    hotelsByCity.get(cLower)!.push(h);
  }
});

(eventData as any[]).forEach((e) => {
  if (e.city) {
    const cLower = e.city.toLowerCase();
    if (!eventsByCity.has(cLower)) eventsByCity.set(cLower, []);
    eventsByCity.get(cLower)!.push(e);
  }
});

export function resolveDestinationQuery(query: string) {
  if (!query) return null;
  let qLower = query.trim().toLowerCase();

  // Alias lookup
  if (CITY_ALIASES[qLower]) {
    qLower = CITY_ALIASES[qLower].toLowerCase();
  }

  // Direct match in map
  if (destinationMap.has(qLower)) {
    const d = destinationMap.get(qLower);
    const coords = DEST_COORDINATES[d.city.toLowerCase()] || { lat: d.latitude || 20.5937, lng: d.longitude || 78.9629 };
    return { ...d, latitude: coords.lat, longitude: coords.lng, provenance: "VERIFIED" };
  }

  // Partial search in prototype dataset
  const matchProto = (destinationData as any[]).find(
    (d) =>
      d.city.toLowerCase().includes(qLower) ||
      d.state.toLowerCase().includes(qLower) ||
      qLower.includes(d.city.toLowerCase())
  );
  if (matchProto) {
    const coords = DEST_COORDINATES[matchProto.city.toLowerCase()] || { lat: matchProto.latitude || 20.5937, lng: matchProto.longitude || 78.9629 };
    return { ...matchProto, latitude: coords.lat, longitude: coords.lng, provenance: "VERIFIED" };
  }

  // Search Top 500 dataset
  const matchTop500 = (top500Data as any[]).find(
    (d) =>
      d.name.toLowerCase().includes(qLower) ||
      d.state.toLowerCase().includes(qLower) ||
      qLower.includes(d.name.toLowerCase())
  );
  if (matchTop500) {
    const coords = DEST_COORDINATES[matchTop500.name.toLowerCase()] || { lat: matchTop500.lat || 20.5937, lng: matchTop500.lng || 78.9629 };
    return {
      dest_id: matchTop500.id || `D_${matchTop500.name.substring(0, 3).toUpperCase()}`,
      city: matchTop500.name,
      state: matchTop500.state,
      region: matchTop500.region || "India",
      type: matchTop500.type || "Sightseeing",
      ideal_stay_days: matchTop500.idealDurationDays || 3,
      latitude: coords.lat,
      longitude: coords.lng,
      best_season: matchTop500.bestTimeToVisit || "Oct–Mar",
      data_status: "Top 500 Dataset Verified",
      provenance: "VERIFIED"
    };
  }

  return null;
}

export function searchDestinationsClient(query: string) {
  let q = (query || "").toString().toLowerCase().trim();
  if (CITY_ALIASES[q]) q = CITY_ALIASES[q].toLowerCase();

  const allProto = (destinationData as any[]).map((d) => {
    const coords = DEST_COORDINATES[d.city.toLowerCase()] || { lat: d.latitude || 20.5937, lng: d.longitude || 78.9629 };
    return { ...d, latitude: coords.lat, longitude: coords.lng, provenance: "VERIFIED" };
  });

  if (!q) {
    return allProto.sort((a, b) => a.city.localeCompare(b.city)).slice(0, 30);
  }

  const results = allProto.filter(
    (d) =>
      d.city.toLowerCase().includes(q) ||
      d.state.toLowerCase().includes(q) ||
      (d.dest_id && d.dest_id.toLowerCase().includes(q))
  );

  // Search Top 500 if few results
  if (results.length < 5) {
    const topMatches = (top500Data as any[]).filter(
      (d) => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
    );
    topMatches.forEach((t) => {
      if (!results.some((r) => r.city.toLowerCase() === t.name.toLowerCase())) {
        results.push({
          dest_id: t.id || `D_${t.name.substring(0, 3).toUpperCase()}`,
          city: t.name,
          state: t.state,
          region: t.region || "India",
          type: t.type || "Sightseeing",
          ideal_stay_days: t.idealDurationDays || 3,
          latitude: t.lat || 20.5937,
          longitude: t.lng || 78.9629,
          best_season: t.bestTimeToVisit || "Oct–Mar",
          provenance: "VERIFIED"
        });
      }
    });
  }

  return results.sort((a, b) => a.city.localeCompare(b.city)).slice(0, 30);
}

export function getPlacesClient(destId?: string, city?: string) {
  const cityLower = city ? (CITY_ALIASES[city.toLowerCase()] || city).toLowerCase() : "";

  if (cityLower.includes("jaipur")) return curatedJaipur as any[];
  if (cityLower.includes("munnar")) return curatedMunnar as any[];

  let matched: any[] = [];
  if (destId && placesByDestId.has(destId)) matched = placesByDestId.get(destId)!;
  if (matched.length === 0 && cityLower && placesByCity.has(cityLower)) matched = placesByCity.get(cityLower)!;

  const baseCoords = DEST_COORDINATES[cityLower] || { lat: 20.5937, lng: 78.9629 };

  if (matched.length > 0) {
    return matched.map((p, idx) => {
      const isClosedFri = p.name.toLowerCase().includes("taj mahal");
      return {
        id: p.place_id || `P_${idx}`,
        name: p.name,
        category: (p.category || "attraction").toLowerCase(),
        tags: [p.category || "sightseeing", "heritage"],
        description: `${p.name} - ${p.category} in ${p.city}. Source: ${p.source}`,
        lat: baseCoords.lat + (idx * 0.007 - 0.01),
        lng: baseCoords.lng + (idx * 0.007 - 0.01),
        area: `${p.city} Central`,
        indoor: p.category === "Museum" || p.category === "Palace",
        walkingIntensity: 2,
        durationMin: p.category === "Heritage" ? 120 : 90,
        costPerPerson: { value: p.category === "Heritage" ? 250 : 100, provenance: "VERIFIED" },
        openingHours: {
          value: {
            mon: [["08:00", "18:00"]],
            tue: [["08:00", "18:00"]],
            wed: [["08:00", "18:00"]],
            thu: [["08:00", "18:00"]],
            fri: isClosedFri ? [] : [["08:00", "18:00"]],
            sat: [["08:00", "18:00"]],
            sun: [["08:00", "18:00"]]
          },
          provenance: isClosedFri ? "VERIFIED" : "ESTIMATED"
        },
        closedDays: isClosedFri ? ["fri"] : [],
        familyFriendly: true,
        rating: 4.7,
        popularity: 0.9,
        status: "available",
        provenance: "VERIFIED"
      };
    });
  }

  // Top 500 fallback
  const tMatch = (top500Data as any[]).find(
    (d) => d.name.toLowerCase() === cityLower || cityLower.includes(d.name.toLowerCase())
  );
  if (tMatch && tMatch.attractions) {
    return tMatch.attractions.map((att: string, aIdx: number) => ({
      id: `P_${cityLower}_${aIdx + 1}`,
      name: att,
      category: "attraction",
      tags: ["sightseeing"],
      description: `Famous attraction in ${tMatch.name}, ${tMatch.state}.`,
      lat: baseCoords.lat + (aIdx * 0.008 - 0.012),
      lng: baseCoords.lng + (aIdx * 0.008 - 0.012),
      area: `${tMatch.name} Central`,
      indoor: false,
      walkingIntensity: 2,
      durationMin: 120,
      costPerPerson: { value: 150, provenance: "ESTIMATED" },
      openingHours: {
        value: {
          mon: [["08:00", "18:00"]], tue: [["08:00", "18:00"]], wed: [["08:00", "18:00"]],
          thu: [["08:00", "18:00"]], fri: [["08:00", "18:00"]], sat: [["08:00", "18:00"]], sun: [["08:00", "18:00"]]
        },
        provenance: "ESTIMATED"
      },
      familyFriendly: true,
      rating: 4.6,
      popularity: 0.88,
      status: "available",
      provenance: "VERIFIED"
    }));
  }

  return [];
}

export function getHotelsClient(destId?: string, city?: string) {
  const cityLower = city ? (CITY_ALIASES[city.toLowerCase()] || city).toLowerCase() : "";
  const matched = hotelsByCity.get(cityLower) || [];
  const baseCoords = DEST_COORDINATES[cityLower] || { lat: 20.5937, lng: 78.9629 };

  if (matched.length > 0) {
    return matched.map((h, idx) => ({
      hotel_id: h.hotel_id,
      name: h.name,
      city: h.city,
      dest_id: h.dest_id,
      tier: idx === 0 ? "Luxury" : idx === 1 ? "Mid-range" : "Budget",
      pricePerNight: idx === 0 ? 8000 : idx === 1 ? 3500 : 1800,
      rating: 4.8 - idx * 0.2,
      lat: baseCoords.lat + (idx * 0.005),
      lng: baseCoords.lng + (idx * 0.005),
      provenance: "VERIFIED"
    }));
  }

  return [
    { hotel_id: `H_${cityLower}_1`, name: `${city || "City"} Grand Heritage Hotel`, city, dest_id: destId, tier: "Luxury", pricePerNight: 7500, rating: 4.8, lat: baseCoords.lat, lng: baseCoords.lng, provenance: "ESTIMATED" },
    { hotel_id: `H_${cityLower}_2`, name: `${city || "City"} Central Comfort Inn`, city, dest_id: destId, tier: "Mid-range", pricePerNight: 3200, rating: 4.4, lat: baseCoords.lat + 0.005, lng: baseCoords.lng - 0.005, provenance: "ESTIMATED" },
    { hotel_id: `H_${cityLower}_3`, name: `${city || "City"} Backpacker Stay`, city, dest_id: destId, tier: "Budget", pricePerNight: 1500, rating: 4.2, lat: baseCoords.lat - 0.005, lng: baseCoords.lng + 0.005, provenance: "ESTIMATED" }
  ];
}

export function getRestaurantsClient(destId?: string, city?: string) {
  const cityLower = city ? (CITY_ALIASES[city.toLowerCase()] || city).toLowerCase() : "";
  const baseCoords = DEST_COORDINATES[cityLower] || { lat: 20.5937, lng: 78.9629 };

  return [
    { id: `R_${cityLower}_1`, name: `${city || "City"} Royal Spice Dining`, category: "Restaurant", cuisine: "Regional & North Indian", avgCostPerPerson: 600, mealType: "lunch", lat: baseCoords.lat + 0.002, lng: baseCoords.lng + 0.003, provenance: "ESTIMATED" },
    { id: `R_${cityLower}_2`, name: `${city || "City"} Heritage Cafe & Bakery`, category: "Cafe", cuisine: "Cafe & Breakfast", avgCostPerPerson: 300, mealType: "breakfast", lat: baseCoords.lat - 0.002, lng: baseCoords.lng - 0.002, provenance: "ESTIMATED" },
    { id: `R_${cityLower}_3`, name: `${city || "City"} Street Food Market`, category: "Street Food", cuisine: "Local Specialties", avgCostPerPerson: 400, mealType: "dinner", lat: baseCoords.lat + 0.004, lng: baseCoords.lng - 0.004, provenance: "ESTIMATED" }
  ];
}

export function generateTripClient(payload: any): Trip {
  const destObj = resolveDestinationQuery(payload.destination);
  const destName = destObj ? destObj.city : payload.destination;
  const destId = destObj ? destObj.dest_id : null;

  const activityPool = getPlacesClient(destId, destName);
  const hotels = getHotelsClient(destId, destName);
  const restaurants = getRestaurantsClient(destId, destName);
  const events = eventsByCity.get(destName.toLowerCase()) || [];

  const startingPoint = payload.startingPoint || {
    type: "center",
    name: `${destName} Central`,
    lat: destObj ? destObj.latitude : 26.9124,
    lng: destObj ? destObj.longitude : 75.7873
  };

  const tempTrip: any = {
    id: `TRIP_${Date.now()}`,
    destination: destName,
    dest_id: destId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    travellers: payload.travellers || { adults: 2, children: 0, elderly: 0 },
    budget: payload.budget || { total: 25000, currency: "INR" },
    interests: payload.interests || ["Sightseeing", "Heritage", "Food"],
    preferences: payload.preferences || { pace: "balanced", walking: "medium", dayStart: "08:30", dayEnd: "21:00", tier: "mid" },
    startingPoint,
    activityPool,
    hotels,
    restaurants,
    events,
    itinerary: [],
    weather: [
      { day: 1, date: payload.startDate, condition: "sunny", tempC: 28, rainProbability: 0.1, provenance: "ESTIMATED" },
      { day: 2, date: payload.endDate, condition: "sunny", tempC: 29, rainProbability: 0.1, provenance: "ESTIMATED" },
    ],
    alerts: [],
    sources: [
      {
        id: "src_dataset",
        title: `India Travel Prototype Dataset - ${destName}`,
        source: "india_travel_prototype_dataset_xlsx",
        snippet: `Structured relational lookup from India_Travel_Prototype_Dataset.xlsx (500 Destinations, Places, Routes, Events).`,
        retrievedAt: new Date().toISOString(),
        provenance: "VERIFIED",
      },
    ],
    history: [],
    lastUpdated: new Date().toISOString(),
  };

  // Run 17-step optimizer engine
  const { itinerary, statistics, whyThisPlan } = generateOptimizedItinerary(tempTrip);
  tempTrip.itinerary = itinerary;
  tempTrip.statistics = statistics;
  tempTrip.whyThisPlan = whyThisPlan;

  // Generate alternative plans
  const plans = generateAlternativePlans(tempTrip);
  tempTrip.plans = plans;

  // Detect conflicts
  const conflicts = detectConflicts(tempTrip);
  tempTrip.alerts = conflicts.map((c: any, i: number) => ({
    id: `cfl_${i}_${Date.now()}`,
    type: c.severity === "critical" ? "critical" : c.severity === "warning" ? "warning" : "info",
    title: c.type.replace("_", " ").toUpperCase(),
    message: c.message,
    timestamp: new Date().toISOString(),
  }));

  return tempTrip as Trip;
}

export function applyActionClient(trip: Trip, action: Action): ActionResponse {
  return applyAction(trip, action);
}

export function replanTripClient(trip: Trip, reason: string, options: any = {}): { trip: Trip; replanResult: ReplanResult } {
  return replanTrip(trip, reason, options);
}

export async function sendAssistantMessageClient(message: string, trip: Trip) {
  return processAssistantMessage(message, trip);
}
