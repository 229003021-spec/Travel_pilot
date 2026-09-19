export type DataProvenance = "verified" | "estimated" | "demo" | "VERIFIED" | "ESTIMATED" | "LIVE" | "CALCULATED";

export interface Sourced<T> {
  value: T;
  provenance: DataProvenance;
  sourceId?: string;
  retrievedAt?: string;
}

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface Activity {
  id: string;
  name: string;
  category: "attraction" | "museum" | "food" | "shopping" | "nature" | "adventure" | "spiritual" | "entertainment" | "nightlife" | string;
  tags: string[];
  description: string;
  lat: number;
  lng: number;
  area: string;
  indoor: boolean;
  walkingIntensity: 1 | 2 | 3;
  durationMin: number;
  costPerPerson: Sourced<number>;
  openingHours: Sourced<Record<DayOfWeek, [string, string][] | "closed" | null>>;
  familyFriendly: boolean;
  rating?: number;
  popularity?: number;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack" | string;
  status: "available" | "closed" | "cancelled" | "unavailable";
  closedDays?: string[];
  provenance?: DataProvenance;
}

export interface ScoreBreakdown {
  interestMatch: number;
  scheduleFit: number;
  locationEfficiency: number;
  budgetFit: number;
  preferenceMatch: number;
  weatherSuitability: number;
  quality: number;
  travelPenalty: number;
  conflictPenalty: number;
  total: number;
}

export interface ItineraryItem {
  activityId: string;
  day: number;
  startTime: string; // "HH:MM" 24h
  endTime: string;   // "HH:MM" 24h
  travelTimeBefore: number; // in minutes
  travelMode: "walk" | "drive" | "transit";
  estimatedCost: number;
  locked?: boolean;
  score: ScoreBreakdown;
}

export interface DayWeather {
  day: number;
  date: string;
  condition: "sunny" | "rainy" | "cloudy" | "stormy";
  tempC: number;
  rainProbability: number;
  provenance: DataProvenance;
}

export interface Alert {
  id: string;
  type: "success" | "warning" | "critical" | "info";
  title: string;
  message: string;
  timestamp: string;
  activityId?: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  url?: string;
  snippet?: string;
  source: string;
  retrievedAt: string;
  provenance: DataProvenance;
}

export interface Conflict {
  type: "time_overlap" | "opening_hours" | "insufficient_travel_time" | "over_budget" | "preference_conflict" | "unverified_hours";
  severity: "critical" | "warning" | "info";
  message: string;
  activityIds: string[];
}

export interface TripSnapshot {
  id: string;
  timestamp: string;
  label: string;
  tripStateJson: string; // serialized Trip without history to avoid deep recursion
  actionReason?: string;
}

export interface TripStatistics {
  totalPlaces: number;
  totalActivities: number;
  totalDistanceKm: number;
  totalTravelTimeHrs: number;
  totalActivityTimeHrs: number;
  avgSpendPerDay: number;
  costPerPerson: number;
  budgetRemaining: number;
  travelTimeSavedMin: number;
}

export interface Trip {
  id: string;
  destination: string;
  dest_id?: string;
  startDate: string;
  endDate: string;
  travellers: { adults: number; children: number; elderly: number };
  budget: { total: number; currency: "INR" | "USD" | "EUR" | "GBP" | "AED" };
  interests: string[];
  preferences: {
    pace: "relaxed" | "balanced" | "packed";
    walking: "low" | "medium" | "high";
    food: string[];
    setting: "indoor" | "outdoor" | "mixed";
    tier: "budget" | "mid" | "luxury";
    dayStart: string;
    dayEnd: string;
    familyFriendly: boolean;
  };
  startingPoint: { type: "hotel" | "airport" | "railway" | "custom" | "center"; name: string; lat: number; lng: number };
  activityPool: Activity[];
  itinerary: ItineraryItem[];
  weather: DayWeather[];
  alerts: Alert[];
  sources: ResearchSource[];
  history: TripSnapshot[];
  lastUpdated: string;
  statistics?: TripStatistics;
  whyThisPlan?: string[];
  hotels?: any[];
  restaurants?: any[];
  events?: any[];
  plans?: Record<string, any>;
}

export type Action =
  | { action: "REMOVE_ACTIVITY"; activityId: string }
  | { action: "ADD_ACTIVITY"; activityId: string; day?: number; preferredTime?: string }
  | { action: "MOVE_ACTIVITY"; activityId: string; day?: number; newTime: string }
  | { action: "REPLACE_ACTIVITY"; activityId: string; withActivityId?: string }
  | { action: "CHANGE_BUDGET"; amount: number }
  | { action: "CHANGE_PREFERENCE"; patch: Partial<Trip["preferences"]> }
  | { action: "MARK_UNAVAILABLE"; activityId: string; reason: "cancelled" | "closed" | "weather" | "delay" }
  | { action: "REPLAN"; reason: "weather" | "budget" | "disruption" | "preference"; affectedDay?: number };

export interface ReplanResult {
  before: ItineraryItem[];
  after: ItineraryItem[];
  removed: string[];
  added: string[];
  moved: string[];
  budgetDelta: number;
  travelDelta: number;
  conflictsAfter: Conflict[];
  explanation: string;
  steps: string[];
}

export interface ActionResponse {
  trip: Trip;
  changes: string[];
  explanation: string;
  alerts: Alert[];
  replanResult?: ReplanResult;
}
