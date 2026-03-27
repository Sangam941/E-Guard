'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation2, Loader } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface LocationPoint {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
}

interface LiveMapProps {
  socket?: Socket | null;
  sosSessionId?: string | null;
  isTracking?: boolean;
  currentLocation?: LocationPoint | null;
  showPath?: boolean;
  zoomLevel?: number;
}

export default function LiveMap({
  socket,
  sosSessionId,
  isTracking = false,
  currentLocation,
  showPath = true,
  zoomLevel = 13
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mapZoom, setMapZoom] = useState(zoomLevel);
  const [mapState, setMapState] = useState({
    lat: currentLocation?.lat || 40.7128,
    lng: currentLocation?.lng || -74.0060
  });

  // Listen for location updates from Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleLocationUpdate = (data: any) => {
      console.log('Live location update:', data);
      const newLocation: LocationPoint = {
        lat: data.location.lat,
        lng: data.location.lng,
        accuracy: data.location.accuracy,
        timestamp: new Date(data.timestamp)
      };

      setLocations(prev => [...prev, newLocation]);
      setMapState({
        lat: newLocation.lat,
        lng: newLocation.lng
      });
    };

    socket.on('sos:location_update', handleLocationUpdate);

    return () => {
      socket.off('sos:location_update', handleLocationUpdate);
    };
  }, [socket]);

  // Calculate map URL (using Google Static Maps or similar)
  const getMapUrl = () => {
    const width = 600;
    const height = 400;
    const center = mapState.lat && mapState.lng ? mapState : (currentLocation || { lat: 40.7128, lng: -74.0060 });
    
    // Using a generic map URL - replace with your actual map service
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=${mapZoom}&size=${width}x${height}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
  };

  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 5));
  };

  const getPathDistance = () => {
    if (locations.length < 2) return 0;
    
    let distance = 0;
    for (let i = 1; i < locations.length; i++) {
      const lat1 = locations[i - 1].lat;
      const lon1 = locations[i - 1].lng;
      const lat2 = locations[i].lat;
      const lon2 = locations[i].lng;

      // Haversine formula
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance += R * c;
    }
    return distance.toFixed(2);
  };

  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="relative h-96 bg-gradient-to-b from-gray-800 to-gray-900">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader size={32} className="text-green-400 animate-spin" />
              <span className="text-white text-sm">Loading map...</span>
            </div>
          </div>
        )}

        {/* Map Grid Background */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 40% 40%, #22c55e 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>

        {/* Map SVG Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="#666" strokeWidth="1" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="#666" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="80" fill="none" stroke="#666" strokeWidth="1" opacity="0.3" />
          <circle cx="50%" cy="50%" r="120" fill="none" stroke="#666" strokeWidth="1" opacity="0.2" />
        </svg>

        {/* Location Marker (Center) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {isTracking && (
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" style={{
                width: '80px',
                height: '80px',
                marginTop: '-40px',
                marginLeft: '-40px'
              }}></div>
            )}
            <MapPin
              size={32}
              className={`text-${isTracking ? 'green' : 'yellow'}-400`}
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Marker Info */}
        {currentLocation && (
          <div className="absolute top-4 left-4 bg-gray-800/90 border border-gray-700 rounded px-3 py-2 text-xs text-gray-300 max-w-[200px]">
            <div className="font-semibold text-green-400 mb-1">Current Location</div>
            <div>Lat: {currentLocation.lat.toFixed(4)}°</div>
            <div>Lng: {currentLocation.lng.toFixed(4)}°</div>
            <div>Accuracy: ±{Math.round(currentLocation.accuracy)}m</div>
          </div>
        )}

        {/* Distance Marker */}
        <div className="absolute top-12 left-1/3 bg-yellow-500 text-black px-3 py-1 rounded text-xs font-bold">
          Distance: {getPathDistance()} km
        </div>

        {/* Zoom Controls */}
        <div className="absolute right-6 bottom-6 flex flex-col gap-2 z-20">
          <button
            onClick={handleZoomIn}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center justify-center transition-colors font-bold text-xl text-white"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center justify-center transition-colors font-bold text-xl text-white"
          >
            −
          </button>
        </div>

        {/* Zoom Level Display */}
        <div className="absolute top-4 right-4 z-20 bg-gray-800/80 border border-gray-700 rounded px-3 py-1 text-xs text-gray-400">
          Zoom: {mapZoom}x
        </div>

        {/* Tracking Status */}
        {isTracking && (
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded px-3 py-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-xs font-semibold">LIVE TRACKING</span>
          </div>
        )}

        {/* Path Display Count */}
        {showPath && locations.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-gray-800/80 border border-gray-700 rounded px-3 py-1 text-xs text-gray-400">
            Waypoints: {locations.length}
          </div>
        )}
      </div>

      {/* Map Information Panel */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Session ID:</span>
            <p className="text-green-400 font-mono text-xs mt-1 truncate">{sosSessionId || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <p className={`text-xs mt-1 font-semibold ${isTracking ? 'text-green-400' : 'text-gray-400'}`}>
              {isTracking ? '🟢 ACTIVE' : '⚪ INACTIVE'}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Distance Traveled:</span>
            <p className="text-yellow-400 font-semibold text-sm mt-1">{getPathDistance()} km</p>
          </div>
          <div>
            <span className="text-gray-400">Location Points:</span>
            <p className="text-blue-400 font-semibold text-sm mt-1">{locations.length}</p>
          </div>
        </div>

        {currentLocation && (
          <div className="pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Navigation2 size={14} className="text-green-400" />
              <span className="text-gray-400 text-xs">Current Coordinates:</span>
            </div>
            <p className="text-green-400 font-mono text-xs ml-6">
              {currentLocation.lat.toFixed(6)}° N, {Math.abs(currentLocation.lng).toFixed(6)}° W
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
