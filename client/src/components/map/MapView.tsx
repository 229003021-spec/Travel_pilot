import React, { useEffect, useRef, useState, useMemo } from "react";
import { useTripStore } from "../../store/useTripStore";
import {
  Navigation,
  MapPin,
  Sparkles,
  Radio,
  Layers,
  Filter,
  Search,
  Plus,
  Lock,
  Unlock,
  Clock,
  Compass,
  ChevronRight,
  Utensils,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Check,
} from "lucide-react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";
import { AiMapOverlay } from "./AiMapOverlay";
import { RouteDiffOverlay } from "./RouteDiffOverlay";
import { createCustomMarkerHtml, CATEGORY_ICONS } from "./mapUtils";

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatTransitInfo(km: number) {
  if (km < 1) return { text: "🚶 8m walk", mins: 8, icon: "🚶" };
  const mins = Math.round((km / 35) * 60) + 10;
  if (mins < 60) return { text: `🚗 ${mins}m (${km.toFixed(1)}km)`, mins, icon: "🚗" };
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return { text: `🚗 ${hours}h ${rem}m (${km.toFixed(1)}km)`, mins, icon: "🚗" };
}

export const MapView: React.FC = () => {
  const { trip, activeDay, setActiveDay, toggleLockItem, setTrip } = useTripStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const itineraryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [mapError, setMapError] = useState(false);
  const [isLiveTrip, setIsLiveTrip] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showDiffMode, setShowDiffMode] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addStopPrompt, setAddStopPrompt] = useState<{ lat: number; lng: number } | null>(null);
  const [customStopName, setCustomStopName] = useState("");

  // Layer Visibility Controls
  const [layers, setLayers] = useState({
    attractions: true,
    hotels: true,
    restaurants: true,
    routes: true,
  });

  if (!trip) return null;

  const totalDays = useMemo(() => Math.max(...(trip.itinerary || []).map((i) => i.day), 1), [trip.itinerary]);
  const activityMap = useMemo(
    () => new Map((trip.activityPool || []).map((a) => [a.id, a])),
    [trip.activityPool]
  );

  // Filter itinerary items based on activeDay and search query
  const filteredItinerary = useMemo(() => {
    return trip.itinerary
      .filter((item) => activeDay === 0 || activeDay === undefined || item.day === activeDay)
      .map((item, seqIdx) => {
        const act = activityMap.get(item.activityId);
        return act ? { item, act, seqNum: seqIdx + 1 } : null;
      })
      .filter(Boolean) as { item: any; act: any; seqNum: number }[];
  }, [trip.itinerary, activeDay, activityMap]);

  const searchFilteredItinerary = useMemo(() => {
    if (!searchQuery.trim()) return filteredItinerary;
    const q = searchQuery.toLowerCase();
    return filteredItinerary.filter(
      ({ act }) => act.name.toLowerCase().includes(q) || act.category.toLowerCase().includes(q)
    );
  }, [filteredItinerary, searchQuery]);

  const hotels = (trip as any).hotels || [];
  const restaurants = (trip as any).restaurants || [];

  // Dual-Sync: Focus map on item click
  const handleItemClick = (actId: string, lat: number, lng: number) => {
    setSelectedActivityId(actId);
    if (mapInstanceRef.current && (window as any).L) {
      mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
    }
  };

  // Route Optimization (Sort itinerary by optimal distance sequence)
  const handleOptimizeRoute = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      if (!trip) return;
      // Re-order current active day items by proximity from starting point
      const curStart = trip.startingPoint;
      const dayItems = trip.itinerary.filter((i) => activeDay === 0 || i.day === activeDay);
      const otherItems = trip.itinerary.filter((i) => activeDay !== 0 && i.day !== activeDay);

      let unvisited = [...dayItems];
      let currentLoc = { lat: curStart.lat, lng: curStart.lng };
      let reordered: typeof dayItems = [];

      while (unvisited.length > 0) {
        let nearestIdx = 0;
        let minD = Infinity;

        unvisited.forEach((item, idx) => {
          const act = activityMap.get(item.activityId);
          if (act) {
            const d = getDistanceKm(currentLoc.lat, currentLoc.lng, act.lat, act.lng);
            if (d < minD) {
              minD = d;
              nearestIdx = idx;
            }
          }
        });

        const nextItem = unvisited.splice(nearestIdx, 1)[0];
        const nextAct = activityMap.get(nextItem.activityId);
        if (nextAct) {
          currentLoc = { lat: nextAct.lat, lng: nextAct.lng };
        }
        reordered.push(nextItem);
      }

      setTrip({
        ...trip,
        itinerary: [...otherItems, ...reordered],
      });
      setIsOptimizing(false);
    }, 600);
  };

  // Add Custom Stop from Map Click
  const handleAddCustomStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addStopPrompt || !customStopName.trim()) return;

    const newActId = `custom_${Date.now()}`;
    const newAct = {
      id: newActId,
      name: customStopName,
      category: "Attraction",
      lat: addStopPrompt.lat,
      lng: addStopPrompt.lng,
      estimatedDurationMinutes: 45,
      cost: 0,
      description: "User added custom stop on map",
    };

    const newItineraryItem = {
      day: activeDay === 0 ? 1 : activeDay,
      startTime: "16:00",
      endTime: "16:45",
      activityId: newActId,
      travelTimeMinutes: 15,
      estimatedCost: 0,
    };

    setTrip({
      ...trip,
      activityPool: [...(trip.activityPool || []), newAct as any],
      itinerary: [...trip.itinerary, newItineraryItem as any],
    });

    setAddStopPrompt(null);
    setCustomStopName("");
  };

  // Initialize & Update Map
  useEffect(() => {
    let mapInstance: any = null;

    try {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const renderMap = () => {
        if (typeof window !== "undefined" && (window as any).L && mapContainerRef.current) {
          const L = (window as any).L;

          if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
          }

          const centerLat = trip.startingPoint.lat || 20.5937;
          const centerLng = trip.startingPoint.lng || 78.9629;

          mapInstance = L.map(mapContainerRef.current, {
            zoomControl: false,
          }).setView([centerLat, centerLng], 12);

          L.control.zoom({ position: "bottomright" }).addTo(mapInstance);

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors",
          }).addTo(mapInstance);

          mapInstanceRef.current = mapInstance;

          // Handle map click for "+ Add Stop"
          mapInstance.on("click", (e: any) => {
            setAddStopPrompt({ lat: e.latlng.lat, lng: e.latlng.lng });
          });

          const allBoundsLatLngs: [number, number][] = [[centerLat, centerLng]];

          // 1. Plot Starting Point Marker
          const startIconHtml = createCustomMarkerHtml("attraction", trip.startingPoint.name, undefined, false, false);
          const startCustomIcon = L.divIcon({
            html: startIconHtml,
            className: "custom-leaflet-marker",
            iconSize: [120, 36],
            iconAnchor: [60, 36],
          });
          const startMarker = L.marker([centerLat, centerLng], { icon: startCustomIcon }).addTo(mapInstance);
          startMarker.bindPopup(`
            <div class="p-2 font-sans text-xs">
              <strong class="text-red-500 font-bold">🚀 Trip Start Point:</strong><br/>
              ${trip.startingPoint.name}
            </div>
          `);

          // 2. Plot Hotels Layer
          if (layers.hotels) {
            hotels.forEach((h: any) => {
              if (h.lat && h.lng) {
                const iconHtml = createCustomMarkerHtml("hotel", h.name);
                const customIcon = L.divIcon({
                  html: iconHtml,
                  className: "custom-leaflet-marker",
                  iconSize: [120, 36],
                  iconAnchor: [60, 36],
                });
                const marker = L.marker([h.lat, h.lng], { icon: customIcon }).addTo(mapInstance);
                marker.bindPopup(`<b>🏨 Hotel (${h.tier || "Mid-range"}):</b> ${h.name}<br/>Price: ₹${h.pricePerNight}/night`);
                allBoundsLatLngs.push([h.lat, h.lng]);
              }
            });
          }

          // 3. Plot Dining Spots Layer
          if (layers.restaurants) {
            restaurants.forEach((r: any) => {
              if (r.lat && r.lng) {
                const iconHtml = createCustomMarkerHtml("restaurant", r.name);
                const customIcon = L.divIcon({
                  html: iconHtml,
                  className: "custom-leaflet-marker",
                  iconSize: [120, 36],
                  iconAnchor: [60, 36],
                });
                const marker = L.marker([r.lat, r.lng], { icon: customIcon }).addTo(mapInstance);
                marker.bindPopup(`<b>🍽 Restaurant:</b> ${r.name}<br/>Cuisine: ${r.cuisine || "Local"}`);
                allBoundsLatLngs.push([r.lat, r.lng]);
              }
            });
          }

          // 4. Plot Scheduled Itinerary Activities with Numbered Badges & Route Polylines
          const routeLatLngs: [number, number][] = [[centerLat, centerLng]];

          if (layers.attractions) {
            searchFilteredItinerary.forEach(({ item, act, seqNum }) => {
              const isSelected = selectedActivityId === act.id;
              const isDisrupted = item.disrupted || act.unavailable;

              const iconHtml = createCustomMarkerHtml(
                act.category || "attraction",
                act.name,
                seqNum,
                isDisrupted,
                isSelected
              );

              const customIcon = L.divIcon({
                html: iconHtml,
                className: "custom-leaflet-marker",
                iconSize: [140, 40],
                iconAnchor: [70, 40],
              });

              const marker = L.marker([act.lat, act.lng], { icon: customIcon }).addTo(mapInstance);

              marker.on("click", () => {
                setSelectedActivityId(act.id);
                const el = itineraryRefs.current[act.id];
                if (el) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
              });

              marker.bindPopup(`
                <div style="font-family: system-ui; font-size: 12px; min-width: 180px;">
                  <div style="font-weight: 800; color: #2563eb; margin-bottom: 2px;">
                    Day ${item.day} • Stop #${seqNum}
                  </div>
                  <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 4px;">
                    ${act.name}
                  </div>
                  <div style="color: #64748b; font-size: 11px;">
                    🕒 ${item.startTime} - ${item.endTime}<br/>
                    💰 Estimated Cost: ₹${item.estimatedCost}<br/>
                    🏷 Category: ${act.category || "Attraction"}
                  </div>
                </div>
              `);

              routeLatLngs.push([act.lat, act.lng]);
              allBoundsLatLngs.push([act.lat, act.lng]);
            });
          }

          // 5. Draw Transit Route Polylines & Tooltips
          if (layers.routes && routeLatLngs.length > 1) {
            // Draw Main Route Line
            const mainLine = L.polyline(routeLatLngs, {
              color: showDiffMode ? "#3b82f6" : "#2563eb",
              weight: 4,
              opacity: 0.85,
              smoothFactor: 1,
            }).addTo(mapInstance);

            // Draw Diff / Disrupted Before Line if diff mode active
            if (showDiffMode) {
              const diffLatLngs = [...routeLatLngs].reverse();
              L.polyline(diffLatLngs, {
                color: "#ef4444",
                weight: 3,
                dashArray: "6, 8",
                opacity: 0.7,
              }).addTo(mapInstance);
            }

            // Draw transit segment time labels
            for (let i = 0; i < routeLatLngs.length - 1; i++) {
              const p1 = routeLatLngs[i];
              const p2 = routeLatLngs[i + 1];
              const dist = getDistanceKm(p1[0], p1[1], p2[0], p2[1]);
              const transit = formatTransitInfo(dist);

              const midLat = (p1[0] + p2[0]) / 2;
              const midLng = (p1[1] + p2[1]) / 2;

              const labelIcon = L.divIcon({
                html: `<div style="
                  background: #090d16;
                  border: 1px solid #3b82f680;
                  color: #93c5fd;
                  font-weight: 700;
                  font-size: 10px;
                  padding: 2px 6px;
                  border-radius: 9999px;
                  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);
                  white-space: nowrap;
                ">${transit.text}</div>`,
                className: "transit-label-marker",
                iconSize: [80, 20],
                iconAnchor: [40, 10],
              });

              L.marker([midLat, midLng], { icon: labelIcon, interactive: false }).addTo(mapInstance);
            }
          }

          // Fit map bounds
          if (allBoundsLatLngs.length > 0) {
            mapInstance.fitBounds(L.latLngBounds(allBoundsLatLngs), { padding: [60, 60] });
          }
        } else {
          setMapError(true);
        }
      };

      if ((window as any).L) {
        renderMap();
      } else {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => renderMap();
        script.onerror = () => setMapError(true);
        document.head.appendChild(script);
      }
    } catch (e) {
      console.warn("Leaflet error:", e);
      setMapError(true);
    }
  }, [trip, activeDay, layers, showDiffMode, searchQuery, searchFilteredItinerary]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-2xl font-black text-white">
            <Navigation className="w-6 h-6 text-blue-400" />
            Interactive AI Map & Journey Optimizer
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial sequence, custom category badges, live transit route estimates, and AI disruption overlay.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Trip Mode Toggle */}
          <button
            onClick={() => setIsLiveTrip(!isLiveTrip)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-extrabold text-xs transition-all shadow-md ${
              isLiveTrip
                ? "bg-red-600 text-white shadow-red-500/30 animate-pulse"
                : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
            }`}
          >
            <Radio className="w-4 h-4 text-red-400" />
            {isLiveTrip ? "🔴 Live Trip Navigation Active" : "Start Live Trip Mode"}
          </button>
          <ProvenanceBadge type="verified" label="VERIFIED MAP DATA" />
        </div>
      </div>

      {/* Control Bar: Day Filter + Search + Layer Toggles */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Day Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-mono font-bold mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-blue-400" /> DAY:
          </span>
          <button
            onClick={() => setActiveDay(0)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeDay === 0
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All Days
          </button>
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            return (
              <button
                key={dayNum}
                onClick={() => setActiveDay(dayNum)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  activeDay === dayNum
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Day {dayNum}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stops on map..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
          />
        </div>

        {/* Layer Visibility Toggles */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
          <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" /> Layers:
          </span>
          <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.attractions}
              onChange={(e) => setLayers({ ...layers, attractions: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
            />
            Attractions
          </label>
          <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.hotels}
              onChange={(e) => setLayers({ ...layers, hotels: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0"
            />
            Hotels
          </label>
          <label className="flex items-center gap-1 text-[11px] text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={layers.restaurants}
              onChange={(e) => setLayers({ ...layers, restaurants: e.target.checked })}
              className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0"
            />
            Dining
          </label>
        </div>
      </div>

      {/* Main Split-Screen Section (65% Map Canvas / 35% Synced Itinerary Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Interactive Map (65% width on desktop) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative min-h-[580px]">
          {/* Leaflet Map Div */}
          <div ref={mapContainerRef} className="w-full h-[620px] z-10" />

          {/* Floating AI Map Overlay */}
          <AiMapOverlay isLiveTrip={isLiveTrip} />

          {/* Floating Route Diff & Optimizer Controls */}
          <RouteDiffOverlay
            showDiffMode={showDiffMode}
            setShowDiffMode={setShowDiffMode}
            onOptimizeRoute={handleOptimizeRoute}
            isOptimizing={isOptimizing}
          />

          {/* Custom Stop Modal Prompt */}
          {addStopPrompt && (
            <div className="absolute inset-0 z-[2000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-3 shadow-2xl text-slate-100">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="font-bold text-sm flex items-center gap-2 text-blue-400 font-mono">
                    <Plus className="w-4 h-4" /> Add Custom Stop at Location
                  </h3>
                  <button onClick={() => setAddStopPrompt(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <p className="text-xs text-slate-400">
                  Coordinates: {addStopPrompt.lat.toFixed(4)}, {addStopPrompt.lng.toFixed(4)}
                </p>
                <form onSubmit={handleAddCustomStopSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300">Stop Name</label>
                    <input
                      type="text"
                      required
                      value={customStopName}
                      onChange={(e) => setCustomStopName(e.target.value)}
                      placeholder="e.g. Scenic Tea Gardens Viewpoint"
                      className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAddStopPrompt(null)}
                      className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20"
                    >
                      Add to Day {activeDay === 0 ? 1 : activeDay}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Fallback SVG Plot if Leaflet fails */}
          {mapError && (
            <div className="p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[580px]">
              <div className="text-amber-400 text-xs font-mono font-bold mb-2">
                ⚠️ Leaflet CDN fallback active - rendering vector SVG route
              </div>
              <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-96 bg-slate-900 rounded-2xl border border-slate-800">
                {searchFilteredItinerary.map(({ item, act, seqNum }, idx) => (
                  <g key={idx}>
                    <circle cx={50 + idx * 70} cy={150 + (idx % 2) * 50} r="12" fill="#2563eb" />
                    <text x={50 + idx * 70} y={154} fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {seqNum}
                    </text>
                    <text x={50 + idx * 70} y={180 + (idx % 2) * 50} fill="#94a3b8" fontSize="9" textAnchor="middle">
                      {act.name}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Synced Itinerary Panel (35% width on desktop) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col h-[620px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <h3 className="font-bold text-sm text-white font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-400" />
                Day {activeDay === 0 ? "All" : activeDay} Itinerary Sequence
              </h3>
              <p className="text-[10px] text-slate-400">{searchFilteredItinerary.length} stops scheduled</p>
            </div>
            <button
              onClick={handleOptimizeRoute}
              className="text-[10px] px-2 py-1 bg-blue-950 border border-blue-800 text-blue-400 rounded-lg font-mono font-bold hover:bg-blue-900"
            >
              ⚡ Re-sequence
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {searchFilteredItinerary.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No scheduled stops found for Day {activeDay}. Try selecting "All Days" or changing your search query.
              </div>
            ) : (
              searchFilteredItinerary.map(({ item, act, seqNum }, idx) => {
                const isSelected = selectedActivityId === act.id;
                const nextItem = searchFilteredItinerary[idx + 1];
                const transitToNext = nextItem
                  ? formatTransitInfo(getDistanceKm(act.lat, act.lng, nextItem.act.lat, nextItem.act.lng))
                  : null;

                return (
                  <React.Fragment key={act.id}>
                    <div
                      ref={(el) => (itineraryRefs.current[act.id] = el)}
                      onClick={() => handleItemClick(act.id, act.lat, act.lng)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? "bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10"
                          : "bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-extrabold font-mono text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                            {seqNum}
                          </span>
                          <div>
                            <div className="font-bold text-xs text-white leading-tight flex items-center gap-1.5">
                              {act.name}
                              {item.locked && <Lock className="w-3 h-3 text-amber-400 inline" />}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                              <span>🕒 {item.startTime} - {item.endTime}</span>
                              <span>•</span>
                              <span>₹{item.estimatedCost}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLockItem(act.id);
                          }}
                          className="text-slate-500 hover:text-amber-400 p-1"
                          title={item.locked ? "Unlock item" : "Lock item position"}
                        >
                          {item.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                          {act.category || "Attraction"}
                        </span>
                        <span className="text-blue-400 font-bold group-hover:underline flex items-center gap-0.5">
                          Center on Map <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>

                    {/* Transit Connector between items */}
                    {transitToNext && (
                      <div className="my-1 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono py-0.5">
                        <div className="h-4 border-l border-dashed border-slate-700" />
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-blue-300 shadow-sm">
                          {transitToNext.text}
                        </span>
                        <div className="h-4 border-l border-dashed border-slate-700" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
