import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { GenerateTripRequestSchema, ActionSchema } from "../shared/schemas.js";
import { generateOptimizedItinerary } from "./optimizer/itineraryOptimizer.js";
import { calculateBudgetBreakdown } from "./optimizer/budgetOptimizer.js";
import { applyAction } from "./optimizer/actions.js";
import { replanTrip } from "./optimizer/replanner.js";
import { detectConflicts } from "./optimizer/conflictDetector.js";
import { processAssistantMessage } from "./services/aiService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

function loadJson(relPath) {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  }
  return null;
}

const top500Destinations = loadJson("data/top500_destinations.json") || [];
const prototypeMaster = loadJson("data/prototype_dataset/master_prototype.json") || {};
const prototypeTransportRoutes = loadJson("data/prototype_dataset/transportroute.json") || [];
const prototypeEvents = loadJson("data/prototype_dataset/event.json") || [];

const destCoordinates = {
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
};

function buildDynamicActivityPool(destinationName) {
  const nameLower = destinationName.toLowerCase();

  // 1. Check curated seeds first
  if (nameLower.includes("jaipur")) return loadJson("data/activities.jaipur.json") || [];
  if (nameLower.includes("munnar")) return loadJson("data/activities.munnar.json") || [];

  // 2. Search Top 500 Excel dataset
  const match = top500Destinations.find(
    (d) =>
      d.name.toLowerCase() === nameLower ||
      nameLower.includes(d.name.toLowerCase()) ||
      d.name.toLowerCase().includes(nameLower)
  );

  const baseCoords = destCoordinates[nameLower] || { lat: 26.9124, lng: 75.7873 };
  const pool = [];
  let actIndex = 1;

  if (match) {
    // Generate candidates from Attractions
    (match.attractions || []).forEach((att, idx) => {
      pool.push({
        id: `act_${actIndex++}_att`,
        name: att,
        category: "attraction",
        tags: ["culture", "sightseeing", match.type.toLowerCase()],
        description: `Famous attraction in ${match.name}, ${match.state}. ${match.specialExperience || ""}`,
        lat: baseCoords.lat + (idx * 0.008 - 0.012),
        lng: baseCoords.lng + (idx * 0.008 - 0.012),
        area: `${match.name} Central`,
        indoor: false,
        walkingIntensity: 2,
        durationMin: 120,
        costPerPerson: { value: 150 + idx * 50, provenance: "estimated" },
        openingHours: {
          value: {
            mon: [["08:00", "18:00"]], tue: [["08:00", "18:00"]], wed: [["08:00", "18:00"]],
            thu: [["08:00", "18:00"]], fri: [["08:00", "18:00"]], sat: [["08:00", "18:00"]], sun: [["08:00", "18:00"]]
          },
          provenance: "estimated"
        },
        familyFriendly: true,
        rating: 4.7,
        popularity: 0.95,
        status: "available"
      });
    });

    // Generate candidates from Monuments & Heritage
    (match.monuments || []).forEach((mon, idx) => {
      pool.push({
        id: `act_${actIndex++}_mon`,
        name: mon,
        category: "museum",
        tags: ["history", "architecture", "heritage"],
        description: `Historic monument and heritage site in ${match.name}.`,
        lat: baseCoords.lat + (idx * 0.006 + 0.005),
        lng: baseCoords.lng + (idx * 0.006 + 0.005),
        area: `${match.name} Old Town`,
        indoor: true,
        walkingIntensity: 2,
        durationMin: 90,
        costPerPerson: { value: 200 + idx * 50, provenance: "estimated" },
        openingHours: {
          value: {
            mon: [["09:00", "17:00"]], tue: [["09:00", "17:00"]], wed: [["09:00", "17:00"]],
            thu: [["09:00", "17:00"]], fri: [["09:00", "17:00"]], sat: [["09:00", "17:00"]], sun: [["09:00", "17:00"]]
          },
          provenance: "estimated"
        },
        familyFriendly: true,
        rating: 4.6,
        popularity: 0.92,
        status: "available"
      });
    });

    // Generate Food & Culinary Candidates
    (match.food || []).forEach((fd, idx) => {
      pool.push({
        id: `act_${actIndex++}_fd`,
        name: `${fd} Specialty Dining`,
        category: "food",
        tags: ["food", "culinary"],
        description: `Authentic culinary experience featuring local ${fd} delicacies.`,
        lat: baseCoords.lat + (idx * 0.004 - 0.006),
        lng: baseCoords.lng + (idx * 0.004 - 0.006),
        area: `${match.name} Market Area`,
        indoor: true,
        walkingIntensity: 1,
        durationMin: 60,
        costPerPerson: { value: 350 + idx * 100, provenance: "estimated" },
        openingHours: {
          value: {
            mon: [["08:00", "22:30"]], tue: [["08:00", "22:30"]], wed: [["08:00", "22:30"]],
            thu: [["08:00", "22:30"]], fri: [["08:00", "22:30"]], sat: [["08:00", "22:30"]], sun: [["08:00", "22:30"]]
          },
          provenance: "estimated"
        },
        familyFriendly: true,
        rating: 4.6,
        popularity: 0.90,
        mealType: idx === 0 ? "breakfast" : idx === 1 ? "lunch" : "dinner",
        status: "available"
      });
    });

    if (match.shopping) {
      pool.push({
        id: `act_${actIndex++}_shp`,
        name: `${match.shopping} Craft Market`,
        category: "shopping",
        tags: ["shopping", "handicrafts"],
        description: `Bustling local market famous for ${match.shopping}.`,
        lat: baseCoords.lat + 0.002,
        lng: baseCoords.lng - 0.002,
        area: `${match.name} Market Area`,
        indoor: false,
        walkingIntensity: 2,
        durationMin: 90,
        costPerPerson: { value: 0, provenance: "estimated" },
        openingHours: {
          value: {
            mon: [["10:00", "20:30"]], tue: [["10:00", "20:30"]], wed: [["10:00", "20:30"]],
            thu: [["10:00", "20:30"]], fri: [["10:00", "20:30"]], sat: [["10:00", "20:30"]], sun: [["10:00", "20:30"]]
          },
          provenance: "estimated"
        },
        familyFriendly: true,
        rating: 4.5,
        popularity: 0.88,
        status: "available"
      });
    }
  }

  if (pool.length < 6) {
    const genericItems = [
      { name: `${destinationName} City Heritage Walk`, category: "attraction", durationMin: 90, cost: 100 },
      { name: `${destinationName} Central Museum & Gallery`, category: "museum", durationMin: 75, cost: 150 },
      { name: `${destinationName} Local Food & Tea Stop`, category: "food", durationMin: 45, cost: 200, mealType: "breakfast" },
      { name: `${destinationName} Sunset Viewpoint`, category: "nature", durationMin: 60, cost: 0 },
      { name: `${destinationName} Royal Palace Restaurant`, category: "food", durationMin: 75, cost: 500, mealType: "lunch" },
      { name: `${destinationName} Traditional Evening Cultural Show`, category: "entertainment", durationMin: 90, cost: 350 },
    ];

    genericItems.forEach((g, idx) => {
      pool.push({
        id: `act_${actIndex++}_gen`,
        name: g.name,
        category: g.category,
        tags: ["sightseeing"],
        description: `Popular experience in ${destinationName}.`,
        lat: baseCoords.lat + (idx * 0.005 - 0.01),
        lng: baseCoords.lng + (idx * 0.005 - 0.01),
        area: `${destinationName} Center`,
        indoor: g.category === "museum" || g.category === "food",
        walkingIntensity: 1,
        durationMin: g.durationMin,
        costPerPerson: { value: g.cost, provenance: "estimated" },
        openingHours: {
          value: {
            mon: [["08:00", "21:00"]], tue: [["08:00", "21:00"]], wed: [["08:00", "21:00"]],
            thu: [["08:00", "21:00"]], fri: [["08:00", "21:00"]], sat: [["08:00", "21:00"]], sun: [["08:00", "21:00"]]
          },
          provenance: "estimated"
        },
        familyFriendly: true,
        rating: 4.5,
        popularity: 0.85,
        mealType: g.mealType,
        status: "available"
      });
    });
  }

  return pool;
}

