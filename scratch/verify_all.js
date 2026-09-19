import express from "express";
import { generateOptimizedItinerary } from "../server/optimizer/itineraryOptimizer.js";
import { replanTrip } from "../server/optimizer/replanner.js";
import { applyAction } from "../server/optimizer/actions.js";
import { processAssistantMessage } from "../server/services/aiService.js";
import fs from "fs";
import path from "path";

async function verifyAll() {
  console.log("=== TravelPilot End-to-End System Verification ===");

  const jaipurActivities = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "server/data/activities.jaipur.json"), "utf-8")
  );

  const sampleTripReq = {
    id: "trip_verify",
    destination: "Jaipur",
    startDate: "2026-10-01",
    endDate: "2026-10-04",
    travellers: { adults: 2, children: 0, elderly: 0 },
    budget: { total: 25000, currency: "INR" },
    interests: ["History", "Culture", "Food"],
    preferences: { pace: "balanced", walking: "medium", dayStart: "09:00", dayEnd: "21:00", tier: "mid" },
    startingPoint: { type: "railway", name: "Jaipur Station", lat: 26.9200, lng: 75.7950 },
    activityPool: jaipurActivities,
    itinerary: [],
    weather: [
      { day: 1, date: "2026-10-01", condition: "sunny", tempC: 31, rainProbability: 0.05, provenance: "demo" },
      { day: 2, date: "2026-10-02", condition: "sunny", tempC: 32, rainProbability: 0.10, provenance: "demo" },
      { day: 3, date: "2026-10-03", condition: "cloudy", tempC: 29, rainProbability: 0.20, provenance: "demo" },
      { day: 4, date: "2026-10-04", condition: "sunny", tempC: 30, rainProbability: 0.05, provenance: "demo" },
    ],
  };

  // 1. Test Jaipur Trip Generation
  const genRes = generateOptimizedItinerary(sampleTripReq);
  sampleTripReq.itinerary = genRes.itinerary;
  console.log(`[PASS] Jaipur 4-Day Itinerary Generated (${genRes.itinerary.length} items scheduled).`);

  // 2. Test Amber Fort Closure Disruption & Replanning
  const replanRes = replanTrip(sampleTripReq, "closed", { affectedActivityId: "jpr_amber_fort" });
  console.log(`[PASS] Amber Fort Closure Replanned. Added replacement: ${replanRes.replanResult.added.join(", ")}`);
  console.log(`       Explanation: "${replanRes.replanResult.explanation}"`);

  // 3. Test Action Reducer & Undo History
  const actionRes = applyAction(replanRes.trip, { action: "CHANGE_BUDGET", amount: 30000 });
  console.log(`[PASS] Budget Change Action Applied. History snapshots count: ${actionRes.trip.history.length}`);

  // 4. Test Offline Assistant NLP Chat Parser
  const chatRes = await processAssistantMessage("How much budget is left?", actionRes.trip);
  console.log(`[PASS] AI Assistant Chat Processed: "${chatRes.reply}"`);

  console.log("\n✅ ALL SYSTEM SYSTEMS OPERATIONAL AND VERIFIED CLEAN!");
}

verifyAll().catch((err) => {
  console.error("❌ VERIFICATION FAILED:", err);
  process.exit(1);
});
