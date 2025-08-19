import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Typography,
  Paper,
  Button,
  Fab,
  Tooltip
} from '@mui/material';
import {
  CropFree,
  Clear,
  Search
} from '@mui/icons-material';
import type { PropertyListing } from '../types/property';

interface SimpleMapWithBoundaryProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  onBoundarySearch: (bounds: { north: number; south: number; east: number; west: number }) => void;
  searchLocation?: string;
}

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function SimpleMapWithBoundary({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  onBoundarySearch,
  searchLocation
}: SimpleMapWithBoundaryProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const rectangleRef = useRef<L.Rectangle | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState<{ lat: number; lng: number } | null>(null);
  const [currentBounds, setCurrentBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      console.log('🗺️ Initializing simple map...');
      
      mapRef.current = L.map('simple-map-boundary', {
        center: [37.3541, -121.9552],
        zoom: 12,
        zoomControl: true
      });
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapRef.current);

      console.log('✅ Simple map initialized');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle drawing mode
  useEffect(() => {
    if (!mapRef.current) return;

    if (isDrawing) {
      mapRef.current.getContainer().style.cursor = 'crosshair';
      
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (!drawingStart) {
          // Start drawing
          setDrawingStart({ lat: e.latlng.lat, lng: e.latlng.lng });
        } else {
          // Finish drawing
          const endPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
          
          // Create rectangle bounds
          const bounds = L.latLngBounds([
            [Math.min(drawingStart.lat, endPoint.lat), Math.min(drawingStart.lng, endPoint.lng)],
            [Math.max(drawingStart.lat, endPoint.lat), Math.max(drawingStart.lng, endPoint.lng)]
          ]);

          // Remove existing rectangle
          if (rectangleRef.current && mapRef.current) {
            mapRef.current.removeLayer(rectangleRef.current);
          }

          // Add new rectangle
          const rectangle = L.rectangle(bounds, {
            color: '#2196f3',
            fillColor: '#2196f3',
            fillOpacity: 0.1,
            weight: 2
          });

          if (mapRef.current) {
            rectangle.addTo(mapRef.current);
            rectangleRef.current = rectangle;
          }

          // Extract bounds for search
          const searchBounds = {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          };

          setCurrentBounds(searchBounds);
          console.log('🎯 Rectangle drawn:', searchBounds);

          // Reset drawing state
          setIsDrawing(false);
          setDrawingStart(null);
          
          // Trigger search
          onBoundarySearch(searchBounds);
        }
      };

      const handleMapMouseMove = (e: L.LeafletMouseEvent) => {
        if (drawingStart && mapRef.current) {
          // Remove temporary rectangle
          const tempRect = mapRef.current.getContainer().querySelector('.temp-rectangle');
          if (tempRect) tempRect.remove();

          // Show preview rectangle
          const bounds = L.latLngBounds([
            [Math.min(drawingStart.lat, e.latlng.lat), Math.min(drawingStart.lng, e.latlng.lng)],
            [Math.max(drawingStart.lat, e.latlng.lat), Math.max(drawingStart.lng, e.latlng.lng)]
          ]);

          const tempRectangle = L.rectangle(bounds, {
            color: '#2196f3',
            fillColor: '#2196f3',
            fillOpacity: 0.05,
            weight: 1,
            dashArray: '5, 5',
            className: 'temp-rectangle'
          });

          tempRectangle.addTo(mapRef.current);
        }
      };

      mapRef.current.on('click', handleMapClick);
      mapRef.current.on('mousemove', handleMapMouseMove);

      return () => {
        if (mapRef.current) {
          mapRef.current.off('click', handleMapClick);
          mapRef.current.off('mousemove', handleMapMouseMove);
          mapRef.current.getContainer().style.cursor = '';
        }
      };
    } else {
      if (mapRef.current) {
        mapRef.current.getContainer().style.cursor = '';
      }
      setDrawingStart(null);
    }
  }, [isDrawing, drawingStart, onBoundarySearch]);

  // Update property markers (same as before)
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (mapRef.current) {
        mapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Add markers for properties
    properties.forEach(property => {
      if (property.coordinates && property.coordinates.lat && property.coordinates.lng) {
        const getMarkerColor = () => {
          if (property.investmentScore >= 8) return '#4caf50';
          if (property.investmentScore >= 6) return '#2196f3';
          if (property.investmentScore >= 4) return '#ff9800';
          return '#f44336';
        };

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
          ">$${Math.round(property.purchasePrice / 1000)}K</div>`,
          className: 'price-marker',
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        const marker = L.marker([property.coordinates.lat, property.coordinates.lng], { icon: customIcon });
        
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
                  <strong>Investment Score:</strong> 
                  <span style="
                    background: ${getMarkerColor()};
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 11px;
                  ">${property.investmentScore.toFixed(1)}/10 ${property.investmentRank}</span>
                </div>
              </div>
            `)
            .on('click', () => onPropertySelect(property));

          markersRef.current.push(marker);

          // Highlight selected property
          if (selectedProperty?.id === property.id) {
            marker.openPopup();
          }
        }
      }
    });

    // Fit map to show all properties
    if (properties.length > 0 && markersRef.current.length > 0 && !currentBounds) {
      try {
        const group = new L.FeatureGroup(markersRef.current);
        if (mapRef.current) {
          mapRef.current.fitBounds(group.getBounds().pad(0.1));
        }
      } catch (error) {
        console.error('Error fitting map bounds:', error);
      }
    }
  }, [properties, selectedProperty, onPropertySelect, currentBounds]);

  const toggleDrawing = () => {
    setIsDrawing(!isDrawing);
    setDrawingStart(null);
  };

  const clearRectangle = () => {
    if (rectangleRef.current && mapRef.current) {
      mapRef.current.removeLayer(rectangleRef.current);
      rectangleRef.current = null;
    }
    setCurrentBounds(null);
    setIsDrawing(false);
    setDrawingStart(null);
  };

  const searchInArea = () => {
    if (currentBounds) {
      onBoundarySearch(currentBounds);
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <div id="simple-map-boundary" style={{ height: '100%', width: '100%' }} />
      
      {/* Drawing Controls */}
      <Paper
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1000,
          p: 2,
          minWidth: 200
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
          Search Tools
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Button
            variant={isDrawing ? 'contained' : 'outlined'}
            size="small"
            startIcon={<CropFree />}
            onClick={toggleDrawing}
            color="primary"
            fullWidth
          >
            {isDrawing ? (drawingStart ? 'Click to Finish' : 'Click to Start') : 'Draw Area'}
          </Button>
          
          {currentBounds && (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Search />}
                onClick={searchInArea}
                color="success"
                fullWidth
              >
                Search in Area
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<Clear />}
                onClick={clearRectangle}
                color="error"
                fullWidth
              >
                Clear Area
              </Button>
            </>
          )}
        </Box>

        {isDrawing && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'primary.main', fontStyle: 'italic' }}>
            {drawingStart ? 'Click to finish rectangle' : 'Click to start drawing'}
          </Typography>
        )}
        
        {currentBounds && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
            Area: {Math.abs(currentBounds.north - currentBounds.south).toFixed(3)}° × {Math.abs(currentBounds.east - currentBounds.west).toFixed(3)}°
          </Typography>
        )}
      </Paper>

      {/* Property Count */}
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
            {currentBounds && ' in Selected Area'}
          </Typography>
        </Paper>
      )}

      {/* Instructions */}
      {properties.length === 0 && !isDrawing && (
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
            Draw a rectangle on the map to search for investment properties in a specific area.
          </Typography>
          <Button
            variant="contained"
            startIcon={<CropFree />}
            onClick={toggleDrawing}
            size="small"
          >
            Draw Search Area
          </Button>
        </Paper>
      )}
    </Box>
  );
}
