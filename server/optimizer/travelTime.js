/**
 * Travel Time and Distance calculation helper (haversine + detour factor).
 * Output provenance is always 'estimated' (or 'verified' if routing API is active).
 */

export function calculateDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;
  const detourFactor = 1.3; // standard urban road network factor
  return straightKm * detourFactor;
}

export function calculateTravelTimeMin(lat1, lng1, lat2, lng2, mode = "drive") {
  const distKm = calculateDistanceKm(lat1, lng1, lat2, lng2);
  let speedKmH = 25; // default urban drive speed
  if (mode === "walk") speedKmH = 4.5;
  if (mode === "transit") speedKmH = 20;

  const timeMin = Math.max(5, Math.round((distKm / speedKmH) * 60));
  return {
    distanceKm: parseFloat(distKm.toFixed(2)),
    timeMin,
    mode,
    provenance: "estimated",
  };
}
