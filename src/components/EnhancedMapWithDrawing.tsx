import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Typography,
  Paper,
  Button,
  Fab,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  IconButton
} from '@mui/material';
import {
  CropFree,
  Clear,
  Search,
  Edit,
  Rectangle,
  Gesture
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
  
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingStart, setDrawingStart] = useState<{ lat: number; lng: number } | null>(null);
  const [polygonPoints, setPolygonPoints] = useState<Array<{ lat: number; lng: number }>>([]);
  const [currentBounds, setCurrentBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);

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

      // Handle drawing interactions
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

      // Add new markers
      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          const marker = L.marker([property.latitude, property.longitude])
            .bindPopup(`
              <div style="width: 200px;">
                <h4>${property.address}</h4>
                <p>${property.city}, ${property.state}</p>
                <p><strong>$${property.purchasePrice?.toLocaleString()}</strong></p>
                <p>Monthly Rent: $${property.monthlyRent?.toLocaleString()}</p>
              </div>
            `)
          
          if (mapRef.current) {
            marker.addTo(mapRef.current);
            markersRef.current.push(marker);
          }
        }
      });
    }
  }, [properties]);

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
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h6">Interactive Property Map</Typography>
          
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
              <Tooltip title="Draw Rectangle">
                <Rectangle />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="polygon">
              <Tooltip title="Draw Free Shape">
                <Gesture />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Button 
            onClick={clearDrawings} 
            startIcon={<Clear />}
            variant="outlined"
            size="small"
          >
            Clear
          </Button>
        </Box>
        
        {drawingMode === 'rectangle' && (
          <Typography variant="body2" color="text.secondary">
            Click two points on the map to draw a rectangle search area
          </Typography>
        )}
        
        {drawingMode === 'polygon' && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              Click multiple points to draw a free-form search area
            </Typography>
            {isDrawing && polygonPoints.length >= 3 && (
              <Button
                onClick={finishPolygonDrawing}
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
                startIcon={<Search />}
              >
                Finish & Search ({polygonPoints.length} points)
              </Button>
            )}
          </Box>
        )}
      </Paper>
      
      <Box
        id="enhanced-map"
        sx={{
          height: 500,
          width: '100%',
          border: '2px solid',
          borderColor: drawingMode !== 'none' ? 'primary.main' : 'divider',
          borderRadius: 2,
          cursor: drawingMode !== 'none' ? 'crosshair' : 'default'
        }}
      />
      
      {currentBounds && (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'success.50' }}>
          <Typography variant="body2" color="success.main">
            Search area bounds: {currentBounds.north.toFixed(4)}°N, {currentBounds.south.toFixed(4)}°S, 
            {currentBounds.east.toFixed(4)}°E, {currentBounds.west.toFixed(4)}°W
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
