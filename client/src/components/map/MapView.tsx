import React, { useEffect, useRef, useState } from "react";
import { useTripStore } from "../../store/useTripStore";
import { MapPin, Navigation, Building2, Utensils, Calendar, ShieldCheck } from "lucide-react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";

export const MapView: React.FC = () => {
  const { trip } = useTripStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);

  if (!trip) return null;

  const activityMap = new Map((trip.activityPool || []).map((a) => [a.id, a]));

  const itineraryActivities = trip.itinerary
    .map((item) => {
      const act = activityMap.get(item.activityId);
      return act ? { item, act } : null;
    })
    .filter(Boolean) as { item: any; act: any }[];

  const hotels = (trip as any).hotels || [];
  const restaurants = (trip as any).restaurants || [];
  const events = (trip as any).events || [];

  useEffect(() => {
    let mapInstance: any = null;

    try {
      // Inject Leaflet CSS dynamically if not present
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const initMap = () => {
        if (typeof window !== "undefined" && (window as any).L && mapContainerRef.current) {
          const L = (window as any).L;
          const centerLat = trip.startingPoint.lat || 20.5937;
          const centerLng = trip.startingPoint.lng || 78.9629;

          mapInstance = L.map(mapContainerRef.current).setView([centerLat, centerLng], 12);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors",
          }).addTo(mapInstance);

          // 1. Plot Starting Point / Hotel Marker (Red)
          const startMarker = L.circleMarker([centerLat, centerLng], {
            radius: 9,
            color: "#ef4444",
            fillColor: "#dc2626",
            fillOpacity: 1,
          }).addTo(mapInstance);
          startMarker.bindPopup(`<b>Start Location:</b> ${trip.startingPoint.name}`);

          // 2. Plot Hotels (Purple)
          hotels.forEach((h: any) => {
            if (h.lat && h.lng) {
              const hMarker = L.circleMarker([h.lat, h.lng], {
                radius: 7,
                color: "#a855f7",
                fillColor: "#9333ea",
                fillOpacity: 0.9,
              }).addTo(mapInstance);
              hMarker.bindPopup(`<b>Hotel (${h.tier || "Hotel"}):</b> ${h.name}<br/>Price: ₹${h.pricePerNight}/night`);
            }
          });

          // 3. Plot Restaurants (Green)
          restaurants.forEach((r: any) => {
            if (r.lat && r.lng) {
              const rMarker = L.circleMarker([r.lat, r.lng], {
                radius: 6,
                color: "#10b981",
                fillColor: "#059669",
                fillOpacity: 0.9,
              }).addTo(mapInstance);
              rMarker.bindPopup(`<b>Restaurant:</b> ${r.name}<br/>Cuisine: ${r.cuisine || "Local"}`);
            }
          });

          // 4. Plot Itinerary Activities (Blue) with sequential route
          const latLngs: [number, number][] = [[centerLat, centerLng]];

          itineraryActivities.forEach(({ item, act }) => {
            const marker = L.circleMarker([act.lat, act.lng], {
              radius: 8,
              color: "#3b82f6",
              fillColor: "#2563eb",
              fillOpacity: 0.9,
            }).addTo(mapInstance);

            marker.bindPopup(`<b>Day ${item.day}:</b> ${act.name}<br/><i>${item.startTime} - ${item.endTime}</i><br/>Cost: ₹${item.estimatedCost}`);
            latLngs.push([act.lat, act.lng]);
          });

          // 5. Draw Polyline Route
          if (latLngs.length > 1) {
            L.polyline(latLngs, { color: "#3b82f6", weight: 3, dashArray: "6, 6" }).addTo(mapInstance);
          }

          // Fit bounds
          if (latLngs.length > 0) {
            mapInstance.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] });
          }
        } else {
          setMapError(true);
        }
      };

      if ((window as any).L) {
        initMap();
      } else {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => initMap();
        script.onerror = () => setMapError(true);
        document.head.appendChild(script);
      }
    } catch (e) {
      console.warn("Leaflet map initialization warning, using SVG plot:", e);
      setMapError(true);
    }

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, [trip]);

  // Compute SVG fallback bounds
  const lats = [trip.startingPoint.lat, ...itineraryActivities.map(({ act }) => act.lat)];
  const lngs = [trip.startingPoint.lng, ...itineraryActivities.map(({ act }) => act.lng)];
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const mapToSvg = (lat: number, lng: number) => {
    const x = ((lng - minLng) / Math.max(0.01, maxLng - minLng)) * 500 + 50;
    const y = 350 - ((lat - minLat) / Math.max(0.01, maxLat - minLat)) * 300;
    return { x, y };
  };

  const startSvg = mapToSvg(trip.startingPoint.lat, trip.startingPoint.lng);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2 font-mono">
            <Navigation className="w-6 h-6 text-blue-400" />
            Interactive Map & Geographic Route
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time coordinates plotting for places, hotels, restaurants, and daily transit paths.
          </p>
        </div>
        <ProvenanceBadge type="verified" label="VERIFIED DATASET MAP" />
      </div>

      {/* Legend Row */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl px-5 py-3 text-xs font-bold text-slate-300">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Start Location</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Scheduled Activities</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block" /> Recommended Hotels</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Dining Spots</span>
      </div>

      {/* Main Map Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl min-h-[480px] relative">
        <div ref={mapContainerRef} className="w-full h-[520px] z-10" />

        {mapError && (
          <div className="p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[480px]">
            <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-80 bg-slate-900 rounded-2xl border border-slate-800">
              <polyline
                points={itineraryActivities.reduce(
                  (pts, { act }) => {
                    const p = mapToSvg(act.lat, act.lng);
                    return `${pts} ${p.x},${p.y}`;
                  },
                  `${startSvg.x},${startSvg.y}`
                )}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle cx={startSvg.x} cy={startSvg.y} r="8" fill="#ef4444" />
              <text x={startSvg.x + 12} y={startSvg.y + 4} fill="#f87171" fontSize="10" fontWeight="bold">
                START: {trip.startingPoint.name}
              </text>
              {itineraryActivities.map(({ item, act }, idx) => {
                const pt = mapToSvg(act.lat, act.lng);
                return (
                  <g key={idx}>
                    <circle cx={pt.x} cy={pt.y} r="6" fill="#3b82f6" />
                    <text x={pt.x + 10} y={pt.y + 4} fill="#60a5fa" fontSize="9" fontWeight="medium">
                      Day {item.day}: {act.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
