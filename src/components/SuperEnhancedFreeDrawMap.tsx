import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import type { PropertyListing } from "../types/property";
import { Box, Typography, Chip, Paper, Button, Alert } from '@mui/material';
import { Search, MapPin, Home, DollarSign } from 'lucide-react';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SuperEnhancedFreeDrawMapProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  onBoundarySearch: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onPolygonSearch: (polygon: Array<{ lat: number; lng: number }>) => void;
  searchLocation?: string;
}

export default function SuperEnhancedFreeDrawMap({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  onBoundarySearch,
  onPolygonSearch,
  searchLocation
}: SuperEnhancedFreeDrawMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const currentLocationMarkerRef = useRef<L.Marker | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<{
    totalProperties: number;
    averagePrice: number;
    priceRange: string;
  } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setLocationError('Unable to get your current location. Using default location.');
          // Use default NYC location
          setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
      setCurrentLocation({ lat: 40.7128, lng: -74.0060 });
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !currentLocation) return;

    // Create map centered on user's location or default
    const map = L.map(mapContainerRef.current).setView([currentLocation.lat, currentLocation.lng], 12);
    mapRef.current = map;

    // Add OpenStreetMap tiles (completely free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initialize the FeatureGroup to store editable layers
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Initialize the draw control and pass it the FeatureGroup of editable layers
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Oh snap!</strong> you can\'t draw that!'
          },
          shapeOptions: {
            color: '#97009c',
            fillColor: '#97009c',
            fillOpacity: 0.2,
            weight: 3
          }
        },
        circle: {
          shapeOptions: {
            color: '#FF6B35',
            fillColor: '#FF6B35',
            fillOpacity: 0.2,
            weight: 3
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#1976d2',
            fillColor: '#1976d2',
            fillOpacity: 0.2,
            weight: 3
          }
        },
        polyline: {
          shapeOptions: {
            color: '#28a745',
            weight: 4
          }
        },
        marker: false,
        circlemarker: false
      }
    });
    map.addControl(drawControl);

    // Add current location marker
    if (currentLocation) {
      const currentLocationIcon = L.divIcon({
        className: 'current-location-marker',
        html: `<div style="
          background: #4285f4;
          border: 3px solid white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const currentLocationMarker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: currentLocationIcon
      }).bindPopup('Your Current Location').addTo(map);
      
      currentLocationMarkerRef.current = currentLocationMarker;
    }

    // Handle draw events
    map.on(L.Draw.Event.CREATED, (event: any) => {
      const layer = event.layer;
      drawnItems.addLayer(layer);

      if (event.layerType === 'polygon') {
        const latlngs = layer.getLatLngs()[0];
        const polygon = latlngs.map((latlng: L.LatLng) => ({
          lat: latlng.lat,
          lng: latlng.lng
        }));
        onPolygonSearch(polygon);
      } else if (event.layerType === 'rectangle') {
        const bounds = layer.getBounds();
        onBoundarySearch({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      } else if (event.layerType === 'circle') {
        const center = layer.getLatLng();
        const radius = layer.getRadius();
        // Convert circle to approximate polygon for search
        const polygon = [];
        const points = 16; // Number of points to approximate circle
        for (let i = 0; i < points; i++) {
          const angle = (i * 2 * Math.PI) / points;
          const lat = center.lat + (radius / 111320) * Math.cos(angle);
          const lng = center.lng + (radius / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
          polygon.push({ lat, lng });
        }
        onPolygonSearch(polygon);
      }
      setIsDrawing(false);
    });

    map.on(L.Draw.Event.DRAWSTART, () => {
      setIsDrawing(true);
    });

    map.on(L.Draw.Event.DRAWSTOP, () => {
      setIsDrawing(false);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current = null;
      }
    };
  }, [onBoundarySearch, onPolygonSearch, currentLocation]);

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    const newMarkers: L.Marker[] = [];
    properties.forEach((property) => {
      if (property.latitude && property.longitude) {
        // Create custom property marker icon
        const propertyIcon = L.divIcon({
          className: 'property-marker',
          html: `<div style="
            background: #1976d2;
            color: white;
            border: 2px solid white;
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            text-align: center;
            min-width: 60px;
          ">$${Math.round((property.purchasePrice || 0) / 1000)}k</div>`,
          iconSize: [80, 30],
          iconAnchor: [40, 30]
        });

        const marker = L.marker([property.latitude, property.longitude], {
          icon: propertyIcon
        });
        
        // Create enhanced popup content
        const popupContent = `
          <div style="font-family: 'Roboto', sans-serif; min-width: 250px; max-width: 300px;">
            <div style="background: #1976d2; color: white; margin: -8px -8px 8px -8px; padding: 12px; border-radius: 4px 4px 0 0;">
              <h3 style="margin: 0; font-size: 16px; font-weight: 500;">${property.address}</h3>
              <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">${property.city}, ${property.state} ${property.zipCode}</p>
            </div>
            
            <div style="padding: 0 4px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <div style="text-align: center; flex: 1;">
                  <div style="font-size: 18px; font-weight: bold; color: #1976d2;">$${property.purchasePrice?.toLocaleString() || 'N/A'}</div>
                  <div style="font-size: 11px; color: #666;">Purchase Price</div>
                </div>
                <div style="text-align: center; flex: 1;">
                  <div style="font-size: 18px; font-weight: bold; color: #28a745;">$${property.estimatedRent?.toLocaleString() || 'N/A'}</div>
                  <div style="font-size: 11px; color: #666;">Est. Rent</div>
                </div>
              </div>
              
              <div style="display: flex; gap: 16px; margin-bottom: 8px; font-size: 13px; color: #555;">
                <span><strong>${property.bedrooms || 0}</strong> beds</span>
                <span><strong>${property.bathrooms || 0}</strong> baths</span>
                <span><strong>${property.squareFootage?.toLocaleString() || 'N/A'}</strong> sqft</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
                <span style="color: #666;">Cap Rate: <strong style="color: #1976d2;">${(property.estimatedCapRate * 100).toFixed(1)}%</strong></span>
                <span style="color: #666;">Cash Flow: <strong style="color: ${property.estimatedCashFlow >= 0 ? '#28a745' : '#dc3545'};">${property.estimatedCashFlow >= 0 ? '+' : ''}$${property.estimatedCashFlow}</strong></span>
              </div>
              
              <button 
                onclick="window.selectProperty('${property.id}')" 
                style="
                  width: 100%;
                  background: #1976d2; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 4px; 
                  cursor: pointer;
                  font-size: 13px;
                  font-weight: 500;
                  margin-top: 8px;
                  transition: background 0.2s;
                "
                onmouseover="this.style.background='#1565c0'"
                onmouseout="this.style.background='#1976d2'"
              >
                Select Property
              </button>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.on('click', () => onPropertySelect(property));
        
        if (mapRef.current) {
          mapRef.current.addLayer(marker);
        }
        newMarkers.push(marker);
      }
    });

    markersRef.current = newMarkers;

    // Calculate and update search statistics
    if (properties.length > 0) {
      const prices = properties.filter(p => p.purchasePrice).map(p => p.purchasePrice!);
      const totalProperties = properties.length;
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      setSearchStats({
        totalProperties,
        averagePrice: Math.round(averagePrice),
        priceRange: `$${(minPrice / 1000).toFixed(0)}k - $${(maxPrice / 1000).toFixed(0)}k`
      });

      // Fit map to show all properties
      if (newMarkers.length > 0) {
        const group = new L.FeatureGroup(newMarkers);
        mapRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    } else {
      setSearchStats(null);
    }

  }, [properties, onPropertySelect]);

  // Global function to handle property selection from popup
  useEffect(() => {
    (window as any).selectProperty = (propertyId: string) => {
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        onPropertySelect(property);
      }
    };

    return () => {
      delete (window as any).selectProperty;
    };
  }, [properties, onPropertySelect]);

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ 
          height: '100%', 
          width: '100%', 
          borderRadius: 8,
          overflow: 'hidden'
        }}
      />

      {/* Search Statistics */}
      {searchStats && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            p: 2,
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            minWidth: 250
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Search size={20} />
            Search Results
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Chip 
              icon={<Home size={16} />} 
              label={`${searchStats.totalProperties} Properties`} 
              size="small" 
              color="primary" 
            />
            <Chip 
              icon={<DollarSign size={16} />} 
              label={`Avg: $${(searchStats.averagePrice / 1000).toFixed(0)}k`} 
              size="small" 
              color="secondary" 
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Range: {searchStats.priceRange}
          </Typography>
          
          {searchLocation && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
              {searchLocation}
            </Typography>
          )}
        </Paper>
      )}

      {/* Drawing Mode Indicator */}
      {isDrawing && (
        <Alert 
          severity="info" 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            zIndex: 1000 
          }}
        >
          Drawing mode active - Click to create shape
        </Alert>
      )}

      {/* Selected Property Highlight */}
      {selectedProperty && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            p: 2,
            zIndex: 1000,
            backgroundColor: 'rgba(25, 118, 210, 0.95)',
            color: 'white'
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            Selected Property
          </Typography>
          <Typography variant="body1">
            {selectedProperty.address}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            ${selectedProperty.purchasePrice?.toLocaleString()} • {selectedProperty.bedrooms} beds • {selectedProperty.bathrooms} baths
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
