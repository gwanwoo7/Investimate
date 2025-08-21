import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import {
  Box,
  Typography,
  Button,
  Tooltip,
  Alert,
  CircularProgress,
  Fab,
  Chip,
  Paper
} from '@mui/material';
import {
  MyLocation,
  Clear,
  Search,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
import type { PropertyListing } from '../types/property';

interface GoogleMapsPropertySearchProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  onBoundarySearch: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onPolygonSearch: (polygon: Array<{ lat: number; lng: number }>) => void;
  searchLocation?: string;
}

export default function GoogleMapsPropertySearch({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  onBoundarySearch,
  onPolygonSearch,
  searchLocation
}: GoogleMapsPropertySearchProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const currentPolygonRef = useRef<google.maps.Polygon | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Google Maps API key is not configured');
        }

        const loader = new Loader({
          apiKey: apiKey,
          version: "weekly",
          libraries: ["drawing", "geometry", "places"]
        });

        await loader.load();
        initializeMap();
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError('Failed to load Google Maps. Please check your API key configuration.');
        setIsLoading(false);
      }
    };

    initGoogleMaps();
  }, []);

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to center of US
          setCurrentLocation({ lat: 39.8283, lng: -98.5795 });
        }
      );
    } else {
      setCurrentLocation({ lat: 39.8283, lng: -98.5795 });
    }
  }, []);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !currentLocation) return;

    try {
      // Create map
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: currentLocation,
        zoom: currentLocation.lat === 39.8283 ? 4 : 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: false,
        zoomControl: true,
      });

      // Initialize Drawing Manager
      drawingManagerRef.current = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#2196f3',
          fillOpacity: 0.1,
          strokeWeight: 3,
          strokeColor: '#2196f3',
          clickable: false,
          editable: true,
          zIndex: 1
        }
      });

      drawingManagerRef.current.setMap(googleMapRef.current);

      // Handle polygon completion
      google.maps.event.addListener(drawingManagerRef.current, 'polygoncomplete', (polygon: google.maps.Polygon) => {
        // Remove previous polygon
        if (currentPolygonRef.current) {
          currentPolygonRef.current.setMap(null);
        }
        
        currentPolygonRef.current = polygon;
        setDrawingMode(false);
        drawingManagerRef.current?.setDrawingMode(null);

        // Get polygon bounds for search
        const path = polygon.getPath();
        const bounds = new google.maps.LatLngBounds();
        const polygonPoints: Array<{ lat: number; lng: number }> = [];

        path.forEach((latLng) => {
          bounds.extend(latLng);
          polygonPoints.push({
            lat: latLng.lat(),
            lng: latLng.lng()
          });
        });

        // Trigger search callbacks
        onBoundarySearch({
          north: bounds.getNorthEast().lat(),
          south: bounds.getSouthWest().lat(),
          east: bounds.getNorthEast().lng(),
          west: bounds.getSouthWest().lng()
        });

        onPolygonSearch(polygonPoints);
      });

      // Add current location marker if available
      if (currentLocation.lat !== 39.8283) {
        new google.maps.Marker({
          position: currentLocation,
          map: googleMapRef.current,
          title: 'Your Location',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(40, 40)
          }
        });
      }

      setIsLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize Google Maps');
      setIsLoading(false);
    }
  }, [currentLocation, onBoundarySearch, onPolygonSearch]);

  // Initialize map when location is available
  useEffect(() => {
    if (currentLocation && window.google) {
      initializeMap();
    }
  }, [currentLocation, initializeMap]);

  // Update property markers when properties change
  useEffect(() => {
    if (!googleMapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add property markers
    properties.forEach((property) => {
      if (!property.latitude || !property.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: property.latitude, lng: property.longitude },
        map: googleMapRef.current,
        title: `${property.address} - ${property.city}`,
        icon: {
          url: selectedProperty?.id === property.id 
            ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            : 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new google.maps.Size(32, 32)
        }
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="width: 300px; padding: 10px;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${property.address}</h3>
            <p style="margin: 0 0 8px 0; color: #666;">${property.city}, ${property.state} ${property.zipCode}</p>
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #2196f3;">
              Price: $${(property.purchasePrice || property.marketValue).toLocaleString()}
            </p>
            <p style="margin: 0 0 8px 0; color: #28a745;">
              Est. Rent: $${property.estimatedRent.toLocaleString()}/mo
            </p>
            <p style="margin: 0 0 8px 0;">
              ROI: <span style="color: ${property.estimatedCOCReturn > 8 ? '#28a745' : property.estimatedCOCReturn > 5 ? '#ffc107' : '#dc3545'};">
                ${property.estimatedCOCReturn.toFixed(1)}%
              </span>
            </p>
            <p style="margin: 0; font-size: 12px; color: #666;">Click marker to view details</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Close other info windows
        markersRef.current.forEach(m => {
          (m as any).infoWindow?.close();
        });
        
        infoWindow.open(googleMapRef.current, marker);
        onPropertySelect(property);
      });

      // Store info window reference
      (marker as any).infoWindow = infoWindow;
      markersRef.current.push(marker);
    });

    // Fit bounds to show all properties
    if (markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(marker => bounds.extend(marker.getPosition()!));
      googleMapRef.current?.fitBounds(bounds);
    }
  }, [properties, selectedProperty, onPropertySelect]);

  const startDrawing = () => {
    if (drawingManagerRef.current) {
      setDrawingMode(true);
      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  };

  const clearDrawing = () => {
    if (currentPolygonRef.current) {
      currentPolygonRef.current.setMap(null);
      currentPolygonRef.current = null;
    }
    setDrawingMode(false);
    drawingManagerRef.current?.setDrawingMode(null);
  };

  const goToCurrentLocation = () => {
    if (googleMapRef.current && currentLocation && currentLocation.lat !== 39.8283) {
      googleMapRef.current.setCenter(currentLocation);
      googleMapRef.current.setZoom(15);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Please ensure your Google Maps API key is properly configured in the environment variables.
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        height: isFullscreen ? '100vh' : 600,
        width: '100%',
        overflow: 'hidden',
        borderRadius: isFullscreen ? 0 : 2,
        border: isFullscreen ? 'none' : '2px solid',
        borderColor: 'divider',
        boxShadow: isFullscreen ? 'none' : 2,
      }}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            zIndex: 1000
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6">Loading Google Maps...</Typography>
          </Box>
        </Box>
      )}

      {/* Map Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        <Paper sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={drawingMode ? "Drawing mode active" : "Draw search area"}>
              <Button
                variant={drawingMode ? "contained" : "outlined"}
                size="small"
                onClick={startDrawing}
                disabled={drawingMode}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <Search fontSize="small" />
              </Button>
            </Tooltip>
            
            <Tooltip title="Clear drawn area">
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={clearDrawing}
                disabled={!currentPolygonRef.current}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <Clear fontSize="small" />
              </Button>
            </Tooltip>
          </Box>
        </Paper>

        <Paper sx={{ p: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Tooltip title="Go to current location">
              <Button
                variant="outlined"
                size="small"
                onClick={goToCurrentLocation}
                disabled={!currentLocation || currentLocation.lat === 39.8283}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                <MyLocation fontSize="small" />
              </Button>
            </Tooltip>
            
            <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              <Button
                variant="outlined"
                size="small"
                onClick={toggleFullscreen}
                sx={{ minWidth: 'auto', px: 2 }}
              >
                {isFullscreen ? <FullscreenExit fontSize="small" /> : <Fullscreen fontSize="small" />}
              </Button>
            </Tooltip>
          </Box>
        </Paper>

        {/* Property Count */}
        {properties.length > 0 && (
          <Chip
            label={`${properties.length} properties`}
            color="primary"
            size="small"
            sx={{ alignSelf: 'flex-end' }}
          />
        )}
      </Box>

      {/* Drawing Mode Indicator */}
      {drawingMode && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000
          }}
        >
          <Alert severity="info" variant="outlined" sx={{ py: 0 }}>
            Click on the map to start drawing your search area
          </Alert>
        </Box>
      )}

      {/* Google Maps Container */}
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out'
        }} 
      />
    </Box>
  );
}
