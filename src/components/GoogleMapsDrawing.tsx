import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Chip,
  Badge,
  FormControlLabel,
  Switch,
  Slider,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Clear,
  Search,
  Edit,
  Rectangle,
  MyLocation,
  Brush,
  TouchApp,
  DeleteOutline,
  Create,
  PanTool,
  HexagonOutlined,
  Timeline,
  CenterFocusStrong
} from '@mui/icons-material';
import type { PropertyListing } from '../types/property';

interface GoogleMapsDrawingProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  onBoundarySearch: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onPolygonSearch: (polygon: Array<{ lat: number; lng: number }>) => void;
  searchLocation?: string;
}

type DrawingMode = 'none' | 'polygon' | 'rectangle' | 'circle' | 'polyline';

// Note: This requires Google Maps API key in environment variables
// Add to your .env.local: VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

export default function GoogleMapsDrawing({
  properties,
  selectedProperty,
  onPropertySelect,
  onBoundarySearch,
  onPolygonSearch,
  searchLocation
}: GoogleMapsDrawingProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const drawingManagerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeOverlays, setActiveOverlays] = useState<any[]>([]);
  
  const [drawingOptions, setDrawingOptions] = useState({
    fillColor: '#2196f3',
    fillOpacity: 0.2,
    strokeColor: '#2196f3',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    clickable: true,
    draggable: true,
    editable: true
  });

  // Load Google Maps API
  useEffect(() => {
    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!googleMapsApiKey) {
      setLocationError('Google Maps API key not configured. Add VITE_GOOGLE_MAPS_API_KEY to your environment variables.');
      return;
    }

    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    window.initGoogleMaps = () => {
      setIsLoaded(true);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=drawing,places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Get current location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Location access denied. Using default location.');
          setCurrentLocation({ lat: 39.8283, lng: -98.5795 });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      setLocationError('Geolocation not supported. Using default location.');
      setCurrentLocation({ lat: 39.8283, lng: -98.5795 });
    }
  }, []);

  // Initialize Google Maps when loaded and location is available
  useEffect(() => {
    if (isLoaded && currentLocation && mapRef.current && !mapInstanceRef.current) {
      const { google } = window;
      
      // Initialize map
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: currentLocation,
        zoom: currentLocation.lat === 39.8283 ? 4 : 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.TOP_RIGHT,
          mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.SATELLITE,
            google.maps.MapTypeId.HYBRID,
            google.maps.MapTypeId.TERRAIN
          ]
        },
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true
      });

      // Initialize Drawing Manager
      drawingManagerRef.current = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false, // We'll use custom controls
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            google.maps.drawing.OverlayType.POLYGON,
            google.maps.drawing.OverlayType.RECTANGLE,
            google.maps.drawing.OverlayType.CIRCLE,
            google.maps.drawing.OverlayType.POLYLINE
          ]
        },
        polygonOptions: drawingOptions,
        rectangleOptions: drawingOptions,
        circleOptions: drawingOptions,
        polylineOptions: {
          ...drawingOptions,
          fillColor: null,
          fillOpacity: 0
        }
      });

      drawingManagerRef.current.setMap(mapInstanceRef.current);

      // Add event listeners for drawing completion
      google.maps.event.addListener(drawingManagerRef.current, 'overlaycomplete', (event: any) => {
        console.log('Drawing completed:', event.type, event.overlay);
        
        overlaysRef.current.push(event.overlay);
        setActiveOverlays([...overlaysRef.current]);
        
        // Process the drawn shape for property search
        processDrawnShape(event);
        
        // Reset drawing mode after completion
        setDrawingMode('none');
        drawingManagerRef.current.setDrawingMode(null);
      });

      // Add current location marker if we have user's actual location
      if (currentLocation.lat !== 39.8283 && currentLocation.lng !== -98.5795) {
        new google.maps.Marker({
          position: currentLocation,
          map: mapInstanceRef.current,
          title: 'Your Current Location',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new google.maps.Size(40, 40)
          },
          animation: google.maps.Animation.DROP
        });
      }
    }
  }, [isLoaded, currentLocation]);

  // Update drawing mode
  useEffect(() => {
    if (drawingManagerRef.current && window.google) {
      const { google } = window;
      
      let mode = null;
      switch (drawingMode) {
        case 'polygon':
          mode = google.maps.drawing.OverlayType.POLYGON;
          break;
        case 'rectangle':
          mode = google.maps.drawing.OverlayType.RECTANGLE;
          break;
        case 'circle':
          mode = google.maps.drawing.OverlayType.CIRCLE;
          break;
        case 'polyline':
          mode = google.maps.drawing.OverlayType.POLYLINE;
          break;
        default:
          mode = null;
      }
      
      drawingManagerRef.current.setDrawingMode(mode);
    }
  }, [drawingMode]);

  // Update drawing options
  useEffect(() => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setOptions({
        polygonOptions: drawingOptions,
        rectangleOptions: drawingOptions,
        circleOptions: drawingOptions,
        polylineOptions: {
          ...drawingOptions,
          fillColor: null,
          fillOpacity: 0
        }
      });
    }
  }, [drawingOptions]);

  // Process drawn shape for property search
  const processDrawnShape = (event: any) => {
    const { type, overlay } = event;
    let bounds = null;
    let polygon = null;

    if (type === window.google.maps.drawing.OverlayType.POLYGON) {
      const path = overlay.getPath();
      const coordinates = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const coord = path.getAt(i);
        coordinates.push({ lat: coord.lat(), lng: coord.lng() });
      }
      
      polygon = coordinates;
      
      // Calculate bounds
      const lats = coordinates.map(c => c.lat);
      const lngs = coordinates.map(c => c.lng);
      bounds = {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs)
      };
    } else if (type === window.google.maps.drawing.OverlayType.RECTANGLE) {
      const rectBounds = overlay.getBounds();
      bounds = {
        north: rectBounds.getNorthEast().lat(),
        south: rectBounds.getSouthWest().lat(),
        east: rectBounds.getNorthEast().lng(),
        west: rectBounds.getSouthWest().lng()
      };
    } else if (type === window.google.maps.drawing.OverlayType.CIRCLE) {
      const center = overlay.getCenter();
      const radius = overlay.getRadius();
      
      // Convert radius to lat/lng bounds (approximate)
      const latOffset = radius / 111000; // meters to degrees
      const lngOffset = radius / (111000 * Math.cos(center.lat() * Math.PI / 180));
      
      bounds = {
        north: center.lat() + latOffset,
        south: center.lat() - latOffset,
        east: center.lng() + lngOffset,
        west: center.lng() - lngOffset
      };
    }

    if (bounds) {
      onBoundarySearch(bounds);
      if (polygon) {
        onPolygonSearch(polygon);
      }
    }
  };

  // Update property markers
  useEffect(() => {
    if (mapInstanceRef.current && window.google) {
      const { google } = window;
      
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      properties.forEach((property, index) => {
        if (property.latitude && property.longitude) {
          const marker = new google.maps.Marker({
            position: { lat: property.latitude, lng: property.longitude },
            map: mapInstanceRef.current,
            title: property.address,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="60" height="30" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="56" height="26" rx="4" ry="4" 
                        fill="white" stroke="#2196f3" stroke-width="2"/>
                  <text x="30" y="18" text-anchor="middle" font-family="Arial, sans-serif" 
                        font-size="12" font-weight="bold" fill="#2196f3">
                    $${Math.round((property.purchasePrice || 0) / 1000)}K
                  </text>
                </svg>
              `),
              scaledSize: new google.maps.Size(60, 30),
              anchor: new google.maps.Point(30, 30)
            }
          });

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="width: 250px; font-family: Arial, sans-serif;">
                <h4 style="margin: 0 0 8px 0;">${property.address}</h4>
                <p style="margin: 0 0 4px 0; color: #666;">${property.city}, ${property.state}</p>
                <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #2196f3;">
                  $${property.purchasePrice?.toLocaleString()}
                </p>
                <div style="display: flex; gap: 12px; color: #666; font-size: 14px;">
                  <span>${property.bedrooms} beds</span>
                  <span>${property.bathrooms} baths</span>
                  <span>${property.squareFootage?.toLocaleString()} sq ft</span>
                </div>
                <p style="margin: 8px 0 0 0; color: #28a745; font-weight: bold;">
                  Monthly Rent: $${property.monthlyRent?.toLocaleString()}
                </p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
            onPropertySelect(property);
          });

          markersRef.current.push(marker);
        }
      });

      // Fit bounds to show all markers
      if (markersRef.current.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        markersRef.current.forEach(marker => bounds.extend(marker.getPosition()));
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  }, [properties]);

  // Clear all drawings
  const clearAllDrawings = () => {
    overlaysRef.current.forEach(overlay => overlay.setMap(null));
    overlaysRef.current = [];
    setActiveOverlays([]);
    setDrawingMode('none');
  };

  // Center on current location
  const centerOnLocation = () => {
    if (mapInstanceRef.current && currentLocation) {
      mapInstanceRef.current.setCenter(currentLocation);
      mapInstanceRef.current.setZoom(15);
    }
  };

  if (locationError && !isLoaded) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        <Typography variant="h6">Google Maps Configuration Error</Typography>
        <Typography>{locationError}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          To use Google Maps drawing tools, add your Google Maps API key to your environment variables:
          <br />
          <code>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code>
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Google Maps Drawing Controls */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Brush color="primary" />
              Google Maps Drawing Tools
            </Typography>
            
            {properties.length > 0 && (
              <Badge badgeContent={properties.length} color="primary" max={999}>
                <Chip label="Properties Found" color="primary" variant="outlined" size="small" />
              </Badge>
            )}

            {activeOverlays.length > 0 && (
              <Badge badgeContent={activeOverlays.length} color="secondary" max={99}>
                <Chip label="Search Areas" color="secondary" variant="outlined" size="small" />
              </Badge>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Drawing Mode Controls */}
            <ToggleButtonGroup
              value={drawingMode}
              exclusive
              onChange={(_, newMode) => {
                setDrawingMode(newMode || 'none');
              }}
              size="small"
            >
              <ToggleButton value="none">
                <Tooltip title="Pan Mode">
                  <PanTool />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="polygon">
                <Tooltip title="Draw Polygon">
                  <HexagonOutlined />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="rectangle">
                <Tooltip title="Draw Rectangle">
                  <Rectangle />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="circle">
                <Tooltip title="Draw Circle">
                  <Create />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="polyline">
                <Tooltip title="Draw Line">
                  <Timeline />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            <Tooltip title="Clear All Drawings">
              <IconButton onClick={clearAllDrawings} size="small" color="error">
                <Clear />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Center on My Location">
              <IconButton onClick={centerOnLocation} size="small" color="primary">
                <MyLocation />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Drawing Options */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" gutterBottom>
              Stroke Width: {drawingOptions.strokeWeight}px
            </Typography>
            <Slider
              value={drawingOptions.strokeWeight}
              onChange={(_, value) => setDrawingOptions(prev => ({ ...prev, strokeWeight: value as number }))}
              min={1}
              max={8}
              size="small"
              sx={{ width: 100 }}
            />
          </Box>
          
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" gutterBottom>
              Fill Opacity: {Math.round(drawingOptions.fillOpacity * 100)}%
            </Typography>
            <Slider
              value={drawingOptions.fillOpacity}
              onChange={(_, value) => setDrawingOptions(prev => ({ ...prev, fillOpacity: value as number }))}
              min={0}
              max={0.5}
              step={0.1}
              size="small"
              sx={{ width: 100 }}
            />
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Color</InputLabel>
            <Select
              value={drawingOptions.fillColor}
              onChange={(e) => setDrawingOptions(prev => ({ 
                ...prev, 
                fillColor: e.target.value,
                strokeColor: e.target.value 
              }))}
              label="Color"
            >
              <MenuItem value="#2196f3">Blue</MenuItem>
              <MenuItem value="#4caf50">Green</MenuItem>
              <MenuItem value="#ff9800">Orange</MenuItem>
              <MenuItem value="#f44336">Red</MenuItem>
              <MenuItem value="#9c27b0">Purple</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={drawingOptions.editable}
                onChange={(e) => setDrawingOptions(prev => ({ ...prev, editable: e.target.checked }))}
                size="small"
              />
            }
            label="Editable"
          />
        </Box>
        
        {/* Instructions */}
        {drawingMode !== 'none' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Drawing Mode Active:</strong> Click on the map to start drawing your search area.
              {drawingMode === 'polygon' && ' Click multiple points to create a custom shape, then click the first point to close.'}
              {drawingMode === 'rectangle' && ' Click and drag to create a rectangular search area.'}
              {drawingMode === 'circle' && ' Click and drag to create a circular search area.'}
              {drawingMode === 'polyline' && ' Click multiple points to draw a line path.'}
            </Typography>
          </Alert>
        )}
      </Paper>
      
      {/* Google Maps Container */}
      <Box
        ref={mapRef}
        sx={{
          height: 600,
          width: '100%',
          border: '2px solid',
          borderColor: drawingMode !== 'none' ? 'primary.main' : 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 2,
          '& .gm-style': {
            fontFamily: 'inherit'
          }
        }}
      />

      {/* Loading State */}
      {!isLoaded && (
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <Typography>Loading Google Maps...</Typography>
        </Box>
      )}
    </Box>
  );
}
