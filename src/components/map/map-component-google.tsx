'use client';
// important
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

// Dynamic import of MapComponentsGoogle without SSR
const MapComponentsGoogle = dynamic(() => import('./map-components-google'), {
  ssr: false,
});

// Hospital interface
export interface Hospital {
  id: string;
  name: string;
  position: [number, number]; // [latitude, longitude]
  specialties: string[];
  address: string;
  distance?: number; // Distance from user in meters
  placeId?: string; // Google Places ID
  rating?: number; // Google Places rating
  openNow?: boolean; // Whether the hospital is currently open
  phoneNumber?: string; // Hospital phone number
}

// Location status enum
enum LocationStatus {
  LOADING = 'loading',
  ERROR = 'error',
  MANUAL_INPUT = 'manual_input',
  CITY_SELECTION = 'city_selection',
  BROWSER_GEOLOCATION_RETRY = 'browser_geolocation_retry',
  PERMISSION_GUIDANCE = 'permission_guidance',
  DEFAULT_LOCATION = 'default_location',
}

// Route information interface
export interface RouteInfo {
  distance: string;
  duration: string;
  startAddress: string;
  endAddress: string;
  steps: string[];
}

interface MapComponentProps {
  selectedSymptoms: string[];
  searchRadius: number;
  isEmergency?: boolean;
  insuranceProviders?: string[];
  specialties?: string[];
  userCoords?: [number, number];
  routeDirections?: google.maps.DirectionsResult;
}

