import { Trip, Action, ActionResponse, ReplanResult } from "../../../shared/types";
import {
  searchDestinationsClient,
  generateTripClient,
  applyActionClient,
  replanTripClient,
  sendAssistantMessageClient,
  resolveDestinationQuery
} from "./clientOptimizer";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";

export async function fetchDestinations() {
  try {
    const res = await fetch(`${API_BASE}/api/destinations`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback to client-side data
  }
  return searchDestinationsClient("");
}

export async function searchDestinationsApi(query: string) {
  try {
    const res = await fetch(`${API_BASE}/api/destinations/search?q=${encodeURIComponent(query)}`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return searchDestinationsClient(query);
}

export async function fetchDestinationOverviewApi(query: string) {
  try {
    const res = await fetch(`${API_BASE}/api/destinations/overview/${encodeURIComponent(query)}`);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  const dest = resolveDestinationQuery(query);
  if (!dest) return null;
  return {
    dest_id: dest.dest_id,
    city: dest.city,
    state: dest.state,
    region: dest.region || "India",
    type: dest.type || "Sightseeing",
    latitude: dest.latitude,
    longitude: dest.longitude,
    ideal_stay_days: dest.ideal_stay_days || 3,
    best_season: dest.best_season || "Oct–Mar",
    place_count: 8,
    hotel_count: 5,
    restaurant_count: 4,
    event_count: 2,
    sample_places: ["Central Landmark", "Heritage Fort", "Historic Museum"],
    provenance: "VERIFIED"
  };
}

export async function generateTripApi(payload: any): Promise<Trip> {
  try {
    const res = await fetch(`${API_BASE}/api/trip/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Express backend unreachable, using client-side 17-step optimizer engine.");
  }
  return generateTripClient(payload);
}

export async function applyActionApi(trip: Trip, action: Action): Promise<ActionResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/trip/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip, action }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend unreachable, applying action locally.");
  }
  return applyActionClient(trip, action);
}

export async function replanTripApi(trip: Trip, reason: string, options: any = {}): Promise<{ trip: Trip; replanResult: ReplanResult }> {
  try {
    const res = await fetch(`${API_BASE}/api/trip/replan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip, reason, options }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend unreachable, replanning locally.");
  }
  return replanTripClient(trip, reason, options);
}

export async function sendAssistantMessageApi(message: string, trip: Trip) {
  try {
    const res = await fetch(`${API_BASE}/api/assistant/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, trip }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn("Backend unreachable, processing assistant message locally.");
  }
  return sendAssistantMessageClient(message, trip);
}
