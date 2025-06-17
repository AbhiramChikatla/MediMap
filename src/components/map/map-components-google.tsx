'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Hospital interface
interface Hospital {
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
  website?: string; // Hospital website URL
  openingHours?: string[]; // Opening hours for each day of the week
  googleMapsUrl?: string; // URL to view in Google Maps
  totalRatings?: number; // Total number of ratings
}

interface MapComponentsProps {
  coords: [number, number] | null;
  filteredHospitals: Hospital[];
  selectedHospital: Hospital | null;
  setSelectedHospital: (hospital: Hospital | null) => void;
  searchRadius: number;
  routeDirections?: google.maps.DirectionsResult;
}

// Google Maps container styles
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Default center (Hyderabad)
const defaultCenter = {
  lat: 17.4123,
  lng: 78.4092
};

// Libraries to load with Google Maps
const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"];

export default function MapComponentsGoogle({
  coords,
  filteredHospitals,
  selectedHospital,
  setSelectedHospital,
  searchRadius,
  routeDirections
}: MapComponentsProps) {
  // Load Google Maps API with Places library
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindow, setInfoWindow] = useState<Hospital | null>(null);
  const [nearestHospital, setNearestHospital] = useState<Hospital | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(false);
  
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Initialize services when maps API is loaded
  useEffect(() => {
    if (isLoaded) {
      if (!directionsService.current) {
        directionsService.current = new google.maps.DirectionsService();
      }
    }
  }, [isLoaded]);

  // Initialize places service when map is loaded
  useEffect(() => {
    if (isLoaded && map) {
      placesService.current = new google.maps.places.PlacesService(map);
    }
  }, [isLoaded, map]);

  // Fetch nearby hospitals using Places API
  useEffect(() => {
    if (!isLoaded || !map || !coords || !placesService.current) return;

    setIsLoadingPlaces(true);

    // Define request for nearby hospitals
    const request: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(coords[0], coords[1]),
      radius: searchRadius,
      type: 'hospital',
      // Add keyword to improve results
      keyword: 'hospital medical clinic healthcare'
    };

    // Also search for clinics and doctors
    const clinicRequest: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(coords[0], coords[1]),
      radius: searchRadius,
      type: 'doctor',
      keyword: 'clinic medical healthcare'
    };

    // Use Places API to find nearby hospitals
    placesService.current.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Convert Places API results to Hospital objects
        const hospitals: Hospital[] = results.map((place, index) => {
          if (!place.geometry || !place.geometry.location) {
            return null;
          }

          // Map medical specialties based on place types and name
          let specialties: string[] = [];
          
          // Extract from types
          if (place.types) {
            specialties = place.types
              .filter(type => type !== 'hospital' && type !== 'health' && type !== 'establishment')
              .map(type => type.replace(/_/g, ' '));
          }
          
          // Try to extract specialties from name
          const specialtyKeywords = {
            'cardio': 'Cardiology',
            'heart': 'Cardiology',
            'neuro': 'Neurology',
            'brain': 'Neurology',
            'ortho': 'Orthopedics',
            'bone': 'Orthopedics',
            'pedia': 'Pediatrics',
            'child': 'Pediatrics',
            'eye': 'Ophthalmology',
            'ophthal': 'Ophthalmology',
            'dent': 'Dental',
            'gynec': 'Gynecology',
            'obstet': 'Obstetrics',
            'maternity': 'Obstetrics',
            'cancer': 'Oncology',
            'onco': 'Oncology',
            'skin': 'Dermatology',
            'derma': 'Dermatology',
            'psych': 'Psychiatry',
            'mental': 'Psychiatry',
            'ent': 'Otolaryngology',
            'ear': 'Otolaryngology',
            'nose': 'Otolaryngology',
            'throat': 'Otolaryngology',
            'gastro': 'Gastroenterology',
            'digest': 'Gastroenterology',
            'uro': 'Urology',
            'kidney': 'Nephrology',
            'pulmo': 'Pulmonology',
            'lung': 'Pulmonology',
            'respiratory': 'Pulmonology',
            'endo': 'Endocrinology',
            'diabet': 'Endocrinology',
            'thyroid': 'Endocrinology',
            'allerg': 'Allergy & Immunology',
            'immun': 'Allergy & Immunology',
          };
          
          if (place.name) {
            const nameLower = place.name.toLowerCase();
            for (const [keyword, specialty] of Object.entries(specialtyKeywords)) {
              if (nameLower.includes(keyword) && !specialties.includes(specialty)) {
                specialties.push(specialty);
              }
            }
          }
          
          // If no specific medical specialties are found, add some common ones
          if (specialties.length === 0) {
            specialties.push('General Medicine');
          }

          return {
            id: place.place_id || `hospital-${index}`,
            name: place.name || 'Unknown Hospital',
            position: [place.geometry.location.lat(), place.geometry.location.lng()],
            specialties: specialties,
            address: place.vicinity || '',
            placeId: place.place_id,
            rating: place.rating,
            openNow: place.opening_hours?.isOpen?.() || false,
            distance: calculateDistance(coords, [place.geometry.location.lat(), place.geometry.location.lng()])
          };
        }).filter(Boolean) as Hospital[];

        // Now search for clinics as well
        placesService.current.nearbySearch(clinicRequest, (clinicResults, clinicStatus) => {
          if (clinicStatus === google.maps.places.PlacesServiceStatus.OK && clinicResults) {
            // Convert clinic results to Hospital objects and merge with hospitals
            const clinics: Hospital[] = clinicResults.map((place, index) => {
              if (!place.geometry || !place.geometry.location) {
                return null;
              }
              
              // Check if this place is already in our hospitals list (avoid duplicates)
              if (hospitals.some(h => h.placeId === place.place_id)) {
                return null;
              }

              // Similar specialty mapping as above
              let specialties: string[] = [];
              
              if (place.types) {
                specialties = place.types
                  .filter(type => type !== 'doctor' && type !== 'health' && type !== 'establishment')
                  .map(type => type.replace(/_/g, ' '));
              }
              
              // Try to extract specialties from name (same logic as above)
              const specialtyKeywords = {
                'cardio': 'Cardiology',
                'heart': 'Cardiology',
                'neuro': 'Neurology',
                'brain': 'Neurology',
                'ortho': 'Orthopedics',
                'bone': 'Orthopedics',
                'pedia': 'Pediatrics',
                'child': 'Pediatrics',
                'eye': 'Ophthalmology',
                'ophthal': 'Ophthalmology',
                'dent': 'Dental',
                'gynec': 'Gynecology',
                'obstet': 'Obstetrics',
                'maternity': 'Obstetrics',
                'cancer': 'Oncology',
                'onco': 'Oncology',
                'skin': 'Dermatology',
                'derma': 'Dermatology',
                'psych': 'Psychiatry',
                'mental': 'Psychiatry',
                'ent': 'Otolaryngology',
                'ear': 'Otolaryngology',
                'nose': 'Otolaryngology',
                'throat': 'Otolaryngology',
                'gastro': 'Gastroenterology',
                'digest': 'Gastroenterology',
                'uro': 'Urology',
                'kidney': 'Nephrology',
                'pulmo': 'Pulmonology',
                'lung': 'Pulmonology',
                'respiratory': 'Pulmonology',
                'endo': 'Endocrinology',
                'diabet': 'Endocrinology',
                'thyroid': 'Endocrinology',
                'allerg': 'Allergy & Immunology',
                'immun': 'Allergy & Immunology',
              };
              
              if (place.name) {
                const nameLower = place.name.toLowerCase();
                for (const [keyword, specialty] of Object.entries(specialtyKeywords)) {
                  if (nameLower.includes(keyword) && !specialties.includes(specialty)) {
                    specialties.push(specialty);
                  }
                }
              }
              
              if (specialties.length === 0) {
                specialties.push('General Medicine');
              }

              return {
                id: place.place_id || `clinic-${index}`,
                name: place.name || 'Unknown Clinic',
                position: [place.geometry.location.lat(), place.geometry.location.lng()],
                specialties: specialties,
                address: place.vicinity || '',
                placeId: place.place_id,
                rating: place.rating,
                openNow: place.opening_hours?.isOpen?.() || false,
                distance: calculateDistance(coords, [place.geometry.location.lat(), place.geometry.location.lng()])
              };
            }).filter(Boolean) as Hospital[];

            // Combine hospitals and clinics
            const allHealthcareProviders = [...hospitals, ...clinics];
            
            // Sort by distance
            allHealthcareProviders.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            
            setNearbyHospitals(allHealthcareProviders);
            
            // Set nearest hospital
            if (allHealthcareProviders.length > 0) {
              setNearestHospital(allHealthcareProviders[0]);
            }
          } else {
            // If clinic search fails, just use the hospitals we found
            hospitals.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
            setNearbyHospitals(hospitals);
            
            if (hospitals.length > 0) {
              setNearestHospital(hospitals[0]);
            }
          }
          
          setIsLoadingPlaces(false);
        });
      } else {
        console.error('Places API request failed:', status);
        setNearbyHospitals([]);
        setIsLoadingPlaces(false);
      }
    });
  }, [map, coords, isLoaded, searchRadius]);

  // Calculate distance between two points using Haversine formula
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

  // Fetch detailed place information when a hospital is selected
  useEffect(() => {
    if (!isLoaded || !selectedHospital || !selectedHospital.placeId || !placesService.current) return;

    // Show loading state while fetching details
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'hospital-details-loading';
    loadingIndicator.className = 'fixed top-4 right-4 bg-white p-2 rounded-md shadow-md z-50';
    loadingIndicator.innerHTML = `
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        <span class="text-sm">Loading hospital details...</span>
      </div>
    `;
    document.body.appendChild(loadingIndicator);

    // Request more fields for comprehensive information
    placesService.current.getDetails(
      {
        placeId: selectedHospital.placeId,
        fields: [
          'formatted_phone_number', 
          'international_phone_number',
          'opening_hours', 
          'website', 
          'formatted_address',
          'rating',
          'review',
          'photo',
          'url',  // Google Maps URL
          'user_ratings_total'
        ]
      },
      (place, status) => {
        // Remove loading indicator
        const indicator = document.getElementById('hospital-details-loading');
        if (indicator) {
          document.body.removeChild(indicator);
        }

        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          // Extract opening hours text if available
          let openingHoursText: string[] = [];
          if (place.opening_hours && place.opening_hours.weekday_text) {
            openingHoursText = place.opening_hours.weekday_text;
          }

          // Update selected hospital with additional details
          setSelectedHospital({
            ...selectedHospital,
            address: place.formatted_address || selectedHospital.address,
            phoneNumber: place.formatted_phone_number || place.international_phone_number,
            website: place.website,
            rating: place.rating || selectedHospital.rating,
            openNow: place.opening_hours?.isOpen?.() || selectedHospital.openNow,
            openingHours: openingHoursText,
            googleMapsUrl: place.url,
            totalRatings: place.user_ratings_total
          });
        } else {
          console.error('Place details request failed:', status);
        }
      }
    );
  }, [selectedHospital, isLoaded, setSelectedHospital]);

  // Fetch directions when a hospital is selected
  useEffect(() => {
    if (!isLoaded || !coords || !selectedHospital || !directionsService.current) return;

    directionsService.current.route(
      {
        origin: { lat: coords[0], lng: coords[1] },
        destination: { lat: selectedHospital.position[0], lng: selectedHospital.position[1] },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Directions request failed: ${status}`);
          setDirections(null);
        }
      }
    );
  }, [coords, selectedHospital, isLoaded]);
  
  // Clear directions and selected hospital when routeDirections is reset
  useEffect(() => {
    if (routeDirections === null) {
      setDirections(null);
      // Clear selected hospital if it was set due to route finding
      if (selectedHospital && !selectedHospital.placeId) {
        setSelectedHospital(null);
      }
    }
  }, [routeDirections, selectedHospital, setSelectedHospital]);

  // Map load callback
  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // Map unmount callback
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // If Google Maps API is not loaded yet, show loading
  if (!isLoaded) {
    return (
      <Card className="w-full h-full overflow-hidden border-0 shadow-none">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading Maps...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there was an error loading the API
  if (loadError) {
    return (
      <Card className="w-full h-full overflow-hidden border-0 shadow-none">
        <CardContent className="p-4 h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Error loading Google Maps API. Please check your API key.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine which hospitals to display - use Places API results if available, otherwise use filtered hospitals
  const hospitalsToDisplay = nearbyHospitals.length > 0 ? nearbyHospitals : filteredHospitals;

  return (
    <Card className="w-full h-full overflow-hidden border-0 shadow-none">
      <CardContent className="p-0 h-full relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={coords ? { lat: coords[0], lng: coords[1] } : defaultCenter}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            gestureHandling: 'cooperative',
            scrollwheel: true,
            zoomControl: true,
            keyboardShortcuts: false,
          }}
        >
          {/* User location marker */}
          {coords && (
            <Marker
              position={{ lat: coords[0], lng: coords[1] }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#FF4136',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              }}
              title="Your Location"
            />
          )}

          {/* Search radius circle */}
          {coords && (
            <Circle
              center={{ lat: coords[0], lng: coords[1] }}
              radius={searchRadius}
              options={{
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                strokeColor: '#3B82F6',
                strokeOpacity: 0.8,
                strokeWeight: 2,
              }}
            />
          )}

          {/* Loading indicator for Places API */}
          {isLoadingPlaces && coords && (
            <div className="absolute top-4 right-4 bg-white p-2 rounded-md shadow-md z-10">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">Finding hospitals...</span>
              </div>
            </div>
          )}

          {/* Hospital markers */}
          {hospitalsToDisplay.map(hospital => (
            <Marker
              key={hospital.id}
              position={{ lat: hospital.position[0], lng: hospital.position[1] }}
              onClick={() => setInfoWindow(hospital)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: selectedHospital?.id === hospital.id ? '#0074D9' : '#0074D9',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: selectedHospital?.id === hospital.id ? 3 : 2,
              }}
            />
          ))}

          {/* Info window for hospital details */}
          {infoWindow && (
            <InfoWindow
              position={{ lat: infoWindow.position[0], lng: infoWindow.position[1] }}
              onCloseClick={() => setInfoWindow(null)}
            >
              <div className="max-w-xs p-2">
                <h3 className="font-bold text-sm">{infoWindow.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{infoWindow.address}</p>
                {infoWindow.distance !== undefined && (
                  <p className="text-xs font-medium mt-1">
                    Distance: {(infoWindow.distance / 1000).toFixed(1)} km
                  </p>
                )}
                {infoWindow.rating !== undefined && (
                  <p className="text-xs font-medium mt-1">
                    Rating: {infoWindow.rating.toFixed(1)} ★
                  </p>
                )}
                {infoWindow.openNow !== undefined && (
                  <p className="text-xs font-medium mt-1">
                    Status: <span className={infoWindow.openNow ? "text-green-600" : "text-red-600"}>
                      {infoWindow.openNow ? "Open Now" : "Closed"}
                    </span>
                  </p>
                )}
                <div className="mt-2">
                  <p className="text-xs font-semibold">Specialties:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {infoWindow.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                {/* <button
                  className="w-full mt-3 text-xs py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => {
                    setSelectedHospital(infoWindow);
                    setInfoWindow(null);
                  }}
                >
                  Show Route
                </button> */}
              </div>
            </InfoWindow>
          )}

          {/* Directions renderer */}
          {routeDirections ? (
            <DirectionsRenderer directions={routeDirections} />
          ) : (
            directions && <DirectionsRenderer directions={directions} />
          )}
        </GoogleMap>

        {/* Hospital info panel */}
        {selectedHospital && (
          <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-md mx-auto overflow-y-auto max-h-[70vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold">{selectedHospital.name}</h3>
                <p className="text-sm text-gray-600">{selectedHospital.address}</p>
                {selectedHospital.distance !== undefined && (
                  <p className="text-sm font-medium mt-1">
                    Distance: {(selectedHospital.distance / 1000).toFixed(1)} km
                  </p>
                )}
                {directions?.routes[0]?.legs[0]?.duration && (
                  <p className="text-sm font-medium">
                    Travel time: {directions.routes[0].legs[0].duration.text}
                  </p>
                )}
                {selectedHospital.phoneNumber && (
                  <p className="text-sm font-medium mt-1">
                    Phone: <a href={`tel:${selectedHospital.phoneNumber.replace(/\s+/g, '')}`} className="text-blue-600 hover:underline">
                      {selectedHospital.phoneNumber}
                    </a>
                  </p>
                )}
                {selectedHospital.website && (
                  <p className="text-sm font-medium mt-1">
                    Website: <a href={selectedHospital.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  </p>
                )}
                {selectedHospital.rating !== undefined && (
                  <p className="text-sm font-medium mt-1">
                    Rating: {selectedHospital.rating.toFixed(1)} ★ 
                    {selectedHospital.totalRatings !== undefined && (
                      <span className="text-gray-500 text-xs">({selectedHospital.totalRatings} reviews)</span>
                    )}
                  </p>
                )}
                {selectedHospital.openNow !== undefined && (
                  <p className="text-sm font-medium mt-1">
                    Status: <span className={selectedHospital.openNow ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                      {selectedHospital.openNow ? "Open Now" : "Closed"}
                    </span>
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  setSelectedHospital(null);
                  setDirections(null);
                }}
              >
                ✕
              </Button>
            </div>
            
            {/* Opening Hours */}
            {selectedHospital.openingHours && selectedHospital.openingHours.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold mb-1">Opening Hours:</p>
                <div className="bg-gray-50 p-2 rounded text-xs">
                  {selectedHospital.openingHours.map((hours, index) => (
                    <p key={index} className="mb-1">{hours}</p>
                  ))}
                </div>
              </div>
            )}
            
            {/* Specialties */}
            <div className="mt-3">
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
            
            {/* Action Buttons */}
            <div className="mt-4 flex flex-col space-y-2">
              <Button
                className="w-full"
                size="sm"
                onClick={() => {
                  // Use the Google Maps URL if available, otherwise construct one
                  const url = selectedHospital.googleMapsUrl || 
                    `https://www.google.com/maps/dir/?api=1&origin=${coords?.[0]},${coords?.[1]}&destination=${selectedHospital.position[0]},${selectedHospital.position[1]}&travelmode=driving`;
                  window.open(url, '_blank');
                }}
              >
                Get Directions
              </Button>
              
              <div className="flex space-x-2">
                {selectedHospital.phoneNumber && (
                  <Button
                    className="flex-1"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      window.location.href = `tel:${selectedHospital.phoneNumber.replace(/\s+/g, '')}`;
                    }}
                  >
                    Call
                  </Button>
                )}
                
                <Button
                  className="flex-1"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // In a real app, this would open a booking system
                    if (selectedHospital.website) {
                      window.open(selectedHospital.website, '_blank');
                    } else if (selectedHospital.phoneNumber) {
                      window.location.href = `tel:${selectedHospital.phoneNumber.replace(/\s+/g, '')}`;
                    } else {
                      alert('Booking functionality would be implemented here');
                    }
                  }}
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
