'use client';

import { useEffect, useState, useCallback } from 'react';
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

// Sample data - would come from API in real app
const sampleHospitals: Hospital[] = [
  {
    id: '1',
    name: 'Apollo Institute of Medical Science & Research',
    position: [17.4123, 78.4092], // Hyderabad coordinates
    specialties: ['Ophthalmology', 'ENT', 'General Surgery'],
    address: 'Apollo Health City Campus, Jubilee Hills, Hyderabad-500096'
  },
  {
    id: '2',
    name: 'Narayana Hrudayalaya',
    position: [17.4254, 78.4356],
    specialties: ['Cardiology', 'Cardiac Surgery', 'Pediatric Cardiology'],
    address: 'Narayana Health City, Hyderabad'
  },
  {
    id: '3',
    name: 'KIMS Hospital',
    position: [17.4073, 78.4477],
    specialties: ['Neurology', 'Orthopedics', 'General Medicine'],
    address: 'KIMS Hospitals, Secunderabad, Hyderabad'
  },
];

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

export function MapComponent({
  userCoords,
  searchRadius = 3000, // 3km default radius (changed from 5km)
  selectedSymptoms = [],
}: {
  userCoords?: [number, number];
  searchRadius?: number;
  selectedSymptoms?: string[];
}) {
  // Default to Hyderabad if no user coordinates
  const [coords, setCoords] = useState<[number, number] | null>(userCoords || [17.4123, 78.4092]);
  const [hospitals, setHospitals] = useState<Hospital[]>(sampleHospitals);
  const [filteredHospitals, setFilteredHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get user location if not provided
  useEffect(() => {
    if (!userCoords && navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setCoords(userLocation);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        }
      );
    } else if (userCoords) {
      setCoords(userCoords);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [userCoords]);

  // Calculate distance between two coordinates in meters
  const calculateDistance = useCallback((point1: [number, number], point2: [number, number]): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1[0] * Math.PI) / 180;
    const φ2 = (point2[0] * Math.PI) / 180;
    const Δφ = ((point2[0] - point1[0]) * Math.PI) / 180;
    const Δλ = ((point2[1] - point1[1]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }, []);

  // Filter hospitals based on user location, search radius, and selected symptoms/specialties
  useEffect(() => {
    if (!coords) return;

    // In a real app, we would fetch hospitals from an API based on location and specialties
    // For now, we'll filter our sample data
    const filtered = hospitals
      .map(hospital => ({
        ...hospital,
        distance: calculateDistance(coords, hospital.position)
      }))
      .filter(hospital => {
        // Filter by distance
        const withinRadius = hospital.distance !== undefined && hospital.distance <= searchRadius;
        
        // Filter by specialties if symptoms are selected
        let matchesSymptoms = true;
        if (selectedSymptoms.length > 0) {
          // This is a simplified matching logic
          // In a real app, you would use a more sophisticated matching algorithm
          // that maps symptoms to relevant medical specialties
          
          // For example, if user selected "Headache", we might look for hospitals with "Neurology"
          // For this demo, we'll do a simple check if any specialty might be relevant
          const relevantSpecialties = getRelevantSpecialties(selectedSymptoms);
          matchesSymptoms = hospital.specialties.some(specialty => 
            relevantSpecialties.includes(specialty)
          );
        }
        
        return withinRadius && matchesSymptoms;
      })
      .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

    setFilteredHospitals(filtered);
  }, [coords, hospitals, searchRadius, selectedSymptoms, calculateDistance]);

  // Simple function to map symptoms to relevant specialties
  // In a real app, this would be more sophisticated and possibly use an API
  const getRelevantSpecialties = (symptoms: string[]): string[] => {
    const specialtyMap: Record<string, string[]> = {
      'Headache': ['Neurology'],
      'Dizziness': ['Neurology', 'ENT'],
      'Chest Pain': ['Cardiology', 'General Medicine'],
      'Shortness of Breath': ['Pulmonology', 'Cardiology'],
      'Abdominal Pain': ['Gastroenterology', 'General Surgery'],
      'Joint Pain': ['Orthopedics', 'Rheumatology'],
      'Blurred Vision': ['Ophthalmology'],
      'Ear Pain': ['ENT'],
      'Sore Throat': ['ENT', 'General Medicine'],
      'Fever': ['General Medicine', 'Infectious Disease'],
      'Cough': ['Pulmonology', 'ENT', 'General Medicine'],
      'Rash': ['Dermatology', 'Allergy and Immunology'],
      'Back Pain': ['Orthopedics', 'Neurology', 'Physical Therapy'],
      'Nausea': ['Gastroenterology', 'General Medicine'],
      'Fatigue': ['General Medicine', 'Endocrinology'],
    };
    
    const relevantSpecialties = new Set<string>();
    
    symptoms.forEach(symptom => {
      const specialties = specialtyMap[symptom] || ['General Medicine'];
      specialties.forEach(specialty => relevantSpecialties.add(specialty));
    });
    
    return Array.from(relevantSpecialties);
  };

  if (isLoading) {
    return (
      <Card className="w-full h-full overflow-hidden border-0 shadow-none">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Detecting your location...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!coords) {
    return (
      <Card className="w-full h-full overflow-hidden border-0 shadow-none">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center">
            <p className="mb-4">Unable to detect your location</p>
            <Button 
              onClick={() => {
                if (navigator.geolocation) {
                  setIsLoading(true);
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setCoords([position.coords.latitude, position.coords.longitude]);
                      setIsLoading(false);
                    },
                    (error) => {
                      console.error('Error getting location:', error);
                      setIsLoading(false);
                    }
                  );
                }
              }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full overflow-hidden border-0 shadow-none">
      <CardContent className="p-0 h-full">
        <MapContainer
          center={coords}
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