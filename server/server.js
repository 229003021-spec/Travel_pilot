import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { GenerateTripRequestSchema, ActionSchema } from "../shared/schemas.js";
import { StaticDataProvider, FAMOUS_PLACES_INDIA } from "./services/dataProvider.js";
import { generateOptimizedItinerary } from "./optimizer/itineraryOptimizer.js";
import { generateAlternativePlans } from "./optimizer/multiPlanGenerator.js";
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
    try {
      return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    } catch (e) {
      console.error(`Failed to load JSON at ${fullPath}:`, e);
    }
  }
  return null;
}

const prototypeMaster = loadJson("data/prototype_dataset/master_prototype.json") || {};
const prototypeTransportRoutes = loadJson("data/prototype_dataset/transportroute.json") || [];
const prototypeEvents = loadJson("data/prototype_dataset/event.json") || [];

// 1. GET /api/destinations
app.get("/api/destinations", (req, res) => {
  const destinations = StaticDataProvider.getAllDestinations();
  res.json(destinations);
});

// 2. GET /api/destinations/famous
app.get("/api/destinations/famous", (req, res) => {
  res.json(FAMOUS_PLACES_INDIA);
});

// 3. GET /api/destinations/overview/:query
app.get("/api/destinations/overview/:query", (req, res) => {
  const query = req.params.query;
  const overview = StaticDataProvider.getDestinationOverview(query);
  if (!overview) {
    return res.status(404).json({ error: "Destination not found in prototype dataset" });
  }
  res.json(overview);
});

// 4. GET /api/destinations/search?q=...
app.get("/api/destinations/search", (req, res) => {
  const q = (req.query.q || "").toString().toLowerCase().trim();
  const all = StaticDataProvider.getAllDestinations();
  if (!q) {
    const sorted = [...all].sort((a, b) => a.city.localeCompare(b.city));
    return res.json(sorted.slice(0, 20));
  }

  const filtered = all.filter(
    (d) =>
      d.city.toLowerCase().includes(q) ||
      d.state.toLowerCase().includes(q) ||
      (d.dest_id && d.dest_id.toLowerCase().includes(q))
  );

  filtered.sort((a, b) => a.city.localeCompare(b.city));
  res.json(filtered.slice(0, 30));
});

// 5. GET Prototype Dataset Raw Endpoints
app.get("/api/dataset/master", (req, res) => {
  res.json(prototypeMaster);
});

app.get("/api/dataset/transport-routes", (req, res) => {
  res.json(prototypeTransportRoutes);
});

app.get("/api/dataset/events", (req, res) => {
  res.json(prototypeEvents);
});

// 6. POST /api/trip/generate
app.post("/api/trip/generate", (req, res) => {
  try {
    const parseResult = GenerateTripRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid trip configuration", details: parseResult.error.format() });
    }

    const payload = parseResult.data;
    const destObj = StaticDataProvider.getDestinationByNameOrId(payload.destination);
    const destName = destObj ? destObj.city : payload.destination;
    const destId = destObj ? destObj.dest_id : null;

    const activityPool = StaticDataProvider.getPlacesForDestination(destId, destName);
    const hotels = StaticDataProvider.getHotelsForDestination(destId, destName);
    const restaurants = StaticDataProvider.getRestaurantsForDestination(destId, destName);
    const events = StaticDataProvider.getEventsForDestination(destId, destName, payload.startDate, payload.endDate);

    const weatherFixtures = loadJson("data/fixtures/weather.json") || {};
    const destLower = destName.toLowerCase();
    let weather = weatherFixtures[destLower] || [
      { day: 1, date: payload.startDate, condition: "sunny", tempC: 28, rainProbability: 0.1, provenance: "ESTIMATED" },
      { day: 2, date: payload.endDate, condition: "sunny", tempC: 29, rainProbability: 0.1, provenance: "ESTIMATED" },
    ];

    const startingPoint = payload.startingPoint || {
      lat: destObj ? destObj.latitude : 26.9124,
      lng: destObj ? destObj.longitude : 75.7873
    };

    const tempTrip = {
      id: `TRIP_${Date.now()}`,
      destination: destName,
      dest_id: destId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      travellers: payload.travellers,
      budget: payload.budget,
      interests: payload.interests,
      preferences: payload.preferences,
      startingPoint,
      activityPool,
      hotels,
      restaurants,
      events,
      itinerary: [],
      weather,
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

    // Run Optimizer Engine
    const { itinerary, statistics, whyThisPlan } = generateOptimizedItinerary(tempTrip);
    tempTrip.itinerary = itinerary;
    tempTrip.statistics = statistics;
    tempTrip.whyThisPlan = whyThisPlan;

    // Generate alternative plans
    const alternativePlans = generateAlternativePlans(tempTrip);
    tempTrip.plans = alternativePlans;

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

// 7. POST /api/trip/plans
app.post("/api/trip/plans", (req, res) => {
  try {
    const trip = req.body;
    if (!trip || !trip.destination) {
      return res.status(400).json({ error: "Invalid trip payload" });
    }
    const plans = generateAlternativePlans(trip);
    res.json(plans);
  } catch (error) {
    console.error("Error generating plans:", error);
    res.status(500).json({ error: "Failed to generate plan alternatives" });
  }
});

// 8. POST /api/trip/action
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

// 9. POST /api/trip/replan
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

// 10. POST /api/assistant/chat
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
