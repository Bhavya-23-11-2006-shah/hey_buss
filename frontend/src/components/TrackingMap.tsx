import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { BusPosition, Stop } from '../types';
import { MOCK_STOPS } from '../api/client';

interface TrackingMapProps {
  busPosition: BusPosition | null;
  stops?: Stop[];
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  busPosition,
  stops = MOCK_STOPS,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);

  const initialLat = busPosition?.lat || stops[0].lat;
  const initialLng = busPosition?.lng || stops[0].lng;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // Accessible high-contrast tile layer (CartoDB Positron / OSM)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Add Stop Markers
      stops.forEach((stop, index) => {
        const stopIcon = L.divIcon({
          className: 'custom-stop-marker',
          html: `<div style="background-color: #121212; color: #FFFFFF; border: 2px solid #FFDE00; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 12px; font-family: monospace; box-shadow: 2px 2px 0px rgba(0,0,0,0.4);">${index + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .addTo(map)
          .bindPopup(`<b>${stop.name}</b><br/><small>${stop.note}</small>`);
      });

      // Add Route Line
      const routeCoords = stops.map((s) => [s.lat, s.lng] as [number, number]);
      L.polyline(routeCoords, {
        color: '#121212',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      // Bus marker icon
      const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `<div style="background-color: #FFDE00; color: #121212; border: 3px solid #121212; border-radius: 8px; padding: 4px; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; box-shadow: 3px 3px 0px #121212; font-weight: bold;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22">
            <rect x="3" y="3" width="18" height="15" rx="2"></rect>
            <path d="M3 9h18"></path>
            <path d="M7 14h.01"></path>
            <path d="M17 14h.01"></path>
            <path d="M5 18v3"></path>
            <path d="M19 18v3"></path>
          </svg>
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([initialLat, initialLng], { icon: busIcon }).addTo(map);
      busMarkerRef.current = marker;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update bus position dynamically
  useEffect(() => {
    if (!busPosition || !busMarkerRef.current || !mapInstanceRef.current) return;

    const newLatLng: L.LatLngExpression = [busPosition.lat, busPosition.lng];
    busMarkerRef.current.setLatLng(newLatLng);
    mapInstanceRef.current.panTo(newLatLng, { animate: true });
  }, [busPosition]);

  return (
    <div className="space-y-3">
      {/* Map view container */}
      <div
        ref={mapContainerRef}
        className="w-full h-56 sm:h-64 border-3 border-ink rounded shadow-hard overflow-hidden bg-neutral-100"
        aria-label="Live interactive bus tracking map"
      />

      {/* Accessible Text list of stops */}
      <div className="bg-white border-2 border-ink p-3 rounded text-sm space-y-1">
        <div className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-600 mb-1">
          Route Stops:
        </div>
        <ol className="list-decimal list-inside space-y-1 font-medium">
          {stops.map((stop) => (
            <li key={stop.id} className="text-ink">
              <span className="font-bold">{stop.name}</span>
              <span className="text-neutral-500 text-xs ml-1">({stop.note})</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default TrackingMap;
