import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import {
  Box,
  IconButton,
  Tooltip,
  Fab,
  Typography,
  Paper,
  Button
} from '@mui/material';
import {
  CropFree,
  Clear,
  Search,
  Layers
} from '@mui/icons-material';
import type { PropertyListing } from '../types/property';

interface InteractiveMapWithBoundaryProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  onBoundarySearch: (bounds: { north: number; south: number; east: number; west: number }) => void;
  searchLocation?: string;
  isDrawingMode?: boolean;
  onDrawingModeChange?: (isDrawing: boolean) => void;
}

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Real geocoding function
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
    return {
      lat: property.latitude,
      lng: property.longitude
    };
  }
  
  // Try real geocoding as fallback
  try {
    const realCoords = await geocodeAddress(property.address, property.city, property.state);
    if (realCoords) {
      return realCoords;
    }
  } catch (error) {
    console.log(`❌ Geocoding failed for ${property.address}:`, error);
  }
  
  // Fallback to city center with slight variation
  const cityCoords: { [key: string]: { lat: number; lng: number } } = {
    'Santa Clara, CA': { lat: 37.3541, lng: -121.9552 },
    'San Jose, CA': { lat: 37.3382, lng: -121.8863 },
    'Milpitas, CA': { lat: 37.4323, lng: -121.8995 },
    'Sunnyvale, CA': { lat: 37.3688, lng: -122.0363 },
    'Cupertino, CA': { lat: 37.3230, lng: -122.0322 },
    'Mountain View, CA': { lat: 37.3861, lng: -122.0839 },
    'Palo Alto, CA': { lat: 37.4419, lng: -122.1430 },
    'Orlando, FL': { lat: 28.5383, lng: -81.3792 },
    'Houston, TX': { lat: 29.7604, lng: -95.3698 },
    'Miami, FL': { lat: 25.7617, lng: -80.1918 },
    'Indianapolis, IN': { lat: 39.7684, lng: -86.1581 },
    'Dallas, TX': { lat: 32.7767, lng: -96.7970 },
    'Atlanta, GA': { lat: 33.7490, lng: -84.3880 },
    'Charlotte, NC': { lat: 35.2271, lng: -80.8431 },
    'Nashville, TN': { lat: 36.1627, lng: -86.7816 },
    'Birmingham, AL': { lat: 33.5186, lng: -86.8104 }
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

export default function InteractiveMapWithBoundary({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  onBoundarySearch,
  searchLocation,
  isDrawingMode = false,
  onDrawingModeChange
}: InteractiveMapWithBoundaryProps) {
  const mapRef = useRef<L.Map | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const [currentBoundary, setCurrentBoundary] = useState<L.Rectangle | null>(null);
  const [boundaryBounds, setBoundaryBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      // Default to Santa Clara, CA - matching the Zillow link
      mapRef.current = L.map('map-with-boundary', {
        center: [37.3541, -121.9552],
        zoom: 12,
        zoomControl: true
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapRef.current);

      // Add drawn items layer
      mapRef.current.addLayer(drawnItemsRef.current);

      // Initialize draw control
      const drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
          rectangle: {
            shapeOptions: {
              color: '#2196f3', // Zillow-like blue color
              fillColor: '#2196f3',
              fillOpacity: 0.1,
              weight: 2
            }
          },
          polygon: false,
          polyline: false,
          circle: false,
          marker: false,
          circlemarker: false
        },
        edit: {
          featureGroup: drawnItemsRef.current,
          remove: true,
          edit: true
        }
      });

      drawControlRef.current = drawControl;

      // Handle draw events
      mapRef.current.on(L.Draw.Event.CREATED, (event: any) => {
        const layer = event.layer;
        
        // Remove previous boundary
        if (currentBoundary) {
          drawnItemsRef.current.removeLayer(currentBoundary);
        }
        
        // Add new boundary
        drawnItemsRef.current.addLayer(layer);
        setCurrentBoundary(layer);
        
        // Extract bounds for search
        if (layer instanceof L.Rectangle) {
          const bounds = layer.getBounds();
          const newBounds = {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          };
          setBoundaryBounds(newBounds);
          
          // Trigger search within boundary
          onBoundarySearch(newBounds);
        }
        
        // Exit drawing mode
        if (onDrawingModeChange) {
          onDrawingModeChange(false);
        }
      });

      mapRef.current.on(L.Draw.Event.DELETED, () => {
        setCurrentBoundary(null);
        setBoundaryBounds(null);
      });

      mapRef.current.on(L.Draw.Event.EDITED, (event: any) => {
        if (currentBoundary && event.layers.getLayers().includes(currentBoundary)) {
          const bounds = currentBoundary.getBounds();
          const newBounds = {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          };
          setBoundaryBounds(newBounds);
          onBoundarySearch(newBounds);
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onBoundarySearch, onDrawingModeChange]);

  // Toggle drawing mode
  useEffect(() => {
    if (!mapRef.current || !drawControlRef.current) return;

    if (isDrawingMode) {
      if (!mapRef.current.hasLayer(drawControlRef.current as any)) {
        mapRef.current.addControl(drawControlRef.current);
      }
    } else {
      if (mapRef.current.hasLayer(drawControlRef.current as any)) {
        mapRef.current.removeControl(drawControlRef.current);
      }
    }
  }, [isDrawingMode]);

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

    // Add markers for all properties
    const addMarkersAsync = async () => {
      for (const property of properties) {
        try {
          let coords: { lat: number; lng: number } | null = null;
          
          if (property.coordinates && property.coordinates.lat && property.coordinates.lng) {
            coords = property.coordinates;
          } else {
            coords = await getPropertyCoordinates(property);
          }
          
          if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
            continue;
          }
          
          // Create Zillow-style marker
          const getMarkerColor = () => {
            if (property.investmentScore >= 8) return '#4caf50'; // Excellent - Green
            if (property.investmentScore >= 6) return '#2196f3'; // Good - Blue  
            if (property.investmentScore >= 4) return '#ff9800'; // Fair - Orange
            return '#f44336'; // Poor - Red
          };

          const getMarkerText = () => {
            return `$${Math.round(property.purchasePrice / 1000)}K`;
          };

          // Create Zillow-style price marker
          const customIcon = L.divIcon({
            html: `<div style="
              background-color: ${getMarkerColor()};
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              font-size: 12px;
              font-weight: bold;
              white-space: nowrap;
              transform: translateX(-50%);
            ">${getMarkerText()}</div>`,
            className: 'price-marker',
            iconSize: [0, 0],
            iconAnchor: [0, 0]
          });

          const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });
          
          if (mapRef.current) {
            marker.addTo(mapRef.current)
              .bindPopup(`
                <div style="min-width: 250px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #333;">${property.address}</h3>
                  <div style="margin: 6px 0;">
                    <strong>Price:</strong> $${property.purchasePrice.toLocaleString()}
                  </div>
                  <div style="margin: 6px 0;">
                    <strong>Beds/Baths:</strong> ${property.bedrooms}/${property.bathrooms} | ${property.squareFootage} sqft
                  </div>
                  <div style="margin: 6px 0;">
                    <strong>Est. Rent:</strong> $${property.estimatedRent.toLocaleString()}/month
                  </div>
                  <div style="margin: 6px 0;">
                    <strong>Cash Flow:</strong> <span style="color: ${property.estimatedCashFlow >= 0 ? '#4caf50' : '#f44336'}">$${property.estimatedCashFlow.toLocaleString()}/month</span>
                  </div>
                  <div style="margin: 6px 0;">
                    <strong>COC Return:</strong> ${property.estimatedCOCReturn.toFixed(1)}%
                  </div>
                  <div style="margin: 6px 0;">
                    <strong>Investment Score:</strong> 
                    <span style="
                      background: ${getMarkerColor()};
                      color: white;
                      padding: 2px 6px;
                      border-radius: 3px;
                      font-size: 11px;
                    ">${property.investmentScore.toFixed(1)}/10 ${property.investmentRank}</span>
                  </div>
                  <button onclick="window.selectProperty('${property.id}')" style="
                    background: #2196f3;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 8px;
                    font-size: 12px;
                  ">View Details</button>
                </div>
              `)
              .on('click', () => onPropertySelect(property));

            markersRef.current.push(marker);

            // Highlight selected property
            if (selectedProperty?.id === property.id) {
              marker.setIcon(L.divIcon({
                html: `<div style="
                  background-color: #2196f3;
                  color: white;
                  padding: 6px 10px;
                  border-radius: 6px;
                  border: 3px solid white;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.4);
                  font-size: 14px;
                  font-weight: bold;
                  white-space: nowrap;
                  transform: translateX(-50%);
                  animation: pulse 2s infinite;
                ">${getMarkerText()}</div>
                <style>
                  @keyframes pulse {
                    0% { transform: translateX(-50%) scale(1); }
                    50% { transform: translateX(-50%) scale(1.1); }
                    100% { transform: translateX(-50%) scale(1); }
                  }
                </style>`,
                className: 'selected-price-marker',
                iconSize: [0, 0],
                iconAnchor: [0, 0]
              }));
              marker.openPopup();
            }
          }
        } catch (error) {
          console.error(`Error adding marker for ${property.address}:`, error);
        }
      }

      // Fit map to show all properties or boundary
      if (currentBoundary) {
        // Keep current view if boundary is drawn
        return;
      } else if (properties.length > 0 && markersRef.current.length > 0) {
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
  }, [properties, selectedProperty, onPropertySelect, currentBoundary]);

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
                background-color: #ff4444;
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
              .bindPopup(`<strong>Search Location</strong><br>${searchLocation}`);
          }
        }
      } catch (error) {
        console.error('Error geocoding search location:', error);
      }
    };

    geocodeSearchLocation();
  }, [searchLocation]);

  const toggleDrawingMode = () => {
    if (onDrawingModeChange) {
      onDrawingModeChange(!isDrawingMode);
    }
  };

  const clearBoundary = () => {
    if (currentBoundary && drawnItemsRef.current) {
      drawnItemsRef.current.removeLayer(currentBoundary);
      setCurrentBoundary(null);
      setBoundaryBounds(null);
    }
  };

  const searchInBoundary = () => {
    if (boundaryBounds) {
      onBoundarySearch(boundaryBounds);
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <div id="map-with-boundary" style={{ height: '100%', width: '100%' }} />
      
      {/* Drawing Controls */}
      <Paper
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minWidth: 200
        }}
      >
        <Typography variant="subtitle2" sx={{ px: 1, fontWeight: 'bold', color: 'primary.main' }}>
          Search Tools
        </Typography>
        
        <Button
          variant={isDrawingMode ? 'contained' : 'outlined'}
          size="small"
          startIcon={<CropFree />}
          onClick={toggleDrawingMode}
          color="primary"
        >
          {isDrawingMode ? 'Drawing...' : 'Draw Boundary'}
        </Button>
        
        {currentBoundary && (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Search />}
              onClick={searchInBoundary}
              color="success"
            >
              Search in Area
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<Clear />}
              onClick={clearBoundary}
              color="error"
            >
              Clear Area
            </Button>
          </>
        )}
        
        {boundaryBounds && (
          <Typography variant="caption" sx={{ px: 1, color: 'text.secondary' }}>
            Area: {Math.abs(boundaryBounds.north - boundaryBounds.south).toFixed(3)}° × {Math.abs(boundaryBounds.east - boundaryBounds.west).toFixed(3)}°
          </Typography>
        )}
      </Paper>

      {/* Property Count Display */}
      {properties.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
            px: 2,
            py: 1
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            {properties.length} Properties Found
            {boundaryBounds && ' in Selected Area'}
          </Typography>
        </Paper>
      )}

      {/* Legend */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 1000,
          p: 2,
          minWidth: 180
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
          Investment Score
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#4caf50', borderRadius: 1 }} />
            <Typography variant="caption">8-10 Excellent</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#2196f3', borderRadius: 1 }} />
            <Typography variant="caption">6-8 Good</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#ff9800', borderRadius: 1 }} />
            <Typography variant="caption">4-6 Fair</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 16, height: 16, backgroundColor: '#f44336', borderRadius: 1 }} />
            <Typography variant="caption">1-4 Poor</Typography>
          </Box>
        </Box>
        
        {isDrawingMode && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'primary.main', fontStyle: 'italic' }}>
            Click and drag to draw a search boundary
          </Typography>
        )}
      </Paper>

      {/* Instructions */}
      {properties.length === 0 && !isDrawingMode && (
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            p: 3,
            textAlign: 'center',
            maxWidth: 300
          }}
        >
          <Typography variant="h6" gutterBottom>
            Search for Properties
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use the search form to find properties, or draw a boundary on the map to search within a specific area.
          </Typography>
          <Button
            variant="contained"
            startIcon={<CropFree />}
            onClick={toggleDrawingMode}
            size="small"
          >
            Draw Search Area
          </Button>
        </Paper>
      )}
    </Box>
  );
}
