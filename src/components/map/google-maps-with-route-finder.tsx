'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MapComponentGoogle from './map-component-google';
import { RouteFinderForm } from './route-finder-form';

interface RouteInfo {
  source: string;
  destination: string;
  sourceCoords?: [number, number];
  destinationCoords?: [number, number];
  distance?: string;
  duration?: string;
  showOnMap: boolean;
  directions?: google.maps.DirectionsResult;
}

export function GoogleMapsWithRouteFinder({
  selectedSymptoms = [],
  searchRadius = 3000,
}: {
  selectedSymptoms?: string[];
  searchRadius?: number;
}) {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<[number, number] | undefined>(undefined);

  // Get user location on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Default to Hyderabad if geolocation fails
          setUserCoords([17.4123, 78.4092]);
        }
      );
    } else {
      // Default to Hyderabad if geolocation is not supported
      setUserCoords([17.4123, 78.4092]);
    }
  }, []);

  // Handle finding route between source and destination
  const handleFindRoute = async (source: string, destination: string, useCurrentLocation: boolean) => {
    if (!window.google) {
      console.error('Google Maps API not loaded');
      return;
    }

    setIsLoadingRoute(true);
    
    try {
      const geocoder = new google.maps.Geocoder();
      let sourceCoords: [number, number] | undefined = undefined;
      
      // Use current location as source if requested
      if (useCurrentLocation && userCoords) {
        sourceCoords = userCoords;
      } else {
        // Geocode source address
        const sourceResult = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address: source }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });
        
        sourceCoords = [
          sourceResult[0].geometry.location.lat(),
          sourceResult[0].geometry.location.lng()
        ];
      }
      
      // Geocode destination address
      const destResult = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ address: destination }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results) {
            resolve(results);
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
      
      const destCoords: [number, number] = [
        destResult[0].geometry.location.lat(),
        destResult[0].geometry.location.lng()
      ];
      
      // Get directions
      const directionsService = new google.maps.DirectionsService();
      const directionsResult = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
        directionsService.route({
          origin: { lat: sourceCoords[0], lng: sourceCoords[1] },
          destination: { lat: destCoords[0], lng: destCoords[1] },
          travelMode: google.maps.TravelMode.DRIVING,
        }, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        });
      });
      
      // Extract route information
      const route = directionsResult.routes[0].legs[0];
      
      setRouteInfo({
        source: useCurrentLocation ? 'Current Location' : source,
        destination: destination,
        sourceCoords: sourceCoords,
        destinationCoords: destCoords,
        distance: route.distance?.text || 'Unknown',
        duration: route.duration?.text || 'Unknown',
        showOnMap: true,
        directions: directionsResult
      });
      
    } catch (error) {
      console.error('Error finding route:', error);
      alert('Failed to find route. Please check the addresses and try again.');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Handle reset of route information and map
  const handleReset = () => {
    setRouteInfo(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Route Finder Form */}
      <div className="md:col-span-1">
        <RouteFinderForm 
          onFindRoute={handleFindRoute} 
          onReset={handleReset}
          isLoading={isLoadingRoute} 
        />
        
        {/* Route Information */}
        {routeInfo && (
          <Card className="mt-4 shadow-md">
            <CardContent className="p-4">
              <h3 className="font-medium text-lg mb-2">Route Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>From:</strong> {routeInfo.source}</p>
                <p><strong>To:</strong> {routeInfo.destination}</p>
                {routeInfo.distance && (
                  <p><strong>Distance:</strong> {routeInfo.distance}</p>
                )}
                {routeInfo.duration && (
                  <p><strong>Duration:</strong> {routeInfo.duration}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Map Component */}
      <div className="md:col-span-3 h-[600px]">
        <Card className="h-full shadow-md">
          <CardContent className="p-0 h-full">
            <MapComponentGoogle 
              userCoords={userCoords}
              searchRadius={searchRadius}
              selectedSymptoms={selectedSymptoms}
              routeDirections={routeInfo?.directions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}