import { Trip, Action, ActionResponse, ReplanResult } from "../../../shared/types";

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";

export async function fetchDestinations() {
  const res = await fetch(`${API_BASE}/api/destinations`);
  if (!res.ok) throw new Error("Failed to fetch destinations");
  return res.json();
}

export async function generateTripApi(payload: any): Promise<Trip> {
  const res = await fetch(`${API_BASE}/api/trip/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Failed to generate trip");
  }
  return res.json();
}

export async function applyActionApi(trip: Trip, action: Action): Promise<ActionResponse> {
  const res = await fetch(`${API_BASE}/api/trip/action`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trip, action }),
  });
  if (!res.ok) throw new Error("Failed to apply action");
  return res.json();
}

export async function replanTripApi(trip: Trip, reason: string, options: any = {}): Promise<{ trip: Trip; replanResult: ReplanResult }> {
  const res = await fetch(`${API_BASE}/api/trip/replan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trip, reason, options }),
  });
  if (!res.ok) throw new Error("Failed to replan trip");
  return res.json();
}

export async function sendAssistantMessageApi(message: string, trip: Trip) {
  const res = await fetch(`${API_BASE}/api/assistant/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, trip }),
  });
  if (!res.ok) throw new Error("Failed to process assistant message");
  return res.json();
}
