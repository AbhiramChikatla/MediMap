'use client';

import { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as turf from '@turf/helpers';
import circle from '@turf/circle';
import distance from '@turf/distance';

// Set your Mapbox access token here
// Replace with your actual Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYWJoaXJhbWNoaWthdGxhMTExIiwiYSI6ImNtYm5xcHcxMDF3cXUyaXF4OWlia2w0NHUifQ.Fz2w3v30n4S0Mo9sxP82YA';

// Hospital interface
interface Hospital {
  id: string;
  name: string;
  position: [number, number]; // [latitude, longitude]
  specialties: string[];
  address: string;
  distance?: number; // Distance from user in meters
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const hospitalMarkers = useRef<mapboxgl.Marker[]>([]);
  const radiusCircle = useRef<string | null>(null);
  const routeSource = useRef<string | null>(null);
  const popupRefs = useRef<{[key: string]: mapboxgl.Popup}>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [nearestHospital, setNearestHospital] = useState<Hospital | null>(null);
  
  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coords ? [coords[1], coords[0]] : [78.4092, 17.4123], // [lng, lat]
        zoom: 13
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      // Add scale
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
      
      map.current.on('load', () => {
        setMapLoaded(true);
        
        // Add sources and layers for route and radius circle
        if (map.current) {
          // Add empty GeoJSON source for route
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: []
              }
            }
          });
          
          // Add route layer
          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3B82F6',
              'line-width': 4,
              'line-opacity': 0.7,
              'line-dasharray': [2, 1]
            }
          });
          
          // Add empty GeoJSON source for radius circle
          map.current.addSource('radius-circle', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [[]]
              }
            }
          });
          
          // Add radius circle layer
          map.current.addLayer({
            id: 'radius-circle',
            type: 'fill',
            source: 'radius-circle',
            paint: {
              'fill-color': '#3B82F6',
              'fill-opacity': 0.1,
              'fill-outline-color': '#3B82F6'
            }
          });
          
          // Add radius circle outline
          map.current.addLayer({
            id: 'radius-circle-outline',
            type: 'line',
            source: 'radius-circle',
            paint: {
              'line-color': '#3B82F6',
              'line-width': 2,
              'line-opacity': 0.8
            }
          });
          
          routeSource.current = 'route';
          radiusCircle.current = 'radius-circle';
        }
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [coords]);
  
  // Update user location marker and radius circle when coords change
  useEffect(() => {
    if (!mapLoaded || !map.current || !coords) return;
    
    // Update map center
    map.current.flyTo({
      center: [coords[1], coords[0]],
      essential: true
    });
    
    // Update or create user marker
    if (userMarker.current) {
      userMarker.current.setLngLat([coords[1], coords[0]]);
    } else {
      // Create a custom HTML element for the marker
      const el = document.createElement('div');
      el.className = 'user-marker';
      el.style.backgroundColor = '#FF4136';
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      
      // Create and add the marker
      userMarker.current = new mapboxgl.Marker(el)
        .setLngLat([coords[1], coords[0]])
        .setPopup(new mapboxgl.Popup().setHTML('<div class="text-center"><strong>Your location</strong></div>'))
        .addTo(map.current);
    }
    
    // Update radius circle
    if (radiusCircle.current && map.current.getSource(radiusCircle.current)) {
      // Create a circle using turf.js
      const options = { steps: 64, units: 'meters' as const };
      const circleFeature = circle(turf.point([coords[1], coords[0]]), searchRadius, options);
      
      // Update the source data
      (map.current.getSource(radiusCircle.current) as mapboxgl.GeoJSONSource).setData(circleFeature);
    }
    
    // Find nearest hospital
    if (filteredHospitals.length > 0) {
      let nearest = filteredHospitals[0];
      let minDistance = distance(
        turf.point([coords[1], coords[0]]),
        turf.point([nearest.position[1], nearest.position[0]]),
        { units: 'meters' as const }
      );
      
      filteredHospitals.forEach(hospital => {
        const dist = distance(
          turf.point([coords[1], coords[0]]),
          turf.point([hospital.position[1], hospital.position[0]]),
          { units: 'meters' as const }
        );
        
        if (dist < minDistance) {
          minDistance = dist;
          nearest = hospital;
        }
      });
      
      setNearestHospital(nearest);
    }
  }, [coords, mapLoaded, searchRadius, filteredHospitals]);
  
  // Update hospital markers when filteredHospitals change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Remove existing markers
    hospitalMarkers.current.forEach(marker => marker.remove());
    hospitalMarkers.current = [];
    
    // Add new markers
    filteredHospitals.forEach(hospital => {
      // Create a custom HTML element for the marker
      const el = document.createElement('div');
      el.className = 'hospital-marker';
      el.style.backgroundColor = '#0074D9';
      el.style.width = '25px';
      el.style.height = '25px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      
      // Create popup content
      const popupContent = `
        <div class="max-w-xs">
          <h3 class="font-bold text-sm">${hospital.name}</h3>
          <p class="text-xs text-gray-600 mt-1">${hospital.address}</p>
          ${hospital.distance !== undefined ? 
            `<p class="text-xs font-medium mt-1">Distance: ${(hospital.distance / 1000).toFixed(1)} km</p>` : 
            ''}
          <div class="mt-2">
            <p class="text-xs font-semibold">Specialties:</p>
            <div class="flex flex-wrap gap-1 mt-1">
              ${hospital.specialties.map(specialty => 
                `<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">${specialty}</span>`
              ).join('')}
            </div>
          </div>
          <button id="show-route-${hospital.id}" class="w-full mt-3 text-xs py-1 px-2 bg-blue-500 text-white rounded hover:bg-blue-600">Show Route</button>
        </div>
      `;
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);
      
      // Store popup reference
      popupRefs.current[hospital.id] = popup;
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([hospital.position[1], hospital.position[0]])
        .setPopup(popup)
        .addTo(map.current!);
      
      // Add click event to marker
      marker.getElement().addEventListener('click', () => {
        setSelectedHospital(hospital);
      });
      
      hospitalMarkers.current.push(marker);
      
      // Add event listener to the Show Route button in popup
      popup.on('open', () => {
        setTimeout(() => {
          const routeButton = document.getElementById(`show-route-${hospital.id}`);
          if (routeButton) {
            routeButton.addEventListener('click', () => {
              setSelectedHospital(hospital);
              popup.remove();
            });
          }
        }, 100);
      });
    });
  }, [filteredHospitals, mapLoaded, setSelectedHospital]);
  
  // Update route when selectedHospital changes
  useEffect(() => {
    if (!mapLoaded || !map.current || !coords || !selectedHospital || !routeSource.current) return;
    
    // Fetch route from Mapbox Directions API
    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coords[1]},${coords[0]};${selectedHospital.position[1]},${selectedHospital.position[0]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const routeGeometry = route.geometry;
          
          // Update the route source
          if (map.current && routeSource.current) {
            (map.current.getSource(routeSource.current) as mapboxgl.GeoJSONSource).setData({
              type: 'Feature',
              properties: {},
              geometry: routeGeometry
            });
          }
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };
    
    fetchRoute();
    
    // Highlight the selected hospital marker
    hospitalMarkers.current.forEach(marker => {
      const el = marker.getElement();
      el.style.zIndex = '1';
      el.style.boxShadow = 'none';
    });
    
    const selectedMarker = hospitalMarkers.current.find(
      marker => marker.getLngLat().lng === selectedHospital.position[1] && 
               marker.getLngLat().lat === selectedHospital.position[0]
    );
    
    if (selectedMarker) {
      const el = selectedMarker.getElement();
      el.style.zIndex = '2';
      el.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
    }
  }, [selectedHospital, coords, mapLoaded]);
  
  return (
    <Card className="w-full h-full overflow-hidden border-0 shadow-none">
      <CardContent className="p-0 h-full relative">
        <div ref={mapContainer} className="w-full h-full" />
        
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
                  // Open directions in Mapbox
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${coords?.[0]},${coords?.[1]}&destination=${selectedHospital.position[0]},${selectedHospital.position[1]}&travelmode=driving`;
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