export default function MapComponent({
  selectedSymptoms,
  searchRadius,
  isEmergency,
  insuranceProviders,
  specialties,
  userCoords: initialUserCoords,
  routeDirections,
}: MapComponentProps) {
  // State for user coordinates
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(LocationStatus.LOADING);
  const [manualLocationInput, setManualLocationInput] = useState<string>('');
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

  // Function to get user's location
  const getUserLocation = useCallback((highAccuracy = true) => {
    // If initialUserCoords is provided, use it directly
    if (initialUserCoords) {
      setCoords(initialUserCoords);
      setLocationStatus(LocationStatus.MANUAL_INPUT);
      return;
    }
    
    setLocationStatus(LocationStatus.LOADING);

    if (!navigator.geolocation) {
      setLocationStatus(LocationStatus.ERROR);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords([position.coords.latitude, position.coords.longitude]);
        setLocationStatus(LocationStatus.MANUAL_INPUT); // Successfully got location, show manual input option
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        // Handle different error cases
        if (error.code === 1) { // Permission denied
          setLocationStatus(LocationStatus.PERMISSION_GUIDANCE);
        } else if (highAccuracy) {
          // If high accuracy failed, try with lower accuracy
          setLocationStatus(LocationStatus.BROWSER_GEOLOCATION_RETRY);
        } else {
          // If both attempts failed, fall back to IP geolocation
          fallbackToIPGeolocation();
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Function to search for a location using Google Maps Geocoding API
  const searchLocation = useCallback(async () => {
    if (!manualLocationInput.trim()) return;

    setIsSearchingLocation(true);

    try {
      // Use Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          manualLocationInput
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        setCoords([location.lat, location.lng]);
        setLocationStatus(LocationStatus.MANUAL_INPUT);
      } else {
        console.error('Geocoding failed:', data.status);
        setLocationStatus(LocationStatus.ERROR);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setLocationStatus(LocationStatus.ERROR);
    } finally {
      setIsSearchingLocation(false);
    }
  }, [manualLocationInput]);

  // Function to calculate distance between two points using Haversine formula


  // Function to handle finding a route
  const handleFindRoute = useCallback(async (source: string, destination: string, useCurrentLocation: boolean) => {
    setIsLoadingRoute(true);
    setRouteInfo(null);

    try {
      let originCoords: { lat: number; lng: number };
      let destinationCoords: { lat: number; lng: number };

      // If using current location as source
      if (useCurrentLocation && coords) {
        originCoords = { lat: coords[0], lng: coords[1] };
      } else {
        // Geocode source address
        const sourceResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            source
          )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const sourceData = await sourceResponse.json();

        if (sourceData.status !== 'OK' || !sourceData.results || sourceData.results.length === 0) {
          throw new Error('Could not geocode source address');
        }

        originCoords = sourceData.results[0].geometry.location;
      }

      // Geocode destination address
      const destResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          destination
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const destData = await destResponse.json();

      if (destData.status !== 'OK' || !destData.results || destData.results.length === 0) {
        throw new Error('Could not geocode destination address');
      }

      destinationCoords = destData.results[0].geometry.location;

      // Use Distance Matrix API to get route information
      const distanceMatrixResponse = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originCoords.lat},${originCoords.lng}&destinations=${destinationCoords.lat},${destinationCoords.lng}&mode=driving&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const distanceMatrixData = await distanceMatrixResponse.json();

      if (
        distanceMatrixData.status !== 'OK' ||
        !distanceMatrixData.rows ||
        distanceMatrixData.rows.length === 0 ||
        !distanceMatrixData.rows[0].elements ||
        distanceMatrixData.rows[0].elements.length === 0 ||
        distanceMatrixData.rows[0].elements[0].status !== 'OK'
      ) {
        throw new Error('Could not calculate route');
      }

      // Create route info object
      const routeInfoData: RouteInfo = {
        distance: distanceMatrixData.rows[0].elements[0].distance.text,
        duration: distanceMatrixData.rows[0].elements[0].duration.text,
        startAddress: distanceMatrixData.origin_addresses[0],
        endAddress: distanceMatrixData.destination_addresses[0],
        steps: ['Navigate to destination'], // Simplified steps
      };

      setRouteInfo(routeInfoData);

      // If we have a hospital with these coordinates, select it
      if (selectedHospital === null) {
        // Create a temporary hospital object for the destination
        const tempHospital: Hospital = {
          id: 'temp-destination',
          name: destination,
          position: [destinationCoords.lat, destinationCoords.lng],
          specialties: [],
          address: distanceMatrixData.destination_addresses[0],
        };
        setSelectedHospital(tempHospital);
      }
    } catch (error) {
      console.error('Error finding route:', error);
      alert('Could not find a route. Please check the addresses and try again.');
    } finally {
      setIsLoadingRoute(false);
    }
  }, [coords, selectedHospital]);

  // Function to fall back to IP-based geolocation
  const fallbackToIPGeolocation = useCallback(async () => {
    try {
      const location = await getLocationFromIP();
      if (location) {
        setCoords([location.latitude, location.longitude]);
        setLocationStatus(LocationStatus.MANUAL_INPUT);
      } else {
        setLocationStatus(LocationStatus.DEFAULT_LOCATION);
      }
    } catch (error) {
      console.error('IP geolocation failed:', error);
      setLocationStatus(LocationStatus.DEFAULT_LOCATION);
    }
  }, []);

  // Function to get location from IP address
  const getLocationFromIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting location from IP:', error);
      return null;
    }
  };

  // Use Hyderabad as default location
  const useDefaultLocation = () => {
    setCoords([17.4123, 78.4092]); // Hyderabad coordinates
    setLocationStatus(LocationStatus.MANUAL_INPUT);
  };

  // Get user location on component mount
  useEffect(() => {
    if (initialUserCoords) {
      setCoords(initialUserCoords);
      setLocationStatus(LocationStatus.MANUAL_INPUT);
    } else {
      getUserLocation();
    }
  }, [getUserLocation, initialUserCoords]);

  // Render different UI based on location status
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

  if (locationStatus === LocationStatus.ERROR || locationStatus === LocationStatus.MANUAL_INPUT) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="p-4 bg-white border-b flex items-center space-x-2">
          <Input
            placeholder="Type a location to search"
            value={manualLocationInput}
            onChange={(e) => setManualLocationInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
            className="flex-1"
          />
          <Button onClick={searchLocation} disabled={isSearchingLocation}>
            {isSearchingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        <div className="flex-1 relative">
          {coords ? (
            <>
              <MapComponentsGoogle
                coords={coords}
                filteredHospitals={[]}
                selectedHospital={selectedHospital}
                setSelectedHospital={setSelectedHospital}
                searchRadius={searchRadius}
                routeDirections={routeDirections}
              />
              
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-4">
                <p className="mb-4">Could not determine your location. Please enter it manually.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (locationStatus === LocationStatus.CITY_SELECTION) {
    return (
      <Card className="w-full h-full overflow-hidden border-0 shadow-none">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-bold mb-4">Select Your City</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={useDefaultLocation}>Hyderabad</Button>
              <Button onClick={() => setLocationStatus(LocationStatus.MANUAL_INPUT)}>Enter Manually</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locationStatus === LocationStatus.BROWSER_GEOLOCATION_RETRY) {
    return (
      <Card className="w-full h-full overflow-hidden border-0 shadow-none">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-bold mb-2">Location Detection Failed</h3>
            <p className="mb-4">We couldn't detect your precise location. Would you like to:</p>
            <div className="space-y-2">
              <Button onClick={() => getUserLocation(false)} className="w-full">
                Try Again with Lower Accuracy
              </Button>
              <Button onClick={() => setLocationStatus(LocationStatus.MANUAL_INPUT)} variant="outline" className="w-full">
                Enter Location Manually
              </Button>
              <Button onClick={useDefaultLocation} variant="outline" className="w-full">
                Use Hyderabad as Default
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locationStatus === LocationStatus.PERMISSION_GUIDANCE) {
    return (
      <Card className="w-full h-full overflow-hidden border-0 shadow-none">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-bold mb-2">Location Permission Required</h3>
            <p className="mb-4">
              Please enable location services in your browser to use this feature. Here's how:
            </p>
            <div className="text-left mb-4 bg-gray-50 p-3 rounded-md">
              <p className="font-medium">Chrome:</p>
              <ol className="list-decimal list-inside text-sm ml-2">
                <li>Click the lock icon in the address bar</li>
                <li>Select "Site settings"</li>
                <li>Set Location to "Allow"</li>
                <li>Refresh the page</li>
              </ol>
            </div>
            <div className="space-y-2">
              <Button onClick={() => getUserLocation()} className="w-full">
                Try Again
              </Button>
              <Button onClick={() => setLocationStatus(LocationStatus.MANUAL_INPUT)} variant="outline" className="w-full">
                Enter Location Manually
              </Button>
              <Button onClick={useDefaultLocation} variant="outline" className="w-full">
                Use Hyderabad as Default
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (locationStatus === LocationStatus.DEFAULT_LOCATION) {
    return (
      <Card className="w-full h-full overflow-hidden border-0 shadow-none">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center max-w-md">
            <h3 className="text-lg font-bold mb-2">Location Detection Failed</h3>
            <p className="mb-4">We couldn't detect your location. Would you like to:</p>
            <div className="space-y-2">
              <Button onClick={useDefaultLocation} className="w-full">
                Use Hyderabad as Default
              </Button>
              <Button onClick={() => setLocationStatus(LocationStatus.MANUAL_INPUT)} variant="outline" className="w-full">
                Enter Location Manually
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}