// 1. GET /api/destinations
app.get("/api/destinations", (req, res) => {
  const destinations = loadJson("data/destinations.json") || [];
  res.json(destinations);
});

// 2. GET /api/destinations/top500
app.get("/api/destinations/top500", (req, res) => {
  res.json(top500Destinations);
});

// 3. GET Prototype Dataset Endpoints
app.get("/api/dataset/master", (req, res) => {
  res.json(prototypeMaster);
});

app.get("/api/dataset/transport-routes", (req, res) => {
  res.json(prototypeTransportRoutes);
});

app.get("/api/dataset/events", (req, res) => {
  res.json(prototypeEvents);
});

// 4. POST /api/trip/generate
app.post("/api/trip/generate", (req, res) => {
  try {
    const parseResult = GenerateTripRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid trip configuration", details: parseResult.error.format() });
    }

    const payload = parseResult.data;
    const destLower = payload.destination.toLowerCase();

    // Dynamically build activity pool
    const activityPool = buildDynamicActivityPool(payload.destination);

    // Weather fixture or neutral estimate
    const weatherFixtures = loadJson("data/fixtures/weather.json") || {};
    let weather = weatherFixtures[destLower] || [
      { day: 1, date: payload.startDate, condition: "sunny", tempC: 28, rainProbability: 0.1, provenance: "estimated" },
      { day: 2, date: payload.endDate, condition: "sunny", tempC: 29, rainProbability: 0.1, provenance: "estimated" },
    ];

    const tempTrip = {
      id: `trip_${Date.now()}`,
      destination: payload.destination,
      startDate: payload.startDate,
      endDate: payload.endDate,
      travellers: payload.travellers,
      budget: payload.budget,
      interests: payload.interests,
      preferences: payload.preferences,
      startingPoint: payload.startingPoint,
      activityPool,
      itinerary: [],
      weather,
      alerts: [],
      sources: [
        {
          id: "src_1",
          title: `India Travel Prototype Dataset - ${payload.destination}`,
          source: "india_travel_prototype_dataset_xlsx",
          snippet: `Extracted from India_Travel_Prototype_Dataset.xlsx (500 Destinations, Places, TransportRoutes, Events).`,
          retrievedAt: new Date().toISOString(),
          provenance: "verified",
        },
      ],
      history: [],
      lastUpdated: new Date().toISOString(),
    };

    // Run Optimizer Engine
    const { itinerary } = generateOptimizedItinerary(tempTrip);
    tempTrip.itinerary = itinerary;

    // Detect conflicts & calculate budget
    const conflicts = detectConflicts(tempTrip);
    tempTrip.alerts = conflicts.map((c, i) => ({
      id: `cfl_${i}_${Date.now()}`,
      type: c.severity === "critical" ? "critical" : c.severity === "warning" ? "warning" : "info",
      title: c.type.replace("_", " ").toUpperCase(),
      message: c.message,
      timestamp: new Date().toISOString(),
    }));

    res.json(tempTrip);
  } catch (error) {
    console.error("Error generating trip:", error);
    res.status(500).json({ error: "Failed to generate trip itinerary", message: error.message });
  }
});

