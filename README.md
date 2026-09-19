# TravelPilot — Adaptive AI Travel Agent (v2 Prototype)

> **Central Idea**: TravelPilot doesn't just plan a trip once. It continuously reasons about the trip and adapts dynamically when reality changes (e.g., attraction closures, monsoon rain, budget cuts, or transport delays).

---

## 1. Problem & Solution

### The Problem
Traditional travel planners build static itineraries. When reality hits — an attraction unexpectedly closes, heavy rain washes out an outdoor trek, or a budget gets slashed — static plans break completely, forcing travellers to manually research and reschedule everything from scratch.

### The Solution
**TravelPilot** introduces a real-time **Reasoning & Replanning Loop**:
`User Constraints → Research → Optimized Itinerary → Reality Disruption Occurs → Impact Analysis → Candidate Validation → Local Window Replanning → Factual Explanation & Before/After Diff`

---

## 2. Mermaid Architecture Diagram

```mermaid
flowchart TD
    User([User Request / Constraints]) --> Wizard[Trip Creation Wizard]
    User --> Assistant[AI Assistant Chat]
    User --> Simulator[Disruption Simulator]

    Wizard --> ServerAPI[Express Server API]
    Assistant --> ServerAPI
    Simulator --> ServerAPI

    subgraph Core Engine [Stateless Server Optimization Core]
        ServerAPI --> TravelTime[Travel Time Engine\nHaversine x 1.3]
        ServerAPI --> Scoring[Candidate Scoring\nScoreBreakdown]
        ServerAPI --> GeoCluster[Geographic Clustering\n& Day Scheduling]
        ServerAPI --> BudgetOpt[Budget Optimizer\nTier Cost Model]
        ServerAPI --> ConflictDet[Conflict Detector\nOverlaps, Hours, Budget]
        ServerAPI --> Replanner[Windowed Replanner\nFreeze Unaffected Items]
        ServerAPI --> ActionReducer[Action Reducer\nState History & Undo]
    end

    ServerAPI --> AIAdapter[AI & Rule-Based Assistant Service]
    AIAdapter -->|No API Key| OfflineNLP[Offline Rule-Based NLP Parser]
    AIAdapter -->|Key Present| LLM[Live LLM Adapter]

    Core Engine --> ClientStore[Zustand Client Store]
    ClientStore --> DashboardUI[Dashboard Timeline & Activity Cards]
    ClientStore --> DiffUI[Before/After Visual Diff View]
    ClientStore --> BudgetUI[Recharts Budget Breakdown]
    ClientStore --> MapUI[Leaflet Map & Offline SVG Plot]
    ClientStore --> SourcesUI[Research Data Provenance]
```

---

## 3. Tech Stack

- **Client**: React + Vite, TypeScript, Tailwind CSS, Lucide React icons, Recharts, Leaflet (OpenStreetMap tiles with offline SVG plot fallback), Zustand state store with Undo history.
- **Server**: Node.js + Express, stateless REST API.
- **Validation**: Zod schemas for all API payloads and actions.
- **Testing**: Vitest (13 comprehensive automated tests across 7 test suites).
- **Data**: JSON seed files with explicit data provenance badges (`verified`, `estimated`, `demo`).

---

## 4. Key Features

1. **Zero API Key Offline Execution**: The Jaipur and Munnar demos, full itinerary generation, windowed replanning engine, and rule-based AI assistant run 100% offline.
2. **Explicit Data Provenance**: Every fact, price, and route carries provenance badges (`verified` live, `estimated` model, `demo` fixture).
3. **Deterministic Optimization Engine**:
   - Haversine distance with 1.3 urban road detour factor.
   - Multi-factor candidate scoring producing a granular `ScoreBreakdown`.
   - Geographic clustering per day to minimize intra-day travel.
   - Pacing buffers (10-15 min between activities) and meal window insertion.
4. **Budget Intelligence**: Per-tier cost model tracking accommodation, local transport, dining, and activity entry fees.
5. **Typed Conflict Detection**: Detects `time_overlap`, `opening_hours`, `insufficient_travel_time`, `over_budget`, `preference_conflict`, `unverified_hours`.
6. **Windowed Replanning (The Heart of the Product)**:
   - Freezes user-locked and non-affected itinerary items.
   - Evaluates score-ranked replacement candidates.
   - Generates factual explanations from stored score breakdowns.
7. **Visual Before & After Diff View**: Side-by-side timeline diff displaying added, removed, and rescheduled items alongside budget/travel deltas and one-click Undo.
8. **AI Assistant Drawer**: Executes state-mutating actions (`REMOVE_ACTIVITY`, `MOVE_ACTIVITY`, `ADD_ACTIVITY`, `CHANGE_BUDGET`, `CHANGE_PREFERENCE`, `REPLAN`) with inline diff cards.

---

## 5. Environment Variables (`.env.example`)

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:5000

# Optional API keys (System runs 100% offline without these)
AI_API_KEY=
PLACES_API_KEY=
MAPS_API_KEY=
WEATHER_API_KEY=
SEARCH_API_KEY=
```

---

## 6. Local Installation & Execution

### Prerequisites
- Node.js (v18+)

### Steps

```bash
# 1. Install all monorepo dependencies
npm install
cd client && npm install && cd ..

# 2. Run both Client and Server concurrently
npm run dev

# 3. Build for Production
npm run build

# 4. Run Automated Test Suite (Vitest)
npm test
```

---

## 7. 30-Second Demo Walkthrough Script

### Demo 1 — Jaipur Attraction Closure (Amber Fort)
1. Open the application landing page and click **Try Jaipur Demo** (or click **Plan My Trip**).
2. Observe the generated 4-day Jaipur itinerary complete with daily timeline, lock toggles, and "Why?" explanation popups.
3. Click the prominent **Simulate Reality Disruption** button in the header.
4. Select **Attraction Closed (Amber Fort)** and click **Inject Disruption & Replan**.
5. Watch the animated reasoning pipeline (`DETECTED → ANALYZING → SEARCHING → OPTIMIZING → REPLANNED`).
6. You are automatically landed on the **Before & After Schedule Comparison** view:
   - Notice Amber Fort is removed.
   - Notice user-locked items (e.g. City Palace) remain frozen.
   - Notice a score-ranked history alternative (e.g. Jaigarh Fort / Albert Hall) was added.
   - Inspect the factual score explanation box and click **Undo** to restore the state.

### Demo 2 — Munnar Heavy Rain Adaptation
1. Click **Demo Munnar (Rain)** in the top navigation bar.
2. Click **Simulate Reality Disruption** and select **Heavy Monsoon Rain Forecast**.
3. Observe outdoor activities (mountain trekking, dam boating) on Day 2 shifted/replaced with indoor weather-resistant alternatives (Tea Museum, Punarjani Kathakali performance, Ayurvedic Spa).

---

## 8. Assumptions

1. **Travel Speeds**: Urban drive speed assumes ~25 km/h with a 1.3 road detour multiplier over straight-line Haversine distance.
2. **Offline Data**: In zero-key mode, place entry fees, opening hours, and weather use prototype fixtures marked with `demo` or `estimated` provenance badges.
3. **Currency Conversion**: All costs are stored in the destination's primary currency (INR default) and formatted per selected trip currency.

---

## 9. Limitations & Future Work

- **Current Limitations**: Prototype does not execute live payments, flight/hotel bookings, or real-time transit telemetry.
- **Future Roadmap**:
  - Live GDS/booking API integrations (Amadeus/Duffel).
  - Real-time GPS location tracking for turn-by-turn re-routing.
  - Autonomous background weather/flight status polling timers.
