/**
 * Master Data Highlights & Architecture Schema (20-Point Framework)
 * Fully extensible data contracts for TravelPilot.
 */

// 1. Destination / Geographic Data
export interface DestinationGeographicData {
  country: string;
  stateProvince: string;
  city: string;
  district?: string;
  neighborhoodLocality?: string;
  lat: number;
  lng: number;
  touristRegion?: string;
  nearbyDestinations?: string[];
  distanceBetweenMajorAttractionsKm?: Record<string, number>;
  popularityRank?: number;
  bestKnownAreas?: string[];
}

// 2. 25 Supported Categories
export type SupportedCategory =
  | "Temple"
  | "Church"
  | "Mosque"
  | "Monument"
  | "Museum"
  | "Fort"
  | "Palace"
  | "Beach"
  | "Waterfall"
  | "Hill station"
  | "Wildlife sanctuary"
  | "National park"
  | "Shopping"
  | "Market"
  | "Restaurant"
  | "Cafe"
  | "Adventure"
  | "Theme park"
  | "Viewpoint"
  | "Cultural attraction"
  | "Historical site"
  | "Nightlife"
  | "Entertainment"
  | "Nature"
  | "Photography spot";

// 3. Opening Hours Data
export interface DetailedOpeningHours {
  openingTime: string; // "HH:MM"
  closingTime: string; // "HH:MM"
  daysOpen: string[]; // ["Mon", "Tue", ...]
  holidayClosures?: string[];
  seasonalTimings?: Record<string, string>;
  lastEntryTime?: string;
  recommendedArrivalTime?: string;
  recommendedVisitDurationMin: number;
}

// 5. Geographic Distance + Travel Time
export interface GeoDistanceRoute {
  placeA: string;
  placeB: string;
  distanceKm: number;
  walkingTimeMin: number;
  drivingTimeMin: number;
  publicTransitTimeMin: number;
  cyclingTimeMin: number;
  estimatedTrafficLevel: "low" | "moderate" | "heavy";
  routeGeometry?: string;
  transportationMode: "walk" | "drive" | "transit" | "cycle";
  tollsAmount?: number;
}

// 6. Transportation Data
export interface FlightOption {
  flightId: string;
  airportOrigin: string;
  airportDestination: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  price: number;
  availabilitySeats: number;
  baggageAllowanceKg: number;
  cancellationRules: string;
}

export interface TrainOption {
  trainNumber: string;
  trainName: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  durationMin: number;
  classType: "1A" | "2A" | "3A" | "SL" | "CC";
  price: number;
  seatAvailability: string;
}

export interface BusOption {
  operator: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  seatAvailability: number;
}

export interface LocalTransportOption {
  mode: "Metro" | "Bus" | "Taxi" | "Rental car" | "Auto" | "Walking" | "Bike";
  avgCostPerKm: number;
  availabilityStatus: string;
}

// 7. Accommodation Data
export interface AccommodationData {
  hotelId: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  pricePerNight: number;
  rating: number;
  roomTypes: string[];
  checkInTime: string;
  checkOutTime: string;
  amenities: string[];
  cancellationPolicy: string;
  availability: boolean;
  distanceFromAttractionsKm: Record<string, number>;
  distanceFromAirportStationKm: number;
}

// 8. Restaurant Data
export interface RestaurantData {
  restaurantId: string;
  name: string;
  cuisine: string[];
  location: string;
  priceRange: "budget" | "mid" | "fine_dining";
  openingHours: string;
  rating: number;
  dietaryOptions: {
    vegetarian: boolean;
    vegan: boolean;
    halal: boolean;
    jain: boolean;
    glutenFree: boolean;
  };
  reservationsRequired: boolean;
  avgMealDurationMin: number;
}

// 10. User Profile / Preference Data
export interface ExtendedUserProfile {
  tripConstraints: {
    destination: string;
    startDate: string;
    endDate: string;
    travelersCount: number;
    adults: number;
    children: number;
    budget: number;
    currency: string;
  };
  interests: Array<
    | "History"
    | "Nature"
    | "Adventure"
    | "Food"
    | "Shopping"
    | "Photography"
    | "Architecture"
    | "Culture"
    | "Nightlife"
    | "Spiritual"
    | "Beaches"
    | "Wildlife"
    | "Technology"
  >;
  preferences: {
    budgetLevel: "budget" | "mid" | "luxury";
    walkingTolerance: "low" | "medium" | "high";
    preferredTransportation: "walk" | "drive" | "transit" | "auto" | "bike";
    wakeUpTime: string; // e.g. "08:00"
    sleepTime: string; // e.g. "22:00"
    foodPreferences: string[];
    hotelPreferences: string[];
    activityIntensity: 1 | 2 | 3;
    setting: "indoor" | "outdoor" | "mixed";
    crowdedPlacesPreference: "avoid" | "neutral" | "high";
  };
}

// 12. Booking Data
export interface BookingRecord {
  bookingId: string;
  type: "flight" | "train" | "hotel" | "activity" | "restaurant" | "cab";
  provider: string;
  startTime: string;
  endTime: string;
  location: string;
  cost: number;
  status: "confirmed" | "pending" | "cancelled";
  cancellationPolicy: string;
}

// 14. Events Data
export interface LocalEvent {
  eventId: string;
  name: string;
  type: "Concert" | "Festival" | "Sports" | "Exhibition" | "Cultural program" | "Fair" | "Conference" | "Seasonal event";
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  ticketLink?: string;
  description: string;
}

// 15. Seasonal Data
export interface DestinationSeasonalData {
  destination: string;
  bestSeason: string;
  peakSeason: string;
  offSeason: string;
  monsoonPeriod: string;
  extremeWeatherPeriods: string[];
  festivalPeriods: string[];
  seasonalClosures: string[];
}

// 16. Safety / Accessibility Data
export interface SafetyAccessibilityInfo {
  wheelchairAccessible: boolean;
  elevatorAvailable: boolean;
  accessibleToilets: boolean;
  parkingAvailable: boolean;
  walkingDifficulty: "easy" | "moderate" | "strenuous";
  familyFriendly: boolean;
  suitableForChildren: boolean;
  nightAccessibility: boolean;
  trekDifficulty?: "easy" | "moderate" | "difficult";
  requiredEquipment?: string[];
  permitRequirements?: string[];
}

// 20. Relationship Graph Data
export interface RelationshipNode {
  id: string;
  type: "Hotel" | "Attraction" | "Restaurant" | "TransitHub";
  name: string;
  nearbyNodeIds: { nodeId: string; distanceKm: number; relation: "nearby" }[];
}
