import React, { useEffect, useRef, useState } from "react";
import { useTripStore } from "../../store/useTripStore";
import { MapPin, Navigation, Info } from "lucide-react";

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

  useEffect(() => {
    // Attempt Leaflet Map initialization
    let mapInstance: any = null;

    try {
      if (typeof window !== "undefined" && (window as any).L && mapContainerRef.current) {
        const L = (window as any).L;
        const centerLat = trip.startingPoint.lat;
        const centerLng = trip.startingPoint.lng;

        mapInstance = L.map(mapContainerRef.current).setView([centerLat, centerLng], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        }).addTo(mapInstance);

        // Add Starting Point Marker
        L.marker([centerLat, centerLng])
          .addTo(mapInstance)
          .bindPopup(`<b>Starting Point:</b> ${trip.startingPoint.name}`);

        // Add Activity Markers
        const latLngs: [number, number][] = [[centerLat, centerLng]];

        itineraryActivities.forEach(({ item, act }) => {
          const marker = L.circleMarker([act.lat, act.lng], {
            radius: 8,
            color: "#3b82f6",
            fillColor: "#2563eb",
            fillOpacity: 0.9,
          }).addTo(mapInstance);

          marker.bindPopup(`<b>Day ${item.day}:</b> ${act.name}<br/><i>${item.startTime} - ${item.endTime}</i>`);
          latLngs.push([act.lat, act.lng]);
        });

        // Add Polyline Route
        if (latLngs.length > 1) {
          L.polyline(latLngs, { color: "#3b82f6", weight: 3, dashArray: "5, 5" }).addTo(mapInstance);
        }
      } else {
        setMapError(true);
      }
    } catch (e) {
      console.warn("Leaflet map load warning, falling back to SVG plot:", e);
      setMapError(true);
    }

    return () => {
      if (mapInstance) mapInstance.remove();
    };
  }, [trip]);

  // Compute SVG plot bounds for offline fallback
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
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-400" />
            Geographic Route & Activity Plot
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Clustered by day to minimize intra-day travel distance.
          </p>
        </div>
        <div className="text-xs text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800 font-mono">
          {trip.destination} Coordinates Plot
        </div>
      </div>

      {/* Main Map Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl min-h-[450px] relative">
        {!mapError ? (
          <div ref={mapContainerRef} className="w-full h-[480px] z-10" />
        ) : (
          /* Offline SVG Fallback Plot */
          <div className="p-6 bg-slate-950 flex flex-col items-center justify-center min-h-[480px]">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 px-3 py-1 rounded-full mb-4">
              <Info className="w-3.5 h-3.5" /> Demo / Offline Fallback SVG Map Plot
            </div>

            <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-80 bg-slate-900 rounded-2xl border border-slate-800">
              {/* Draw Route Polyline */}
              <polyline
                points={itineraryActivities
                  .reduce(
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

              {/* Start Point */}
              <circle cx={startSvg.x} cy={startSvg.y} r="8" fill="#ef4444" />
              <text x={startSvg.x + 12} y={startSvg.y + 4} fill="#f87171" fontSize="10" fontWeight="bold">
                START: {trip.startingPoint.name}
              </text>

              {/* Activity Dots */}
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
