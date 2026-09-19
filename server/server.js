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
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));

// Helper to load JSON files
function loadJson(relPath) {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  }
  return null;
}

// 1. GET /api/destinations
app.get("/api/destinations", (req, res) => {
  const destinations = loadJson("data/destinations.json") || [];
  res.json(destinations);
});

// 2. POST /api/trip/generate
app.post("/api/trip/generate", (req, res) => {
  try {
    const parseResult = GenerateTripRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid trip configuration", details: parseResult.error.format() });
    }

    const payload = parseResult.data;
    const destLower = payload.destination.toLowerCase();

    // Select activity pool
    let activityPool = [];
    if (destLower.includes("jaipur")) {
      activityPool = loadJson("data/activities.jaipur.json") || [];
    } else if (destLower.includes("munnar")) {
      activityPool = loadJson("data/activities.munnar.json") || [];
    } else {
      // Generic fallback activity pool for un-curated destinations
      activityPool = (loadJson("data/activities.jaipur.json") || []).map((act, idx) => ({
        ...act,
        id: `gen_${idx}_${act.id}`,
        name: `${payload.destination} ${act.name.replace("Jaipur", "").trim()}`,
        area: `${payload.destination} Central`,
        costPerPerson: { value: act.costPerPerson.value, provenance: "estimated" },
      }));
    }

    // Load weather fixture or neutral estimate
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
          title: `Official Tourism Portal - ${payload.destination}`,
          source: "official_tourism",
          snippet: `Curated cultural and attraction highlights for ${payload.destination}.`,
          retrievedAt: new Date().toISOString(),
          provenance: destLower.includes("jaipur") || destLower.includes("munnar") ? "demo" : "estimated",
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

// 3. POST /api/trip/action
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

// 4. POST /api/trip/replan
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

// 5. POST /api/assistant/chat
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
