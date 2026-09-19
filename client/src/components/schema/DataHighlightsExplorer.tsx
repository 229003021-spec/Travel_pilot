import React, { useState } from "react";
import { ComingSoonModal } from "../common/ComingSoonModal";
import {
  MapPin, Layers, Clock, Hourglass, Navigation, Plane, Hotel, Utensils,
  DollarSign, UserCheck, FileText, BookmarkCheck, Activity, Calendar, Sun,
  Shield, RefreshCw, GitFork, Sparkles, ChevronRight
} from "lucide-react";

export const DataHighlightsExplorer: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<{
    number: number | string;
    title: string;
    description: string;
    schemaPreview: object;
  } | null>(null);

  const modules = [
    {
      number: 1,
      title: "Destination / Geographic Data",
      icon: MapPin,
      status: "Active (500 Destinations)",
      description: "Collects Country, State, City, District, Lat/Lng, Tourist region, and nearby attraction distances.",
      schema: {
        country: "India",
        state: "Rajasthan",
        city: "Jaipur",
        district: "Jaipur District",
        lat: 26.9124,
        lng: 75.7873,
        touristRegion: "Golden Triangle",
        nearbyDestinations: ["Ajmer", "Pushkar", "Agra"],
      },
    },
    {
      number: 2,
      title: "25 Supported Categories",
      icon: Layers,
      status: "Active (25 Categories)",
      description: "Supports Temple, Fort, Palace, Beach, Waterfall, Wildlife, Hill Station, Museum, Market, Cafe, etc.",
      schema: {
        supportedCategories: [
          "Temple", "Church", "Mosque", "Monument", "Museum", "Fort", "Palace",
          "Beach", "Waterfall", "Hill station", "Wildlife sanctuary", "National park",
          "Shopping", "Market", "Restaurant", "Cafe", "Adventure", "Theme park",
          "Viewpoint", "Cultural attraction", "Historical site", "Nightlife",
          "Entertainment", "Nature", "Photography spot"
        ],
      },
    },
    {
      number: 3,
      title: "Opening Hours Data",
      icon: Clock,
      status: "Active (Verified/Demo)",
      description: "Opening/closing times, days open, holiday closures, seasonal timings, and recommended arrival windows.",
      schema: {
        openingTime: "09:00",
        closingTime: "17:30",
        daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        holidayClosures: ["Republic Day", "Diwali"],
        recommendedVisitDurationMin: 120,
      },
    },
    {
      number: 4,
      title: "Activity Duration Data",
      icon: Hourglass,
      status: "Active",
      description: "Normative activity duration in minutes used by optimizer for schedule fitting.",
      schema: {
        activityId: "jpr_amber_fort",
        durationMin: 150,
        bufferMin: 15,
      },
    },
    {
      number: 5,
      title: "Geographic Distance + Travel Time",
      icon: Navigation,
      status: "Active (Haversine x 1.3)",
      description: "Place A -> Place B route distance, walking time, driving time, transit time, and detour factors.",
      schema: {
        placeA: "Jaipur Railway Station",
        placeB: "Amber Fort",
        distanceKm: 11.2,
        drivingTimeMin: 25,
        walkingTimeMin: 140,
        transportationMode: "drive",
      },
    },
    {
      number: 6,
      title: "Transportation Data",
      icon: Plane,
      status: "Awaiting Live GDS Input",
      description: "Dataset for Flights, Trains, Buses, and Local Transit (Metro, Taxi, Auto, Rental Car, Bike).",
      schema: {
        flights: [{ flightNumber: "6E-204", origin: "DEL", dest: "JAI", departure: "08:15", price: 3200 }],
        trains: [{ trainNumber: "12958", name: "Swarna Jayanti Rajdhani", class: "2A", price: 1450 }],
        localTransit: [{ mode: "Taxi", ratePerKm: 18 }, { mode: "Metro", tokenCost: 40 }],
      },
    },
    {
      number: 7,
      title: "Accommodation Data",
      icon: Hotel,
      status: "Awaiting Hotel Feed",
      description: "Hotels, resorts, rooms, price/night, rating, amenities, and proximity to attractions.",
      schema: {
        hotelId: "htl_101",
        name: "Rambagh Palace Jaipur",
        pricePerNight: 14500,
        rating: 4.9,
        amenities: ["Pool", "Spa", "Heritage Dining"],
        distanceFromAttractionsKm: { "Amber Fort": 12, "City Palace": 4 },
      },
    },
    {
      number: 8,
      title: "Restaurant & Dining Data",
      icon: Utensils,
      status: "Active (Culinary Pool)",
      description: "Cuisine, price range, opening hours, dietary options (Veg, Vegan, Halal, Jain, Gluten-free).",
      schema: {
        restaurantId: "rst_202",
        name: "Laxmi Misthan Bhandar",
        cuisine: ["Rajasthani", "North Indian"],
        dietaryOptions: { vegetarian: true, vegan: true, halal: false, jain: true, glutenFree: false },
        avgMealDurationMin: 60,
      },
    },
    {
      number: 9,
      title: "Cost / Pricing Data",
      icon: DollarSign,
      status: "Active (Tier Model)",
      description: "Itemized costs for entry fees, dining per meal, hotel nights, and transit fares.",
      schema: {
        activityEntryFee: 500,
        foodDailyBudgetPerPerson: 900,
        hotelPerNight: 3500,
        transportDaily: 700,
      },
    },
    {
      number: 10,
      title: "User Profile & Preference Data",
      icon: UserCheck,
      status: "Active",
      description: "Trip constraints, interests, walking tolerance, wake-up time, sleep time, and setting preference.",
      schema: {
        interests: ["History", "Culture", "Food"],
        walkingTolerance: "medium",
        wakeUpTime: "08:00",
        sleepTime: "22:00",
        setting: "mixed",
      },
    },
    {
      number: 11,
      title: "Trip Constraint Data",
      icon: FileText,
      status: "Active (TRIP_001 Schema)",
      description: "Structured trip instance schema holding destination, dates, budget, and travelers.",
      schema: {
        trip_id: "TRIP_001",
        destination: "Bengaluru",
        start_date: "2026-10-10",
        end_date: "2026-10-13",
        budget: 30000,
        travelers: 2,
        interests: ["history", "food", "shopping"],
      },
    },
    {
      number: 12,
      title: "Booking Data",
      icon: BookmarkCheck,
      status: "Awaiting Booking Ingestion",
      description: "Tracks confirmed booking records, provider IDs, costs, and cancellation policies.",
      schema: {
        bookingId: "BKG_9942",
        type: "hotel",
        provider: "MakeMyTrip",
        cost: 9500,
        status: "confirmed",
        cancellationPolicy: "Free cancellation up to 24h before check-in",
      },
    },
    {
      number: 13,
      title: "Real-Time Telemetry Data",
      icon: Activity,
      status: "Active (Weather/Disruption)",
      description: "Live weather forecasts, traffic congestion, opening status, and delay alerts.",
      schema: {
        weather: { condition: "sunny", tempC: 31, rainProbability: 0.05 },
        trafficLevel: "moderate",
        placeStatus: "available",
      },
    },
    {
      number: 14,
      title: "Events & Festivals Data",
      icon: Calendar,
      status: "Awaiting Event Feed",
      description: "Concerts, cultural festivals, exhibitions, fairs, and seasonal celebrations.",
      schema: {
        eventId: "evt_301",
        name: "Jaipur Literature Festival",
        type: "Cultural program",
        startDate: "2026-10-15",
        endDate: "2026-10-19",
        location: "Hotel Diggi Palace",
      },
    },
    {
      number: 15,
      title: "Seasonal Tourism Data",
      icon: Sun,
      status: "Active (Top 500 Dataset)",
      description: "Best season, peak season, off-season, monsoon windows, and seasonal closures.",
      schema: {
        bestSeason: "Oct–Mar",
        peakSeason: "Dec–Jan",
        monsoonPeriod: "Jul–Sep",
        seasonalClosures: [],
      },
    },
    {
      number: 16,
      title: "Safety & Accessibility Data",
      icon: Shield,
      status: "Awaiting Field Dataset",
      description: "Wheelchair accessibility, walking difficulty, family friendliness, permits, and equipment.",
      schema: {
        wheelchairAccessible: true,
        elevatorAvailable: true,
        walkingDifficulty: "easy",
        familyFriendly: true,
        requiredEquipment: [],
        permitRequirements: [],
      },
    },
    {
      number: 17,
      title: "Smart Backup / Alternative Data",
      icon: RefreshCw,
      status: "Active (Replanning Core)",
      description: "Scores alternatives matching category, location, duration, price, and opening hours.",
      schema: {
        originalActivity: "jpr_amber_fort",
        alternativeCandidates: ["jpr_jaigarh_fort", "jpr_nahargarh_fort", "jpr_city_palace"],
        matchCriteria: ["Category", "Location Proximity", "Score Breakdown"],
      },
    },
    {
      number: 20,
      title: "Relationship Graph Data",
      icon: GitFork,
      status: "Active Graph Schema",
      description: "Hotel -> nearby -> Attraction -> nearby -> Restaurant -> nearby -> Attraction graph.",
      schema: {
        graph: [
          { node: "Rambagh Palace Hotel", relation: "nearby", target: "City Palace" },
          { node: "City Palace", relation: "nearby", target: "Laxmi Misthan Bhandar Restaurant" },
          { node: "Laxmi Misthan Bhandar Restaurant", relation: "nearby", target: "Hawa Mahal" },
        ],
      },
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" /> 20-Point Data & Architecture Schema Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any data highlight module below to inspect its live status, JSON schema, and ingestion preview.
          </p>
        </div>
        <span className="text-xs font-bold text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
          Clickable Schema Modules
        </span>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => {
          const Icon = m.icon;
          const isActive = m.status.startsWith("Active");

          return (
            <div
              key={m.number}
              onClick={() =>
                setSelectedModule({
                  number: m.number,
                  title: m.title,
                  description: m.description,
                  schemaPreview: m.schema,
                })
              }
              className="bg-slate-900 border border-slate-800 hover:border-indigo-500/80 rounded-2xl p-4 cursor-pointer transition shadow-lg hover:shadow-indigo-500/10 flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition ${
                    isActive
                      ? "bg-indigo-950 border border-indigo-800 text-indigo-400"
                      : "bg-amber-950/80 border border-amber-800 text-amber-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">#{m.number}</span>
                    <span className="font-bold text-xs text-white group-hover:text-indigo-400 transition">{m.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">{m.description}</div>
                  <div className="mt-2">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isActive
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                          : "bg-amber-950/80 text-amber-300 border-amber-800/80"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition shrink-0 mt-1" />
            </div>
          );
        })}
      </div>

      {/* Coming Soon Modal */}
      {selectedModule && (
        <ComingSoonModal
          categoryNumber={selectedModule.number}
          title={selectedModule.title}
          description={selectedModule.description}
          schemaPreview={selectedModule.schemaPreview}
          isOpen={!!selectedModule}
          onClose={() => setSelectedModule(null)}
        />
      )}
    </div>
  );
};
