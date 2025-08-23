import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import {
  Box,
  Typography,
  Paper,
  Button,
  Fab,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Chip,
  Badge
} from '@mui/material';
import {
  CropFree,
  Clear,
  Search,
  Edit,
  Rectangle,
  Gesture,
  MyLocation,
  Layers,
  FilterList,
  Undo,
  Redo
} from '@mui/icons-material';
import type { PropertyListing } from '../types/property';

interface EnhancedMapWithDrawingProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  onBoundarySearch: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onPolygonSearch: (polygon: Array<{ lat: number; lng: number }>) => void;
  searchLocation?: string;
}

type DrawingMode = 'none' | 'rectangle' | 'polygon';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function EnhancedMapWithDrawing({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  onBoundarySearch,
  onPolygonSearch,
  searchLocation
}: EnhancedMapWithDrawingProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const rectangleRef = useRef<L.Rectangle | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const drawingLineRef = useRef<L.Polyline | null>(null);
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup>(new L.FeatureGroup());
  
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState<{ lat: number; lng: number } | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [currentBounds, setCurrentBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [mapFilters, setMapFilters] = useState({
    minPrice: 0,
    maxPrice: 5000000,
    propertyTypes: ['single-family', 'condo', 'townhouse']
  });
  const [showPropertyCount, setShowPropertyCount] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('enhanced-map', {
        center: [37.3541, -121.9552], // Santa Clara, CA default
        zoom: 10,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Add the drawn items layer
      if (mapRef.current) {
        mapRef.current.addLayer(drawnItemsRef.current);
      }

      // Initialize Leaflet Draw
      const drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: {
          polygon: {
            allowIntersection: false,
            drawError: {
              color: '#e1e100',
              message: '<strong>Oh snap!</strong> you can\'t draw that!'
            },
            shapeOptions: {
              color: '#2196f3',
              weight: 3,
              opacity: 0.8,
              fillOpacity: 0.2
            }
          },
          rectangle: {
            shapeOptions: {
              color: '#2196f3',
              weight: 3,
              opacity: 0.8,
              fillOpacity: 0.2
            }
          },
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false
        },
        edit: {
          featureGroup: drawnItemsRef.current
        }
      });

      if (mapRef.current) {
        mapRef.current.addControl(drawControl);
        drawControlRef.current = drawControl;
      }

      // Handle drawing events
      mapRef.current.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        drawnItemsRef.current.addLayer(layer);
        
        if (e.layerType === 'polygon') {
          const points = layer.getLatLngs()[0].map((latlng: L.LatLng) => ({
            lat: latlng.lat,
            lng: latlng.lng
          }));
          onPolygonSearch(points);
          
          // Also calculate bounding box
          const bounds = layer.getBounds();
          const boundingBox = {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          };
          onBoundarySearch(boundingBox);
        } else if (e.layerType === 'rectangle') {
          const bounds = layer.getBounds();
          const boundingBox = {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          };
          setCurrentBounds(boundingBox);
          onBoundarySearch(boundingBox);
        }
      });

      mapRef.current.on(L.Draw.Event.DELETED, () => {
        setCurrentBounds(null);
        setPolygonPoints([]);
      });

      // Handle manual drawing interactions for custom drawing
      mapRef.current.on('click', handleMapClick);
      mapRef.current.on('mousemove', handleMouseMove);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (drawingMode === 'rectangle') {
      if (!isDrawing) {
        // Start rectangle drawing
        setIsDrawing(true);
        setDrawingStart({ lat: e.latlng.lat, lng: e.latlng.lng });
      } else {
        // Finish rectangle drawing
        if (drawingStart) {
          const bounds = {
            north: Math.max(drawingStart.lat, e.latlng.lat),
            south: Math.min(drawingStart.lat, e.latlng.lat),
            east: Math.max(drawingStart.lng, e.latlng.lng),
            west: Math.min(drawingStart.lng, e.latlng.lng)
          };
          
          setCurrentBounds(bounds);
          onBoundarySearch(bounds);
          setIsDrawing(false);
          setDrawingStart(null);
        }
      }
    } else if (drawingMode === 'polygon') {
      if (!isDrawing) {
        // Start polygon drawing
        setIsDrawing(true);
        const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPolygonPoints([newPoint]);
        
        // Create initial drawing line
        if (mapRef.current) {
          if (drawingLineRef.current) {
            mapRef.current.removeLayer(drawingLineRef.current);
          }
          drawingLineRef.current = L.polyline([e.latlng], {
            color: '#2196f3',
            weight: 3,
            opacity: 0.8
          }).addTo(mapRef.current);
        }
      } else {
        // Add point to polygon
        const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPolygonPoints(prev => [...prev, newPoint]);
        
        // Update drawing line
        if (drawingLineRef.current && mapRef.current) {
          const latLngs = [...polygonPoints, newPoint].map(p => L.latLng(p.lat, p.lng));
          drawingLineRef.current.setLatLngs(latLngs);
        }
      }
    } else if (!drawingMode || drawingMode === 'none') {
      // Handle property selection
      const clickedProperty = properties.find(prop => {
        if (prop.latitude && prop.longitude) {
          const distance = mapRef.current?.distance(
            e.latlng,
            L.latLng(prop.latitude, prop.longitude)
          );
          return distance && distance < 1000; // Within 1km
        }
        return false;
      });
      
      if (clickedProperty) {
        onPropertySelect(clickedProperty);
      }
    }
  };

  const handleMouseMove = (e: L.LeafletMouseEvent) => {
    if (drawingMode === 'rectangle' && isDrawing && drawingStart && mapRef.current) {
      // Update rectangle preview
      if (rectangleRef.current) {
        mapRef.current.removeLayer(rectangleRef.current);
      }
      
      const bounds = L.latLngBounds([
        L.latLng(Math.min(drawingStart.lat, e.latlng.lat), Math.min(drawingStart.lng, e.latlng.lng)),
        L.latLng(Math.max(drawingStart.lat, e.latlng.lat), Math.max(drawingStart.lng, e.latlng.lng))
      ]);
      
      rectangleRef.current = L.rectangle(bounds, {
        color: '#2196f3',
        fillColor: '#2196f3',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(mapRef.current);
    } else if (drawingMode === 'polygon' && isDrawing && polygonPoints.length > 0 && mapRef.current) {
      // Update drawing line preview
      if (drawingLineRef.current) {
        const latLngs = [...polygonPoints, { lat: e.latlng.lat, lng: e.latlng.lng }].map(p => L.latLng(p.lat, p.lng));
        drawingLineRef.current.setLatLngs(latLngs);
      }
    }
  };

  const finishPolygonDrawing = () => {
    if (polygonPoints.length >= 3 && mapRef.current) {
      // Clear drawing line
      if (drawingLineRef.current) {
        mapRef.current.removeLayer(drawingLineRef.current);
        drawingLineRef.current = null;
      }
      
      // Create final polygon
      const latLngs = polygonPoints.map(p => L.latLng(p.lat, p.lng));
      if (polygonRef.current) {
        mapRef.current.removeLayer(polygonRef.current);
      }
      
      polygonRef.current = L.polygon(latLngs, {
        color: '#2196f3',
        fillColor: '#2196f3',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(mapRef.current);
      
      // Calculate bounding box for polygon search
      const bounds = L.latLngBounds(latLngs).toBBoxString().split(',').map(Number);
      const boundingBox = {
        west: bounds[0],
        south: bounds[1], 
        east: bounds[2],
        north: bounds[3]
      };
      
      onPolygonSearch(polygonPoints);
      onBoundarySearch(boundingBox); // Also trigger boundary search for compatibility
      
      setIsDrawing(false);
      setPolygonPoints([]);
      setDrawingMode('none');
    }
  };

  const clearDrawings = () => {
    if (mapRef.current) {
      if (rectangleRef.current) {
        mapRef.current.removeLayer(rectangleRef.current);
        rectangleRef.current = null;
      }
      if (polygonRef.current) {
        mapRef.current.removeLayer(polygonRef.current);
        polygonRef.current = null;
      }
      if (drawingLineRef.current) {
        mapRef.current.removeLayer(drawingLineRef.current);
        drawingLineRef.current = null;
      }
    }
    
    setIsDrawing(false);
    setDrawingStart(null);
    setPolygonPoints([]);
    setCurrentBounds(null);
    setDrawingMode('none');
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
                <button onclick="window.zoomToCluster(${group.centerLat}, ${group.centerLng})" 
                  style="background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                  View Properties
                </button>
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
      {/* Map Controls Toolbar */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Search color="primary" />
              Interactive Property Map
            </Typography>
            
            {showPropertyCount && properties.length > 0 && (
              <Badge 
                badgeContent={properties.length} 
                color="primary" 
                max={999}
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.875rem',
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
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Drawing Tools */}
            <ToggleButtonGroup
              value={drawingMode}
              exclusive
              onChange={(_, newMode) => {
                if (newMode !== null) {
                  clearDrawings();
                  setDrawingMode(newMode);
                }
              }}
              size="small"
            >
              <ToggleButton value="rectangle">
                <Tooltip title="Draw Rectangle Search Area">
                  <Rectangle />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="polygon">
                <Tooltip title="Draw Custom Search Area">
                  <Gesture />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            {/* Map Controls */}
            <Tooltip title="Clear All Drawings">
              <IconButton onClick={clearDrawings} size="small" color="primary">
                <Clear />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Center Map">
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

            <Tooltip title="Map Filters">
              <IconButton size="small" color="primary">
                <FilterList />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Drawing Instructions */}
        {drawingMode === 'rectangle' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'primary.50', borderRadius: 1 }}>
            <Rectangle color="primary" fontSize="small" />
            <Typography variant="body2" color="primary.main">
              Click the rectangle tool in the map toolbar to draw a rectangular search area
            </Typography>
          </Box>
        )}
        
        {drawingMode === 'polygon' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'primary.50', borderRadius: 1 }}>
            <Gesture color="primary" fontSize="small" />
            <Typography variant="body2" color="primary.main">
              Click the polygon tool in the map toolbar to draw a custom search area
            </Typography>
            {isDrawing && polygonPoints.length >= 3 && (
              <Button
                onClick={finishPolygonDrawing}
                variant="contained"
                size="small"
                sx={{ ml: 2 }}
                startIcon={<Search />}
              >
                Finish & Search ({polygonPoints.length} points)
              </Button>
            )}
          </Box>
        )}

        {/* Active Search Area Info */}
        {currentBounds && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'success.50', borderRadius: 1, mt: 1 }}>
            <CropFree color="success" fontSize="small" />
            <Typography variant="body2" color="success.main">
              Search area active: {currentBounds.north.toFixed(4)}°N, {currentBounds.south.toFixed(4)}°S, 
              {currentBounds.east.toFixed(4)}°E, {currentBounds.west.toFixed(4)}°W
            </Typography>
            <Button 
              onClick={clearDrawings} 
              size="small" 
              color="success"
              startIcon={<Clear />}
            >
              Clear
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Enhanced Map Container */}
      <Box
        id="enhanced-map"
        sx={{
          height: 600,
          width: '100%',
          border: '2px solid',
          borderColor: drawingMode !== 'none' ? 'primary.main' : 'divider',
          borderRadius: 2,
          cursor: drawingMode !== 'none' ? 'crosshair' : 'default',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 2,
          '& .leaflet-control-container': {
            '& .leaflet-draw-toolbar': {
              '& a': {
                backgroundColor: 'white',
                color: '#2196f3',
                border: '1px solid #2196f3',
                '&:hover': {
                  backgroundColor: '#2196f3',
                  color: 'white'
                }
              }
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
          Map Legend
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
                fontSize: '0.875rem',
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
                height: 2, 
                bgcolor: '#2196f3',
                opacity: 0.8
              }} 
            />
            <Typography variant="body2">Search Boundary</Typography>
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
