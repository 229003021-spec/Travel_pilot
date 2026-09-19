import React, { useState } from "react";
import { ComingSoonModal } from "../common/ComingSoonModal";

import destData from "../../data/prototype_dataset/destination.json";
import placeData from "../../data/prototype_dataset/place.json";
import openingHoursData from "../../data/prototype_dataset/openinghours.json";
import activityData from "../../data/prototype_dataset/activity.json";
import hotelData from "../../data/prototype_dataset/hotel.json";
import transportRouteData from "../../data/prototype_dataset/transportroute.json";
import eventData from "../../data/prototype_dataset/event.json";
import assumptionsData from "../../data/prototype_dataset/assumptions.json";

import {
  MapPin, Layers, Clock, Hourglass, Navigation, Plane, Hotel, Utensils,
  DollarSign, UserCheck, FileText, BookmarkCheck, Activity, Calendar, Sun,
  Shield, RefreshCw, GitFork, Sparkles, ChevronRight, CheckCircle2
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
      status: `Active (${destData.length} Destinations Installed)`,
      description: "Installed from Destination sheet: City, State, Region, Type, Lat/Lon, Best Season, Ideal Stay.",
      schema: destData.slice(0, 2),
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
      status: `Installed (${openingHoursData.length} Opening Hours Records)`,
      description: "Installed from OpeningHours sheet: Open/close time, days open, holiday closures, recommended stay.",
      schema: openingHoursData.length > 0 ? openingHoursData : { openingTime: "09:00", closingTime: "17:30" },
    },
    {
      number: 4,
      title: "Activity Duration Data",
      icon: Hourglass,
      status: `Installed (${activityData.length} Activity Duration Records)`,
      description: "Installed from Activity sheet: Normative duration in minutes used by optimizer for schedule fitting.",
      schema: activityData.slice(0, 3),
    },
    {
      number: 5,
      title: "Geographic Distance + Travel Time",
      icon: Navigation,
      status: `Installed (${transportRouteData.length} Road Routes Installed)`,
      description: "Installed from TransportRoute sheet: 824 inter-city routes with straight line km, road km, duration hrs.",
      schema: transportRouteData.slice(0, 2),
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
      status: `Installed (${hotelData.length} Hotel Records)`,
      description: "Installed from Hotel sheet: Hotel ID, Name, dest_id, City, Source.",
      schema: hotelData.slice(0, 3),
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
      status: `Installed (${eventData.length} Cultural Events)`,
      description: "Installed from Event sheet: Pushkar Fair, Dev Deepawali, venue lat/lon, typical month.",
      schema: eventData.slice(0, 3),
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
            <Sparkles className="w-5 h-5 text-indigo-400" /> Installed Dataset & 20-Point Architecture Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Parsed directly from <span className="text-emerald-400 font-mono font-bold">India_Travel_Prototype_Dataset.xlsx</span> (500 Destinations, 56 Places, 824 Routes, 29 Events).
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800 flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Dataset Installed
        </span>
      </div>

      {/* Module Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => {
          const Icon = m.icon;
          const isInstalled = m.status.includes("Active") || m.status.includes("Installed");

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
                    isInstalled
                      ? "bg-emerald-950 border border-emerald-800 text-emerald-400"
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
                        isInstalled
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/80"
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

      {/* Coming Soon / Dataset Preview Modal */}
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
