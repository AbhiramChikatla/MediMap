'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Fix Leaflet marker icon issue in Next.js
const customIcon = (color: string) => {
  return new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

// Hospital interface
interface Hospital {
  id: string;
  name: string;
  position: [number, number]; // [latitude, longitude]
  specialties: string[];
  address: string;
  distance?: number; // Distance from user in meters
}

// Component to recenter map when user location changes
function SetViewOnUserLocation({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (coords) {
      map.setView(coords, 13);
    }
  }, [coords, map]);
  
  return null;
}

// Component to draw route between two points
function RouteLine({ from, to }: { from: [number, number]; to: [number, number] }) {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const map = useMap();

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        // Using OSRM demo server - in production use a dedicated service
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          // OSRM returns coordinates as [longitude, latitude], we need to swap them for Leaflet
          const coords = data.routes[0].geometry.coordinates.map(
            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
          );
          setRouteCoords(coords);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    if (from && to) {
      fetchRoute();
    }
  }, [from, to]);

  return routeCoords.length > 0 ? (
    <Polyline 
      positions={routeCoords} 
      color="#3B82F6" 
      weight={4} 
      opacity={0.7} 
      dashArray="10, 10"
    />
  ) : null;
}

interface MapComponentsProps {
  coords: [number, number] | null;
  filteredHospitals: Hospital[];
  selectedHospital: Hospital | null;
  setSelectedHospital: (hospital: Hospital | null) => void;
  searchRadius: number;
}

export default function MapComponents({
  coords,
  filteredHospitals,
  selectedHospital,
  setSelectedHospital,
  searchRadius
}: MapComponentsProps) {
  return (
    <Card className="w-full h-full overflow-hidden border-0 shadow-none">
      <CardContent className="p-0 h-full">
        <MapContainer
          center={coords || [17.4123, 78.4092]}
          zoom={13}
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          {coords && (
            <>
              <Marker 
                position={coords} 
                icon={customIcon('#FF4136')}
              >
                <Popup>
                  <div className="text-center">
                    <strong>Your location</strong>
                  </div>
                </Popup>
              </Marker>
              
              {/* Search radius circle */}
              <Circle 
                center={coords} 
                radius={searchRadius} 
                pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1 }}
              />
            </>
          )}
          
          {/* Hospital markers */}
          {filteredHospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={hospital.position}
              icon={customIcon('#0074D9')}
              eventHandlers={{
                click: () => setSelectedHospital(hospital)
              }}
            >
              <Popup>
                <div className="max-w-xs">
                  <h3 className="font-bold text-sm">{hospital.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{hospital.address}</p>
                  {hospital.distance !== undefined && (
                    <p className="text-xs font-medium mt-1">
                      Distance: {(hospital.distance / 1000).toFixed(1)} km
                    </p>
                  )}
                  <div className="mt-2">
                    <p className="text-xs font-semibold">Specialties:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hospital.specialties.map((specialty, index) => (
                        <span 
                          key={index} 
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-3 text-xs py-1" 
                    size="sm"
                    onClick={() => setSelectedHospital(hospital)}
                  >
                    Show Route
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Route line */}
          {coords && selectedHospital && (
            <RouteLine from={coords} to={selectedHospital.position} />
          )}
          
          {/* Update map view when user location changes */}
          <SetViewOnUserLocation coords={coords} />
        </MapContainer>
        
        {/* Hospital info panel */}
        {selectedHospital && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-md mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{selectedHospital.name}</h3>
                <p className="text-sm text-gray-600">{selectedHospital.address}</p>
                {selectedHospital.distance !== undefined && (
                  <p className="text-sm font-medium mt-1">
                    Distance: {(selectedHospital.distance / 1000).toFixed(1)} km
                  </p>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setSelectedHospital(null)}
              >
                ✕
              </Button>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold">Specialties:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedHospital.specialties.map((specialty, index) => (
                  <span 
                    key={index} 
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <Button 
                className="flex-1" 
                size="sm"
                onClick={() => {
                  // In a real app, this would open directions in Google Maps or similar
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${coords[0]},${coords[1]}&destination=${selectedHospital.position[0]},${selectedHospital.position[1]}&travelmode=driving`;
                  window.open(url, '_blank');
                }}
              >
                Get Directions
              </Button>
              <Button 
                className="flex-1" 
                size="sm" 
                variant="outline"
                onClick={() => {
                  // In a real app, this would call a phone number or booking system
                  alert('Booking functionality would be implemented here');
                }}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}