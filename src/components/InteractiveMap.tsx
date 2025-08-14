import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { PropertyListing } from '../types/property';

interface InteractiveMapProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  searchLocation?: string;
}

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Real geocoding function using Nominatim (OpenStreetMap's free geocoding service)
const geocodeAddress = async (address: string, city: string, state: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const query = encodeURIComponent(`${address}, ${city}, ${state}, USA`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Generate realistic coordinates for properties
const getPropertyCoordinates = async (property: PropertyListing): Promise<{ lat: number; lng: number } | null> => {
  // First, check if the property already has coordinates from the API
  if (property.latitude && property.longitude && !isNaN(property.latitude) && !isNaN(property.longitude)) {
    console.log(`✅ Using API coordinates for ${property.address}: ${property.latitude}, ${property.longitude}`);
    return {
      lat: property.latitude,
      lng: property.longitude
    };
  }
  
  console.log(`⚠️ No API coordinates for ${property.address}, attempting geocoding...`);
  
  // Try real geocoding as fallback
  try {
    const realCoords = await geocodeAddress(property.address, property.city, property.state);
    if (realCoords) {
      console.log(`✅ Geocoded ${property.address}:`, realCoords);
      return realCoords;
    }
  } catch (error) {
    console.log(`❌ Geocoding failed for ${property.address}:`, error);
  }
  
  console.log(`❌ All coordinate methods failed for ${property.address}, using city center fallback`);
  
  // Fallback to city center with slight variation
  const cityCoords: { [key: string]: { lat: number; lng: number } } = {
    'Santa Clara, CA': { lat: 37.3541, lng: -121.9552 },
    'Orlando, FL': { lat: 28.5383, lng: -81.3792 },
    'Houston, TX': { lat: 29.7604, lng: -95.3698 },
    'Miami, FL': { lat: 25.7617, lng: -80.1918 },
    'Indianapolis, IN': { lat: 39.7684, lng: -86.1581 },
    'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
    'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
    'Charlotte, NC': { lat: 35.2271, lng: -80.8431 },
    'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
    'Birmingham, AL': { lat: 33.5186, lng: -86.8104 },
    'Philadelphia, PA': { lat: 39.9526, lng: -75.1652 },
    'Milwaukee, WI': { lat: 43.0389, lng: -87.9065 },
    'Cleveland, OH': { lat: 41.4993, lng: -81.6944 },
    'Detroit, MI': { lat: 42.3314, lng: -83.0458 },
    'Kansas City, KS': { lat: 39.0997, lng: -94.5786 },
    'Oklahoma City, OK': { lat: 35.4676, lng: -97.5164 },
  };
  
  const cityKey = `${property.city}, ${property.state}`;
  const baseCoords = cityCoords[cityKey] || { lat: 37.3541, lng: -121.9552 }; // Default to Santa Clara
  
  // Add small random variation for nearby properties
  const variation = 0.02;
  return {
    lat: baseCoords.lat + (Math.random() - 0.5) * variation,
    lng: baseCoords.lng + (Math.random() - 0.5) * variation
  };
};

export default function InteractiveMap({ properties, selectedProperty, onPropertySelect, searchLocation }: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      // Default to Santa Clara, CA
      mapRef.current = L.map('map').setView([37.3541, -121.9552], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update property markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Add markers for all properties using async processing
    const addMarkersAsync = async () => {
      for (const property of properties) {
        try {
          let coords: { lat: number; lng: number } | null = null;
          
          // Use property coordinates if available, otherwise geocode
          if (property.coordinates && property.coordinates.lat && property.coordinates.lng) {
            coords = property.coordinates;
            console.log(`✅ Using property coordinates for ${property.address}: ${coords.lat}, ${coords.lng}`);
          } else {
            coords = await getPropertyCoordinates(property);
          }
          
          // Safety check - skip if no coordinates available
          if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
            console.log(`⚠️ Skipping ${property.address} - no valid coordinates`);
            continue;
          }
          
          console.log(`📍 Adding marker for ${property.address} at ${coords.lat}, ${coords.lng}`);
          
          // Create custom icon based on price
          const getMarkerColor = () => {
            if (property.purchasePrice >= 200000) return '#4caf50'; // Green
            if (property.purchasePrice >= 150000) return '#ff9800'; // Orange
            return '#f44336'; // Red
          };

          // Create custom icon
          const customIcon = L.divIcon({
            html: `<div style="
              background-color: ${getMarkerColor()};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 12px;
            ">💰</div>`,
            className: 'custom-marker',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          });

          const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });
          
          // Safety check to ensure map is still available
          if (mapRef.current) {
            marker.addTo(mapRef.current)
              .bindPopup(`
                <div style="min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px;">${property.address}</h3>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Price:</strong> $${property.purchasePrice.toLocaleString()}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Beds/Baths:</strong> ${property.bedrooms}/${property.bathrooms}</p>
                  <p style="margin: 4px 0; font-size: 12px;"><strong>Estimated Rent:</strong> $${property.estimatedRent.toLocaleString()}/month</p>
                  <button onclick="window.selectProperty('${property.id}')" style="
                    background: #2196f3;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 8px;
                  ">Select Property</button>
                </div>
              `)
              .on('click', () => onPropertySelect(property));

            markersRef.current.push(marker);

            // Highlight selected property
            if (selectedProperty?.id === property.id) {
              marker.setIcon(L.divIcon({
                html: `<div style="
                  background-color: ${getMarkerColor()};
                  width: 30px;
                  height: 30px;
                  border-radius: 50%;
                  border: 4px solid #fff;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.4);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-size: 16px;
                  animation: pulse 2s infinite;
                ">🏠</div>`,
                className: 'selected-marker',
                iconSize: [38, 38],
                iconAnchor: [19, 19]
              }));
              marker.openPopup();
            }
          }
        } catch (error) {
          console.error(`Error adding marker for ${property.address}:`, error);
        }
      }

      // Fit map to show all properties
      if (properties.length > 0 && markersRef.current.length > 0) {
        try {
          const group = new L.FeatureGroup(markersRef.current);
          if (mapRef.current) {
            mapRef.current.fitBounds(group.getBounds().pad(0.1));
          }
        } catch (error) {
          console.error('Error fitting map bounds:', error);
        }
      }
    };

    addMarkersAsync();
  }, [properties, selectedProperty, onPropertySelect]);

  // Update search location marker
  useEffect(() => {
    if (!mapRef.current || !searchLocation) return;

    // Remove existing search marker
    if (searchMarkerRef.current) {
      mapRef.current.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }

    // Add search location marker
    const geocodeSearchLocation = async () => {
      try {
        const query = encodeURIComponent(`${searchLocation}, USA`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          
          if (mapRef.current) {
            const searchIcon = L.divIcon({
              html: `<div style="
                background-color: #2196f3;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
              ">📍</div>`,
              className: 'search-marker',
              iconSize: [36, 36],
              iconAnchor: [18, 18]
            });

            searchMarkerRef.current = L.marker([coords.lat, coords.lng], { icon: searchIcon })
              .addTo(mapRef.current)
              .bindPopup(`<strong>Search Location</strong><br>${searchLocation}`)
              .openPopup();
          }
        }
      } catch (error) {
        console.error('Error geocoding search location:', error);
      }
    };

    geocodeSearchLocation();
  }, [searchLocation]);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div id="map" style={{ height: '100%', width: '100%' }} />
      
      {/* Map Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}>
        {properties.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {properties.length} Properties Found
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px',
        borderRadius: '6px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Price Range</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#4caf50', borderRadius: '50%', marginRight: '5px' }}></div>
          $200k+
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ff9800', borderRadius: '50%', marginRight: '5px' }}></div>
          $150k - $200k
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f44336', borderRadius: '50%', marginRight: '5px' }}></div>
          Under $150k
        </div>
      </div>
    </div>
  );
}