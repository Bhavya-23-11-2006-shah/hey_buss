import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import { setWorkerUrl } from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { BusPosition, Stop } from '../types';
import { MOCK_STOPS } from '../api/client';

setWorkerUrl(maplibreWorkerUrl);

const OPENFREEMAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

function createBusIcon() {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `<div style="background-color: #FFB800; color: #0B1330; border: 2px solid #0B1330; border-radius: 8px; padding: 3px; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; box-shadow: 0 4px 8px rgba(0,0,0,0.25);">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
        <rect x="2" y="6" width="20" height="13" rx="2"></rect>
        <path d="M2 12h20"></path>
        <circle cx="6.5" cy="21" r="1.5"></circle>
        <circle cx="17.5" cy="21" r="1.5"></circle>
      </svg>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [stops[0]?.lat ?? 22.5657, stops[0]?.lng ?? 88.3433],
        zoom: 14,
        zoomControl: false,
      });

      maplibreGL({ style: OPENFREEMAP_STYLE }).addTo(map);

      // Add Stop Markers with custom clean badges
      stops.forEach((stop, index) => {
        const isFirst = index === 0;
        const stopIcon = L.divIcon({
          className: 'custom-stop-marker',
          html: `<div style="background-color: ${isFirst ? '#1238C9' : '#0B1330'}; color: #FFFFFF; border: 2px solid #FFFFFF; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; font-family: 'Atkinson Hyperlegible', sans-serif; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${index + 1}</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([stop.lat, stop.lng], { icon: stopIcon })
          .addTo(map)
          .bindPopup(`<b>${stop.name}</b><br/><small>${stop.note}</small>`);
      });

      if (stops.length > 1) {
        const stopBounds = L.latLngBounds(
          stops.map((stop) => [stop.lat, stop.lng] as [number, number])
        );
        map.fitBounds(stopBounds, { padding: [28, 28], maxZoom: 14 });
      }
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        busMarkerRef.current = null;
      }
    };
  }, [stops]);

  // Update bus position dynamically
  useEffect(() => {
    if (!busPosition || !mapInstanceRef.current) return;

    const newLatLng: L.LatLngExpression = [busPosition.lat, busPosition.lng];
    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng(newLatLng);
    } else {
      busMarkerRef.current = L.marker(newLatLng, { icon: createBusIcon() })
        .addTo(mapInstanceRef.current);
    }
    mapInstanceRef.current.panTo(newLatLng, { animate: true });
  }, [busPosition]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-64 sm:h-80 rounded-card overflow-hidden bg-neutral-100"
      aria-label="Live interactive bus tracking map"
    />
  );
};

export default TrackingMap;
