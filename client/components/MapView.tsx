'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Custom Map Pin
const customIcon = L.divIcon({
  className: 'custom-pin',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
      <div class="absolute inset-0 border-2 border-green-400/30 rounded-full animate-pulse"></div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface MapViewProps {
  lat: number;
  lng: number;
}

export default function MapView({ lat, lng }: MapViewProps) {
  return (
    <MapContainer 
      center={[lat, lng]} 
      zoom={14} 
      style={{ height: '100%', width: '100%', zIndex: 10 }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[lat, lng]} icon={customIcon} />
      <MapUpdater center={[lat, lng]} />
    </MapContainer>
  );
}
