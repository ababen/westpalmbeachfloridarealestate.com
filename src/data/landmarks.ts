// Points of interest used for straight-line distances on condo building pages.
// Coordinates from OpenStreetMap (geocoded October 2026).
export interface Landmark {
  name: string;
  lat: number;
  lng: number;
}

export const landmarks: Landmark[] = [
  { name: 'Clematis Street waterfront', lat: 26.71057, lng: -80.05055 },
  { name: 'Rosemary Square', lat: 26.70716, lng: -80.05707 },
  { name: 'Brightline station', lat: 26.712, lng: -80.05554 },
  { name: 'Kravis Center', lat: 26.7069, lng: -80.06007 },
  { name: 'Norton Museum of Art', lat: 26.70079, lng: -80.05384 },
  { name: 'PBI airport', lat: 26.68569, lng: -80.09289 },
];

/** Great-circle distance in miles. */
export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}