// 5. POST /api/trip/action
app.post("/api/trip/action", (req, res) => {
  try {
    const { trip, action } = req.body;
    if (!trip || !action) {
      return res.status(400).json({ error: "Missing trip or action in payload" });
    }

    const actionParse = ActionSchema.safeParse(action);
    if (!actionParse.success) {
      return res.status(400).json({ error: "Invalid action payload", details: actionParse.error.format() });
    }

    const result = applyAction(trip, actionParse.data);
    res.json(result);
  } catch (error) {
    console.error("Error applying action:", error);
    res.status(500).json({ error: "Failed to apply action", message: error.message });
  }
});

// 6. POST /api/trip/replan
app.post("/api/trip/replan", (req, res) => {
  try {
    const { trip, reason, options } = req.body;
    if (!trip || !reason) {
      return res.status(400).json({ error: "Missing trip or reason" });
    }

    const result = replanTrip(trip, reason, options || {});
    res.json(result);
  } catch (error) {
    console.error("Error replanning trip:", error);
    res.status(500).json({ error: "Failed to replan trip", message: error.message });
  }
});

// 7. POST /api/assistant/chat
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { message, trip } = req.body;
    if (!message || !trip) {
      return res.status(400).json({ error: "Missing message or trip in payload" });
    }

    const result = await processAssistantMessage(message, trip);
    res.json(result);
  } catch (error) {
    console.error("Error processing assistant chat:", error);
    res.status(500).json({ error: "Failed to process chat message", message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[TravelPilot Server] Listening on http://localhost:${PORT}`);
});
