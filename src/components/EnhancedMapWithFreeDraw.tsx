import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore - leaflet-freedraw doesn't have proper TypeScript types
import FreeDraw, { CREATE, EDIT, DELETE, APPEND, NONE, ALL } from 'leaflet-freedraw';
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
  Alert
} from '@mui/material';
import {
  CropFree,
  Clear,
  Search,
  Edit,
  Rectangle,
  Gesture,
  MyLocation,
  FilterList,
  Brush,
  TouchApp,
  DeleteOutline,
  Undo,
  Settings,
  Visibility,
  Create,
  PanTool
} from '@mui/icons-material';
import type { PropertyListing } from '../types/property';

interface EnhancedMapWithFreeDrawProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  onBoundarySearch: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onPolygonSearch: (polygon: Array<{ lat: number; lng: number }>) => void;
  searchLocation?: string;
}

type DrawingMode = 'none' | 'create' | 'edit' | 'delete';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function EnhancedMapWithFreeDraw({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  onBoundarySearch,
  onPolygonSearch,
  searchLocation
}: EnhancedMapWithFreeDrawProps) {
  const mapRef = useRef<L.Map | null>(null);
  const freeDrawRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingSettings, setDrawingSettings] = useState({
    strokeWidth: 3,
    smoothFactor: 0.3,
    mergePolygons: true,
    showHelp: true
  });
  const [activePolygons, setActivePolygons] = useState<any[]>([]);
  const [polygonCount, setPolygonCount] = useState(0);

  // Initialize map and FreeDraw
  useEffect(() => {
    if (!mapRef.current) {
      // Create map
      mapRef.current = L.map('enhanced-freedraw-map', {
        center: [37.3541, -121.9552], // Santa Clara, CA default
        zoom: 10,
        zoomControl: true,
        doubleClickZoom: false, // Disable to prevent conflicts with FreeDraw
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Initialize FreeDraw with comprehensive options
      freeDrawRef.current = new FreeDraw({
        mode: NONE, // Start with no drawing mode
        smoothFactor: drawingSettings.smoothFactor,
        strokeWidth: drawingSettings.strokeWidth,
        mergePolygons: drawingSettings.mergePolygons,
        concavePolygon: true, // Enable concave polygon creation
        simplifyFactor: 1.1, // Simplify polygon complexity
        elbowDistance: 10, // Distance for edge detection
        maximumPolygons: 10, // Limit maximum polygons
        notifyAfterEditExit: false,
        leaveModeAfterCreate: false
      });

      // Add FreeDraw to map
      mapRef.current.addLayer(freeDrawRef.current);

      // Listen for FreeDraw events
      freeDrawRef.current.on('markers', (event: any) => {
        console.log('FreeDraw event:', event.eventType, event.latLngs);
        
        // Update polygon count
        setPolygonCount(freeDrawRef.current.size());
        
        // Store active polygons
        setActivePolygons(freeDrawRef.current.all());
        
        // Process the drawn areas for property search
        if (event.latLngs && event.latLngs.length > 0) {
          event.latLngs.forEach((polygonPoints: any[]) => {
            if (polygonPoints.length > 0) {
              // Convert to our format
              const searchPolygon = polygonPoints.map((point: any) => ({
                lat: point.lat,
                lng: point.lng
              }));
              
              // Calculate bounding box
              const lats = searchPolygon.map(p => p.lat);
              const lngs = searchPolygon.map(p => p.lng);
              const bounds = {
                north: Math.max(...lats),
                south: Math.min(...lats),
                east: Math.max(...lngs),
                west: Math.min(...lngs)
              };
              
              // Trigger search callbacks
              onPolygonSearch(searchPolygon);
              onBoundarySearch(bounds);
            }
          });
        }
        
        // Update drawing state
        setIsDrawing(false);
      });

      // Listen for mode changes
      freeDrawRef.current.on('mode', (event: any) => {
        console.log('FreeDraw mode changed:', event.mode);
        updateDrawingModeFromFreeDraw(event.mode);
      });

      // Setup escape key to cancel drawing
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && freeDrawRef.current) {
          freeDrawRef.current.cancel();
          setDrawingMode('none');
          setIsDrawing(false);
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      // Cleanup function
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, []);

  // Update FreeDraw mode when drawing mode changes
  useEffect(() => {
    if (freeDrawRef.current) {
      let mode = NONE;
      
      switch (drawingMode) {
        case 'create':
          mode = CREATE;
          setIsDrawing(true);
          break;
        case 'edit':
          mode = EDIT;
          break;
        case 'delete':
          mode = DELETE;
          break;
        default:
          mode = NONE;
          setIsDrawing(false);
          break;
      }
      
      freeDrawRef.current.mode(mode);
    }
  }, [drawingMode]);

  // Update FreeDraw settings when they change
  useEffect(() => {
    if (freeDrawRef.current) {
      // Update stroke width by recreating FreeDraw with new options
      const currentMode = freeDrawRef.current.mode();
      const currentPolygons = freeDrawRef.current.all();
      
      // Remove old FreeDraw
      if (mapRef.current) {
        mapRef.current.removeLayer(freeDrawRef.current);
      }
      
      // Create new FreeDraw with updated settings
      freeDrawRef.current = new FreeDraw({
        mode: currentMode,
        smoothFactor: drawingSettings.smoothFactor,
        strokeWidth: drawingSettings.strokeWidth,
        mergePolygons: drawingSettings.mergePolygons,
        concavePolygon: true,
        simplifyFactor: 1.1,
        elbowDistance: 10,
        maximumPolygons: 10,
        notifyAfterEditExit: false,
        leaveModeAfterCreate: false
      });
      
      // Add back to map
      if (mapRef.current) {
        mapRef.current.addLayer(freeDrawRef.current);
      }
      
      // Restore event listeners
      freeDrawRef.current.on('markers', (event: any) => {
        setPolygonCount(freeDrawRef.current.size());
        setActivePolygons(freeDrawRef.current.all());
        
        if (event.latLngs && event.latLngs.length > 0) {
          event.latLngs.forEach((polygonPoints: any[]) => {
            if (polygonPoints.length > 0) {
              const searchPolygon = polygonPoints.map((point: any) => ({
                lat: point.lat,
                lng: point.lng
              }));
              
              const lats = searchPolygon.map(p => p.lat);
              const lngs = searchPolygon.map(p => p.lng);
              const bounds = {
                north: Math.max(...lats),
                south: Math.min(...lats),
                east: Math.max(...lngs),
                west: Math.min(...lngs)
              };
              
              onPolygonSearch(searchPolygon);
              onBoundarySearch(bounds);
            }
          });
        }
        
        setIsDrawing(false);
      });
    }
  }, [drawingSettings]);

  const updateDrawingModeFromFreeDraw = (mode: number) => {
    if (mode & CREATE) {
      setDrawingMode('create');
    } else if (mode & EDIT) {
      setDrawingMode('edit');
    } else if (mode & DELETE) {
      setDrawingMode('delete');
    } else {
      setDrawingMode('none');
    }
  };

  const clearAllDrawings = () => {
    if (freeDrawRef.current) {
      freeDrawRef.current.clear();
      setActivePolygons([]);
      setPolygonCount(0);
      setDrawingMode('none');
      setIsDrawing(false);
    }
  };

  // Update property markers when properties change
  useEffect(() => {
    if (mapRef.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapRef.current?.removeLayer(marker);
      });
      markersRef.current = [];

      // Group nearby properties for cluster display
      const propertyGroups = groupPropertiesByLocation(properties);

      // Add new markers with Zillow-style design
      propertyGroups.forEach((group) => {
        if (group.properties.length === 1) {
          const property = group.properties[0];
          if (property.latitude && property.longitude) {
            // Single property marker with price
            const priceLabel = `$${(property.purchasePrice || 0).toLocaleString()}`;
            
            const customIcon = L.divIcon({
              className: 'property-price-marker',
              html: `<div style="
                background: white;
                border: 2px solid #2196f3;
                border-radius: 6px;
                padding: 2px 6px;
                font-size: 12px;
                font-weight: bold;
                color: #2196f3;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                white-space: nowrap;
              ">${priceLabel}</div>`,
              iconSize: [60, 24],
              iconAnchor: [30, 24],
              popupAnchor: [0, -24]
            });

            const marker = L.marker([property.latitude, property.longitude], { icon: customIcon })
              .bindPopup(`
                <div style="width: 250px;">
                  <img src="${getPropertyImage(property, 0)}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
                  <h4 style="margin: 0 0 8px 0;">${property.address}</h4>
                  <p style="margin: 0 0 4px 0; color: #666;">${property.city}, ${property.state}</p>
                  <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; color: #2196f3;">$${property.purchasePrice?.toLocaleString()}</p>
                  <div style="display: flex; gap: 12px; color: #666; font-size: 14px;">
                    <span>${property.bedrooms} beds</span>
                    <span>${property.bathrooms} baths</span>
                    <span>${property.squareFootage?.toLocaleString()} sq ft</span>
                  </div>
                  <p style="margin: 8px 0 0 0; color: #28a745; font-weight: bold;">Monthly Rent: $${property.monthlyRent?.toLocaleString()}</p>
                </div>
              `, { maxWidth: 300 });
            
            if (mapRef.current) {
              marker.addTo(mapRef.current);
              markersRef.current.push(marker);
            }
          }
        } else {
          // Cluster marker showing property count
          const clusterIcon = L.divIcon({
            className: 'property-cluster-marker',
            html: `<div style="
              background: #2196f3;
              border: 3px solid white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: bold;
              color: white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ">${group.properties.length}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
          });

          const marker = L.marker([group.centerLat, group.centerLng], { icon: clusterIcon })
            .bindPopup(`
              <div style="width: 200px;">
                <h4>${group.properties.length} Properties in this area</h4>
                <p>Price range: $${Math.min(...group.properties.map(p => p.purchasePrice || 0)).toLocaleString()} - 
                $${Math.max(...group.properties.map(p => p.purchasePrice || 0)).toLocaleString()}</p>
              </div>
            `);
          
          if (mapRef.current) {
            marker.addTo(mapRef.current);
            markersRef.current.push(marker);
          }
        }
      });
    }
  }, [properties]);

  // Helper function to group nearby properties
  const groupPropertiesByLocation = (properties: PropertyListing[]) => {
    const groups: Array<{
      centerLat: number;
      centerLng: number;
      properties: PropertyListing[];
    }> = [];

    properties.forEach(property => {
      if (!property.latitude || !property.longitude) return;

      // Find existing group within 500m
      const existingGroup = groups.find(group => {
        const distance = getDistance(
          property.latitude!, property.longitude!,
          group.centerLat, group.centerLng
        );
        return distance < 500; // 500 meters threshold
      });

      if (existingGroup) {
        existingGroup.properties.push(property);
        // Update center point
        const avgLat = existingGroup.properties.reduce((sum, p) => sum + (p.latitude || 0), 0) / existingGroup.properties.length;
        const avgLng = existingGroup.properties.reduce((sum, p) => sum + (p.longitude || 0), 0) / existingGroup.properties.length;
        existingGroup.centerLat = avgLat;
        existingGroup.centerLng = avgLng;
      } else {
        groups.push({
          centerLat: property.latitude,
          centerLng: property.longitude,
          properties: [property]
        });
      }
    });

    return groups;
  };

  // Helper function to calculate distance between two points
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Helper function to get property image
  const getPropertyImage = (property: PropertyListing, index: number) => {
    const propertyId = property.id || `prop-${index}`;
    const seed = propertyId.slice(-3);
    const imageId = parseInt(seed, 36) % 1000 + 100;
    return `https://picsum.photos/300/200?random=${imageId}`;
  };

  // Handle search location marker
  useEffect(() => {
    if (searchLocation && mapRef.current) {
      // This would require geocoding - simplified for now
      const defaultLocation = L.latLng(37.3541, -121.9552);
      
      if (searchMarkerRef.current) {
        mapRef.current.removeLayer(searchMarkerRef.current);
      }
      
      searchMarkerRef.current = L.marker(defaultLocation, {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        })
      })
      .bindPopup(`Search Location: ${searchLocation}`)
      
      if (mapRef.current) {
        searchMarkerRef.current.addTo(mapRef.current);
        mapRef.current.setView(defaultLocation, 12);
      }
    }
  }, [searchLocation]);

  return (
    <Box>
      {/* FreeDraw Controls Toolbar */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Brush color="primary" />
              Free-Hand Drawing Map Search
            </Typography>
            
            {properties.length > 0 && (
              <Badge 
                badgeContent={properties.length} 
                color="primary" 
                max={999}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    height: '20px',
                    minWidth: '20px'
                  }
                }}
              >
                <Chip 
                  label="Properties Found" 
                  color="primary" 
                  variant="outlined"
                  size="small"
                />
              </Badge>
            )}

            {polygonCount > 0 && (
              <Badge 
                badgeContent={polygonCount} 
                color="secondary" 
                max={99}
              >
                <Chip 
                  label="Search Areas" 
                  color="secondary" 
                  variant="outlined"
                  size="small"
                />
              </Badge>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* FreeDraw Mode Controls */}
            <ToggleButtonGroup
              value={drawingMode}
              exclusive
              onChange={(_, newMode) => {
                if (newMode !== null) {
                  setDrawingMode(newMode);
                }
              }}
              size="small"
            >
              <ToggleButton value="none">
                <Tooltip title="Pan Mode (No Drawing)">
                  <PanTool />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="create">
                <Tooltip title="Free-Hand Draw Mode">
                  <Create />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="edit">
                <Tooltip title="Edit Existing Areas">
                  <Edit />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="delete">
                <Tooltip title="Delete Areas">
                  <DeleteOutline />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            {/* Action Controls */}
            <Tooltip title="Clear All Drawings">
              <IconButton 
                onClick={clearAllDrawings} 
                size="small" 
                color="error"
                disabled={polygonCount === 0}
              >
                <Clear />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Center Map on Properties">
              <IconButton 
                onClick={() => {
                  if (mapRef.current && properties.length > 0 && markersRef.current.length > 0) {
                    const group = L.featureGroup(markersRef.current);
                    mapRef.current.fitBounds(group.getBounds().pad(0.1));
                  }
                }}
                size="small" 
                color="primary"
              >
                <MyLocation />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Drawing Instructions */}
        {drawingMode === 'create' && (
          <Alert severity="info" icon={<TouchApp />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Free-Hand Drawing Mode:</strong> Click and drag to draw custom search areas. 
              Press <strong>Escape</strong> to cancel current drawing.
            </Typography>
          </Alert>
        )}
        
        {drawingMode === 'edit' && (
          <Alert severity="warning" icon={<Edit />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Edit Mode:</strong> Click on existing search areas to modify their shape by dragging edge points.
            </Typography>
          </Alert>
        )}
        
        {drawingMode === 'delete' && (
          <Alert severity="error" icon={<DeleteOutline />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Delete Mode:</strong> Click on any search area to remove it from the map.
            </Typography>
          </Alert>
        )}

        {drawingMode === 'none' && polygonCount > 0 && (
          <Alert severity="success" icon={<Search />} sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Pan Mode:</strong> {polygonCount} search area(s) active. Properties within these areas are being searched.
            </Typography>
          </Alert>
        )}

        {/* Drawing Settings */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" gutterBottom>
              Stroke Width: {drawingSettings.strokeWidth}px
            </Typography>
            <Slider
              value={drawingSettings.strokeWidth}
              onChange={(_, value) => setDrawingSettings(prev => ({ ...prev, strokeWidth: value as number }))}
              min={1}
              max={8}
              step={1}
              size="small"
              sx={{ width: 100 }}
            />
          </Box>
          
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" gutterBottom>
              Smoothing: {Math.round(drawingSettings.smoothFactor * 100)}%
            </Typography>
            <Slider
              value={drawingSettings.smoothFactor}
              onChange={(_, value) => setDrawingSettings(prev => ({ ...prev, smoothFactor: value as number }))}
              min={0}
              max={1}
              step={0.1}
              size="small"
              sx={{ width: 100 }}
            />
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={drawingSettings.mergePolygons}
                onChange={(e) => setDrawingSettings(prev => ({ ...prev, mergePolygons: e.target.checked }))}
                size="small"
              />
            }
            label="Merge Overlapping Areas"
          />
        </Box>
      </Paper>
      
      {/* Enhanced Map Container with FreeDraw */}
      <Box
        id="enhanced-freedraw-map"
        sx={{
          height: 600,
          width: '100%',
          border: '2px solid',
          borderColor: isDrawing ? 'primary.main' : 'divider',
          borderRadius: 2,
          cursor: drawingMode === 'create' ? 'crosshair' : 'default',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 2,
          '& .leaflet-container': {
            fontFamily: 'inherit'
          },
          '& .free-draw': {
            '& path': {
              stroke: '#2196f3',
              strokeWidth: drawingSettings.strokeWidth,
              fill: 'rgba(33, 150, 243, 0.1)',
              strokeOpacity: 0.8
            }
          },
          '& .property-price-marker': {
            animation: 'fadeIn 0.3s ease-in'
          },
          '& .property-cluster-marker': {
            animation: 'bounceIn 0.5s ease-out'
          }
        }}
      />

      {/* Map Legend */}
      <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" gutterBottom>
          Map Legend & Controls
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 16, 
                height: 16, 
                bgcolor: '#2196f3', 
                border: '2px solid white',
                borderRadius: '50%',
                boxShadow: 1
              }} 
            />
            <Typography variant="body2">Property Cluster</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                bgcolor: 'white',
                border: '2px solid #2196f3',
                borderRadius: 1,
                px: 1,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 'bold',
                color: '#2196f3'
              }}
            >
              $425K
            </Box>
            <Typography variant="body2">Individual Property</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 20, 
                height: 20, 
                border: '2px solid #2196f3',
                borderRadius: 1,
                bgcolor: 'rgba(33, 150, 243, 0.1)'
              }} 
            />
            <Typography variant="body2">Free-Hand Search Area</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Press <strong>ESC</strong> to cancel drawing
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Map Statistics */}
      {properties.length > 0 && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'primary.50' }}>
          <Typography variant="subtitle2" color="primary.main" gutterBottom>
            Search Results Summary
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="h6" color="primary.main">
                {properties.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Properties Found
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="primary.main">
                {polygonCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Search Areas
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="primary.main">
                ${Math.min(...properties.map(p => p.purchasePrice || 0)).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lowest Price
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="primary.main">
                ${Math.max(...properties.map(p => p.purchasePrice || 0)).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Highest Price
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" color="primary.main">
                ${Math.round(properties.reduce((sum, p) => sum + (p.purchasePrice || 0), 0) / properties.length).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Price
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
