'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, MapPin, Navigation } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dynamically import Leaflet components with no SSR
const MapComponents = dynamic(
  () => import('./map-components'),
  { ssr: false }
);

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

// Enum for location detection status
enum LocationStatus {
  INITIAL = 'initial',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
  PERMISSION_DENIED = 'permission_denied',
  TIMEOUT = 'timeout',
  UNAVAILABLE = 'unavailable',
}

// Function to get location from IP address
async function getLocationFromIP(): Promise<[number, number] | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    if (data.latitude && data.longitude) {
      return [data.latitude, data.longitude];
    }
    return null;
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return null;
  }
}

// Fallback to IP geolocation when browser geolocation fails
const fallbackToIPGeolocation = async (): Promise<[number, number] | null> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    if (data.latitude && data.longitude) {
      return [data.latitude, data.longitude];
    }
    return null;
  } catch (error) {
    console.error('IP geolocation failed:', error);
    return null;
  }
};

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
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(LocationStatus.INITIAL);
  const [locationError, setLocationError] = useState<string>('');
  const [manualLocation, setManualLocation] = useState<{address: string, isSearching: boolean}>({
    address: '',
    isSearching: false
  });
  const [highAccuracy, setHighAccuracy] = useState<boolean>(true);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState<boolean>(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  
  // Get user location if not provided
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    if (userCoords) {
      setCoords(userCoords);
      setLocationStatus(LocationStatus.SUCCESS);
      return;
    }
    
    const detectLocation = async () => {
      if (!navigator.geolocation) {
        setLocationStatus(LocationStatus.UNAVAILABLE);
        setLocationError('Geolocation is not supported by your browser');
        // Try IP-based fallback
        const ipLocation = await fallbackToIPGeolocation();
        if (ipLocation) {
          setCoords(ipLocation);
          setLocationStatus(LocationStatus.SUCCESS);
        }
        return;
      }
      
      setLocationStatus(LocationStatus.LOADING);
      
      // Progressive Enhancement: Try high accuracy first with short timeout
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
          setCoords(userLocation);
          setLocationStatus(LocationStatus.SUCCESS);
        },
        () => {
          // If high accuracy fails or times out, try with lower accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation: [number, number] = [position.coords.latitude, position.coords.longitude];
              setCoords(userLocation);
              setLocationStatus(LocationStatus.SUCCESS);
            },
            async (finalError) => {
              console.error('Error getting location with lower accuracy:', finalError);
              handleLocationError(finalError);
              
              // Try IP-based fallback
              const ipLocation = await fallbackToIPGeolocation();
              if (ipLocation) {
                setCoords(ipLocation);
                setLocationStatus(LocationStatus.SUCCESS);
              }
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 }
          );
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    };
    
    detectLocation();
  }, [userCoords]);
  
  // Handle geolocation errors
  const handleLocationError = (error: GeolocationPositionError) => {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        setLocationStatus(LocationStatus.PERMISSION_DENIED);
        setLocationError('You denied the request for geolocation. Please enable location services in your browser settings.');
        setLocationPermissionDenied(true); // Set permission denied flag for enhanced UI guidance
        break;
      case error.POSITION_UNAVAILABLE:
        setLocationStatus(LocationStatus.UNAVAILABLE);
        setLocationError('Location information is unavailable. Please try again or enter your location manually.');
        break;
      case error.TIMEOUT:
        setLocationStatus(LocationStatus.TIMEOUT);
        setLocationError('The request to get your location timed out. Please try again or enter your location manually.');
        break;
      default:
        setLocationStatus(LocationStatus.ERROR);
        setLocationError('An unknown error occurred while trying to get your location.');
        break;
    }
  };
  
  // Handle manual location search
  const handleManualLocationSearch = async () => {
    if (!manualLocation.address.trim()) return;
    
    setManualLocation(prev => ({ ...prev, isSearching: true }));
    try {
      // Using Nominatim OpenStreetMap API for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation.address)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setCoords(location);
        setLocationStatus(LocationStatus.SUCCESS);
      } else {
        setLocationError('Could not find the location. Please try a different address.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setLocationError('Error searching for location. Please try again.');
    } finally {
      setManualLocation(prev => ({ ...prev, isSearching: false }));
    }
  };
  
  // Handle manual location input for autocomplete suggestions
  const handleManualLocationInput = (value: string) => {
    setManualLocation(prev => ({ ...prev, address: value }));
  };
  
  // Handle city selection from dropdown
  const handleCitySelection = (city: string, coordinates: [number, number]) => {
    setSelectedCity(city);
    setCoords(coordinates);
    setLocationStatus(LocationStatus.SUCCESS);
  };

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

  // Render loading state
  if (locationStatus === LocationStatus.LOADING) {
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

  // Render error state with fallback options
  if (locationStatus !== LocationStatus.SUCCESS && !coords) {
    return (
      <Card className="w-full h-full overflow-hidden border-0 shadow-none">
        <CardContent className="p-4 h-full flex flex-col items-center justify-center">
          <div className="text-center max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Location Error</AlertTitle>
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              {/* Manual location input */}
              <div className="space-y-2">
                <h3 className="font-medium">Enter your location manually</h3>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Enter your city or postal code" 
                    value={manualLocation.address}
                    onChange={(e) => handleManualLocationInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleManualLocationSearch()}
                  />
                  <Button 
                    onClick={handleManualLocationSearch}
                    disabled={manualLocation.isSearching || !manualLocation.address.trim()}
                  >
                    {manualLocation.isSearching ? (
                      <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full mr-2"></div>
                    ) : (
                      <MapPin className="h-4 w-4 mr-2" />
                    )}
                    Search
                  </Button>
                </div>
              </div>
              
              {/* Major cities dropdown */}
              <div className="space-y-2">
                <h3 className="font-medium">Or select a major city</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Hyderabad', coords: [17.4123, 78.4092] },
                    { name: 'Mumbai', coords: [19.0760, 72.8777] },
                    { name: 'Delhi', coords: [28.6139, 77.2090] },
                    { name: 'Bangalore', coords: [12.9716, 77.5946] }
                  ].map(city => (
                    <Button 
                      key={city.name}
                      variant="outline"
                      className={selectedCity === city.name ? 'bg-blue-100' : ''}
                      onClick={() => handleCitySelection(city.name, city.coords as [number, number])}
                    >
                      {city.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Try again with browser geolocation */}
              <div className="space-y-2">
                <h3 className="font-medium">Try browser geolocation again</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setLocationStatus(LocationStatus.INITIAL);
                    }}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Try with High Accuracy
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setLocationStatus(LocationStatus.INITIAL);
                    }}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Try with Low Accuracy
                  </Button>
                </div>
              </div>
              
              {/* Location permission guidance */}
              {locationPermissionDenied && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Location Permission Denied</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">To enable location services:</p>
                    <ol className="list-decimal pl-5 space-y-1 text-sm">
                      <li>Click the lock/info icon in your browser's address bar</li>
                      <li>Find "Location" or "Site settings"</li>
                      <li>Change the permission to "Allow"</li>
                      <li>Refresh this page</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Use default location */}
              <div className="space-y-2">
                <h3 className="font-medium">Or use a default location</h3>
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setCoords([17.4123, 78.4092]); // Hyderabad
                    setLocationStatus(LocationStatus.SUCCESS);
                  }}
                >
                  Use Hyderabad as Default
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pass all necessary props to the dynamically loaded map components
  return (
    <MapComponents
      coords={coords}
      filteredHospitals={filteredHospitals}
      selectedHospital={selectedHospital}
      setSelectedHospital={setSelectedHospital}
      searchRadius={searchRadius}
    />
  );
}