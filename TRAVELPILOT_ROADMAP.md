# TravelPilot — Technical & Product Architecture Roadmap

TravelPilot is an autonomous AI travel planning, itinerary optimization, budget tracking, and real-time disruption-management web platform for global and Indian tourism.

---

## 1. Current Architecture

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             Client Application Layer                             │
│       React 18 + TypeScript + Vite + TailwindCSS + Zustand + Leaflet Maps        │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │  Hybrid Client / Server Fallback Service  │
                   │ (StaticDataProvider & clientOptimizer.ts) │
                   └─────────────────────┬─────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌───────────────────────┐    ┌───────────────────────┐    ┌───────────────────────┐
│  Data Ingestion Layer │    │ 17-Step Optimization  │    │  AI Natural Language  │
│ (Prototype & Top 500) │    │ & Replanning Engine   │    │  Modification Layer   │
└───────────────────────┘    └───────────────────────┘    └───────────────────────┘
```

---

## 2. Current Features

- **Natural Language & Form-Based Trip Planning**: Instant extraction of destination, dates, budget, travelers, and interests from raw text or structured form.
- **17-Step Optimization Pipeline**: Deterministic scheduling considering spatial geo-clustering, road travel times (`TransportRoute` dataset or Haversine × 1.3), opening hours, closed days, and meal window placement.
- **Multi-Plan Variant Generator**: Instant alternative plans (**Relaxed**, **Balanced**, **Packed**) with 0–100% compatibility scores.
- **Budget Tracking & Risk Engine**: Breakdown across Accommodation, Transport, Food, Activities, Events, and Buffer with over-budget warning alerts and auto-shortfall suggestions.
- **Centralized Conflict Detector**: Identifies time overlaps, closed days, insufficient travel gaps, duplicate activities, and budget overruns.
- **Interactive Map Plotter**: Leaflet map plotting starting location (red), hotels (purple), activities (blue), dining spots (green), and polyline transit paths.
- **AI Natural Language Assistant**: Operates on live trip state for commands (*"I am tired"*, *"Make Day 2 relaxed"*, *"Reduce budget to ₹20,000"*, *"Remove temples"*, *"Add food experiences"*).
- **Data Provenance Badging**: Explicit provenance tags (`VERIFIED DATASET`, `CALCULATED DATA`, `LIVE DATA`).
- **Offline / Static GitHub Pages Support**: Runs 100% in-browser on GitHub Pages static deployment via `clientOptimizer.ts`.

---

## 3. Missing Features & Future Enhancements

- **PostgreSQL Database Backend**: Migrate static JSON datasets to a relational database with PostGIS spatial indexing.
- **Live Travel Provider APIs**: Connect real-time flight (Skyscanner/Amadeus), train (IRCTC), and hotel booking APIs.
- **Live Weather API**: Real-time WeatherAPI / OpenWeatherMap integration for rain and storm alerts.
- **Group Travel & Voting**: Shared trip links allowing group members to vote on daily itinerary items.
- **Progressive Web App (PWA)**: Offline caching of active trip timeline, emergency contacts, and maps.

---

## 4. Data & API Requirements

| Resource | Required Data / API | Purpose | Expected Schema |
| :--- | :--- | :--- | :--- |
| **Maps & Routing** | Mapbox GL / Google Maps Directions API | Precise driving, walking, & transit routes | `{ origin: [lat, lng], destination: [lat, lng], mode: "driving" }` |
| **Live Weather** | OpenWeatherMap / WeatherAPI | Real-time weather forecasts & rain alerts | `{ lat, lng, date, tempC, rainProbability, condition }` |
| **Hotels & Stay** | Booking.com / Hotelbeds API | Live room rates & instant booking links | `{ dest_id, check_in, check_out, pricePerNight, rooms }` |
| **Flight / Train** | Skyscanner / IRCTC Provider Adapter | Transport duration & ticket pricing | `{ origin, destination, departureDate, price, mode }` |

---

## 5. Database Schema (Target PostgreSQL Architecture)

```sql
-- Destinations
CREATE TABLE destinations (
  id VARCHAR(50) PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  type VARCHAR(50),
  ideal_stay_days INT DEFAULT 3,
  best_season VARCHAR(100)
);

-- Places & Attractions
CREATE TABLE places (
  id VARCHAR(50) PRIMARY KEY,
  dest_id VARCHAR(50) REFERENCES destinations(id),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  cost_per_person NUMERIC(10,2) DEFAULT 0,
  duration_min INT DEFAULT 90,
  opening_hours JSONB,
  closed_days TEXT[]
);

-- Hotels
CREATE TABLE hotels (
  id VARCHAR(50) PRIMARY KEY,
  dest_id VARCHAR(50) REFERENCES destinations(id),
  name VARCHAR(200) NOT NULL,
  tier VARCHAR(20) CHECK (tier IN ('Budget', 'Mid-range', 'Luxury')),
  price_per_night NUMERIC(10,2) NOT NULL,
  rating NUMERIC(3,2),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6)
);
```

---

## 6. Implementation Roadmap & Phases

- **Phase 1 (Completed)**: Monorepo setup, React + Vite UI, shared TypeScript types, Tailwind design system.
- **Phase 2 (Completed)**: Seed dataset ingestion (`India_Travel_Prototype_Dataset.xlsx` & `Top 500 Destinations`).
- **Phase 3 (Completed)**: 17-step optimization engine, conflict detector, multi-plan generator, and budget engine.
- **Phase 4 (Completed)**: Explore search with city alias resolution, Hotels & Restaurants discovery pages, Leaflet map plotter.
- **Phase 5 (Completed)**: GitHub Pages static fallback engine (`clientOptimizer.ts`), PWA readiness, and Vitest test suite.
- **Phase 6 (Next Phase)**: PostgreSQL database migration, user auth (Supabase/Firebase), and live Skyscanner/OpenWeatherMap integration.
