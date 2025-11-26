import { useEffect, useRef } from 'react';

interface MapRendererProps {
  data: {
    center: [number, number];
    zoom: number;
    markers?: Array<{ lat: number; lng: number; label: string }>;
  };
  interactionState?: {
    zoom?: number;
    pan?: { x: number; y: number };
    selectedElements?: string[];
  };
}

export default function MapRenderer({ data, interactionState }: MapRendererProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sync interaction state from tutor
    if (interactionState) {
      console.log('Syncing map interaction state:', interactionState);
      // Map library integration will update zoom and pan here
    }
  }, [interactionState]);

  return (
    <div className="w-full h-full relative animate-fade-in">
      <div 
        ref={mapContainerRef} 
        className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center"
      >
        {/* Placeholder for map library (Mapbox, Leaflet, Google Maps) */}
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1">Interactive Map</p>
          <p className="text-xs text-gray-500">
            Center: [{data.center[0].toFixed(4)}, {data.center[1].toFixed(4)}]
          </p>
          <p className="text-xs text-gray-500">Zoom: {data.zoom}</p>
          {data.markers && data.markers.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {data.markers.length} marker{data.markers.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
