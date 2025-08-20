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
  Alert,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha
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
  PanTool,
  Save,
  Download,
  Upload,
  LayersOutlined,
  Palette,
  Timeline,
  CenterFocusStrong,
  Fullscreen,
  Share,
  BookmarkAdd,
  Home as HomeIcon,
  Map as MapIcon,
  Draw as DrawIcon
} from '@mui/icons-material';
import type { PropertyListing } from '../types/property';

interface SuperEnhancedFreeDrawMapProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  onBoundarySearch: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onPolygonSearch: (polygon: Array<{ lat: number; lng: number }>) => void;
  searchLocation?: string;
}

type DrawingMode = 'none' | 'create' | 'edit' | 'delete';
type MapLayer = 'street' | 'satellite' | 'terrain' | 'hybrid';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function SuperEnhancedFreeDrawMap({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  onBoundarySearch,
  onPolygonSearch,
  searchLocation
}: SuperEnhancedFreeDrawMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const freeDrawRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const searchMarkerRef = useRef<L.Marker | null>(null);
  const currentLocationMarkerRef = useRef<L.Marker | null>(null);
  const layersRef = useRef<{ [key: string]: L.TileLayer }>({});
  
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('create');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hasDrawnArea, setHasDrawnArea] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLayer, setCurrentLayer] = useState<MapLayer>('street');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const [savedAreas, setSavedAreas] = useState<Array<{ name: string; polygon: any; color: string }>>([]);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  const [drawingSettings, setDrawingSettings] = useState({
    strokeWidth: 3,
    smoothFactor: 0.3,
    mergePolygons: true,
    showHelp: true,
    strokeColor: '#2196f3',
    fillOpacity: 0.1,
    enableUndo: true,
    snapToGrid: false,
    magneticEdges: true
  });
  
  const [activePolygons, setActivePolygons] = useState<any[]>([]);
  const [polygonCount, setPolygonCount] = useState(0);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [drawingHistory, setDrawingHistory] = useState<any[]>([]);

  // Enhanced color palette for drawing
  const colorPalette = [
    '#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0', 
    '#00bcd4', '#795548', '#607d8b', '#e91e63', '#3f51b5'
  ];

  // Map layer configurations
  const mapLayers = {
    street: {
      name: 'Street View',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors'
    },
    satellite: {
      name: 'Satellite View',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri, Maxar, GeoEye, Earthstar Geographics'
    },
    terrain: {
      name: 'Terrain View',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap contributors'
    },
    hybrid: {
      name: 'Hybrid View',
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
    }
  };

  // Get user's current location with enhanced accuracy
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
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000 // 1 minute cache
        }
      );
    } else {
      setLocationError('Geolocation not supported. Using default location.');
      setCurrentLocation({ lat: 39.8283, lng: -98.5795 });
    }
  }, []);

  // Initialize enhanced map
  useEffect(() => {
    if (!mapRef.current && currentLocation) {
      // Create map with enhanced controls
      mapRef.current = L.map('super-enhanced-freedraw-map', {
        center: [currentLocation.lat, currentLocation.lng],
        zoom: currentLocation.lat === 39.8283 ? 4 : 12,
        zoomControl: true,
        doubleClickZoom: false,
        attributionControl: true,
        preferCanvas: true, // Better performance for many markers
        maxZoom: 20,
        minZoom: 2
      });

      // Add all map layers
      Object.entries(mapLayers).forEach(([key, layerConfig]) => {
        layersRef.current[key] = L.tileLayer(layerConfig.url, {
          attribution: layerConfig.attribution,
          maxZoom: 19,
          minZoom: 3
        });
        
        if (key === currentLayer) {
          layersRef.current[key].addTo(mapRef.current!);
        }
      });

      // Add enhanced current location marker
      if (currentLocation.lat !== 39.8283 && currentLocation.lng !== -98.5795) {
        const currentLocationIcon = L.divIcon({
          className: 'enhanced-current-location-marker',
          html: `
            <div class="location-pulse">
              <div class="location-dot"></div>
            </div>
            <style>
              .location-pulse {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: rgba(66, 133, 244, 0.3);
                position: relative;
                animation: locationPulse 2s infinite;
              }
              .location-dot {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #4285f4;
                border: 2px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              }
              @keyframes locationPulse {
                0% { transform: scale(1); opacity: 1; }
                70% { transform: scale(2); opacity: 0.3; }
                100% { transform: scale(1); opacity: 1; }
              }
            </style>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        currentLocationMarkerRef.current = L.marker([currentLocation.lat, currentLocation.lng], { 
          icon: currentLocationIcon 
        })
        .bindPopup('📍 Your Current Location')
        .addTo(mapRef.current);
      }

      // Initialize Enhanced FreeDraw with CREATE mode active
      freeDrawRef.current = new FreeDraw({
        mode: CREATE | EDIT | DELETE, // Allow create, edit, and delete
        smoothFactor: drawingSettings.smoothFactor,
        strokeWidth: 3, // Fixed stroke width
        mergePolygons: drawingSettings.mergePolygons,
        concavePolygon: true,
        simplifyFactor: 1.1,
        elbowDistance: drawingSettings.snapToGrid ? 20 : 10,
        maximumPolygons: 15,
        notifyAfterEditExit: false,
        leaveModeAfterCreate: false
      });

      mapRef.current.addLayer(freeDrawRef.current);

      // Enhanced FreeDraw events
      freeDrawRef.current.on('markers', (event: any) => {
        console.log('Enhanced FreeDraw event:', event.eventType, event.latLngs);
        
        // Save to undo stack if undo is enabled
        if (drawingSettings.enableUndo) {
          setUndoStack(prev => [...prev.slice(-9), freeDrawRef.current.all()]);
        }
        
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

      // Enhanced keyboard shortcuts
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey || event.metaKey) {
          switch (event.key.toLowerCase()) {
            case 'z':
              if (drawingSettings.enableUndo && undoStack.length > 0) {
                event.preventDefault();
                handleUndo();
              }
              break;
            case 's':
              event.preventDefault();
              handleSaveArea();
              break;
            case 'c':
              event.preventDefault();
              clearAllDrawings();
              break;
          }
        } else if (event.key === 'Escape') {
          if (freeDrawRef.current) {
            freeDrawRef.current.cancel();
            setDrawingMode('none');
            setIsDrawing(false);
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [currentLocation]);

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
        elbowDistance: drawingSettings.snapToGrid ? 20 : 10,
        maximumPolygons: 15,
        notifyAfterEditExit: false,
        leaveModeAfterCreate: false
      });
      
      // Add back to map
      if (mapRef.current) {
        mapRef.current.addLayer(freeDrawRef.current);
      }
      
      // Restore event listeners
      freeDrawRef.current.on('markers', (event: any) => {
        if (drawingSettings.enableUndo) {
          setUndoStack(prev => [...prev.slice(-9), freeDrawRef.current.all()]);
        }
        
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

      // Add new markers with enhanced Zillow-style design
      propertyGroups.forEach((group) => {
        if (group.properties.length === 1) {
          const property = group.properties[0];
          if (property.latitude && property.longitude) {
            // Single property marker with enhanced price display
            const priceLabel = `$${Math.round((property.purchasePrice || 0) / 1000)}K`;
            
            const customIcon = L.divIcon({
              className: 'super-enhanced-property-marker',
              html: `<div style="
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border: 2px solid ${property.purchasePrice && property.purchasePrice > 500000 ? '#ff6b35' : '#2196f3'};
                border-radius: 8px;
                padding: 4px 8px;
                font-size: 12px;
                font-weight: bold;
                color: ${property.purchasePrice && property.purchasePrice > 500000 ? '#ff6b35' : '#2196f3'};
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                white-space: nowrap;
                position: relative;
                transform: translateY(-2px);
                transition: all 0.2s ease;
              " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.2)'"
                 onmouseout="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'">${priceLabel}</div>`,
              iconSize: [70, 28],
              iconAnchor: [35, 28],
              popupAnchor: [0, -28]
            });

            const marker = L.marker([property.latitude, property.longitude], { icon: customIcon })
              .bindPopup(`
                <div style="width: 280px; font-family: Arial, sans-serif;">
                  <div style="height: 140px; background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
                    🏠 Property Preview
                  </div>
                  <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${property.address}</h3>
                  <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${property.city}, ${property.state}</p>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin: 12px 0;">
                    <p style="margin: 0; font-size: 20px; font-weight: bold; color: #2196f3;">$${property.purchasePrice?.toLocaleString()}</p>
                    <div style="display: flex; gap: 8px; font-size: 12px; color: #888;">
                      <span>${property.bedrooms}🛏️</span>
                      <span>${property.bathrooms}🚿</span>
                      <span>${property.squareFootage?.toLocaleString()}📐</span>
                    </div>
                  </div>
                  <div style="background: #f8f9fa; padding: 8px; border-radius: 6px; margin-top: 8px;">
                    <p style="margin: 0; color: #28a745; font-weight: bold; font-size: 14px;">💰 Monthly Rent: $${property.monthlyRent?.toLocaleString()}</p>
                    <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">🎯 Est. ROI: ${property.monthlyRent && property.purchasePrice ? Math.round((property.monthlyRent * 12) / property.purchasePrice * 100) : 'N/A'}%</p>
                  </div>
                </div>
              `, { maxWidth: 320 })
              .on('click', () => onPropertySelect(property));
            
            if (mapRef.current) {
              marker.addTo(mapRef.current);
              markersRef.current.push(marker);
            }
          }
        } else {
          // Enhanced cluster marker
          const avgPrice = Math.round(group.properties.reduce((sum, p) => sum + (p.purchasePrice || 0), 0) / group.properties.length);
          const clusterIcon = L.divIcon({
            className: 'super-enhanced-cluster-marker',
            html: `<div style="
              background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
              border: 3px solid white;
              border-radius: 50%;
              width: 48px;
              height: 48px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: bold;
              color: white;
              box-shadow: 0 4px 16px rgba(33, 150, 243, 0.4);
              position: relative;
            ">
              ${group.properties.length}
              <div style="
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                background: #ff6b35;
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 10px;
                white-space: nowrap;
              ">$${Math.round(avgPrice/1000)}K</div>
            </div>`,
            iconSize: [48, 56],
            iconAnchor: [24, 28],
            popupAnchor: [0, -28]
          });

          const marker = L.marker([group.centerLat, group.centerLng], { icon: clusterIcon })
            .bindPopup(`
              <div style="width: 250px; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 12px 0; color: #333;">📍 ${group.properties.length} Properties</h3>
                <div style="background: #f8f9fa; padding: 12px; border-radius: 8px;">
                  <p style="margin: 0 0 8px 0; font-weight: bold; color: #2196f3;">Price Range:</p>
                  <p style="margin: 0 0 8px 0;">💰 $${Math.min(...group.properties.map(p => p.purchasePrice || 0)).toLocaleString()} - 
                  $${Math.max(...group.properties.map(p => p.purchasePrice || 0)).toLocaleString()}</p>
                  <p style="margin: 0; font-weight: bold; color: #28a745;">📊 Average: $${Math.round(avgPrice).toLocaleString()}</p>
                </div>
                <p style="margin: 12px 0 0 0; color: #666; font-size: 12px;">🔍 Zoom in to see individual properties</p>
              </div>
            `);
          
          if (mapRef.current) {
            marker.addTo(mapRef.current);
            markersRef.current.push(marker);
          }
        }
      });

      // Auto-fit bounds if we have properties
      if (markersRef.current.length > 0) {
        setTimeout(() => {
          if (mapRef.current) {
            const group = L.featureGroup(markersRef.current);
            mapRef.current.fitBounds(group.getBounds().pad(0.1));
          }
        }, 100);
      }
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

      // Find existing group within 800m (increased for better clustering)
      const existingGroup = groups.find(group => {
        const distance = getDistance(
          property.latitude!, property.longitude!,
          group.centerLat, group.centerLng
        );
        return distance < 800; // 800 meters threshold
      });

      if (existingGroup) {
        existingGroup.properties.push(property);
        // Update center point with weighted average
        const totalLat = existingGroup.properties.reduce((sum, p) => sum + (p.latitude || 0), 0);
        const totalLng = existingGroup.properties.reduce((sum, p) => sum + (p.longitude || 0), 0);
        existingGroup.centerLat = totalLat / existingGroup.properties.length;
        existingGroup.centerLng = totalLng / existingGroup.properties.length;
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

  // Handle search location marker - enhanced version
  useEffect(() => {
    if (searchLocation && mapRef.current && properties.length > 0) {
      // Use the center of found properties for search marker
      const avgLat = properties.reduce((sum, p) => sum + (p.latitude || 0), 0) / properties.length;
      const avgLng = properties.reduce((sum, p) => sum + (p.longitude || 0), 0) / properties.length;
      
      if (avgLat && avgLng) {
        const searchLocationCoords = L.latLng(avgLat, avgLng);
        
        if (searchMarkerRef.current) {
          mapRef.current.removeLayer(searchMarkerRef.current);
        }
        
        // Enhanced search location marker
        const searchIcon = L.divIcon({
          className: 'search-location-marker',
          html: `<div style="
            background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
            border: 3px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            box-shadow: 0 4px 16px rgba(255, 107, 53, 0.4);
            animation: searchPulse 2s infinite;
          ">🔍
          <style>
            @keyframes searchPulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          </style>
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
        
        searchMarkerRef.current = L.marker(searchLocationCoords, {
          icon: searchIcon
        })
        .bindPopup(`
          <div style="width: 200px; text-align: center;">
            <h4 style="margin: 0 0 8px 0; color: #ff6b35;">🎯 Search Center</h4>
            <p style="margin: 0; color: #666;">${searchLocation}</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #999;">Found ${properties.length} properties in this area</p>
          </div>
        `);
        
        if (mapRef.current) {
          searchMarkerRef.current.addTo(mapRef.current);
          // Center map on search results
          mapRef.current.setView(searchLocationCoords, 13);
        }
      }
    }
  }, [searchLocation, properties]);

  // Handle layer switching
  const switchLayer = (newLayer: MapLayer) => {
    if (mapRef.current && layersRef.current[currentLayer]) {
      mapRef.current.removeLayer(layersRef.current[currentLayer]);
      mapRef.current.addLayer(layersRef.current[newLayer]);
      setCurrentLayer(newLayer);
    }
  };

  // Enhanced undo functionality
  const handleUndo = () => {
    if (undoStack.length > 1 && freeDrawRef.current) {
      const previousState = undoStack[undoStack.length - 2];
      freeDrawRef.current.clear();
      
      // Restore previous polygons if any
      if (previousState && previousState.length > 0) {
        try {
          // The exact restore method depends on FreeDraw API
          // For now, we'll update the polygon count and active polygons
          setPolygonCount(previousState.length);
          setActivePolygons(previousState);
        } catch (error) {
          console.warn('Undo operation partially completed:', error);
        }
      } else {
        setPolygonCount(0);
        setActivePolygons([]);
      }
      
      // Remove the last state from undo stack
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  // Save area functionality
  const handleSaveArea = () => {
    if (activePolygons.length > 0) {
      const areaName = prompt('Enter a name for this search area:');
      if (areaName) {
        const newSavedArea = {
          name: areaName,
          polygon: activePolygons[activePolygons.length - 1],
          color: drawingSettings.strokeColor
        };
        setSavedAreas(prev => [...prev, newSavedArea]);
      }
    }
  };

  // Export/Import functionality
  const handleExportAreas = () => {
    const data = {
      areas: savedAreas,
      activePolygons,
      settings: drawingSettings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'property-search-areas.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Clear all drawings
  const clearAllDrawings = () => {
    if (freeDrawRef.current) {
      freeDrawRef.current.clear();
      setActivePolygons([]);
      setPolygonCount(0);
      setDrawingMode('none');
      setIsDrawing(false);
      setUndoStack([]);
    }
  };

  // Clear all polygons - alias for clearAllDrawings
  const clearAllPolygons = clearAllDrawings;

  // Handle search in polygon
  const handleSearchInPolygon = () => {
    if (activePolygons.length > 0) {
      const polygon = activePolygons[activePolygons.length - 1];
      if (polygon && polygon.length > 0) {
        const formattedPolygon = polygon.map((point: any) => ({
          lat: point.lat,
          lng: point.lng
        }));
        onPolygonSearch(formattedPolygon);
      }
    }
  };

  const speedDialActions = [
    { icon: <LayersOutlined />, name: 'Switch Layer', onClick: () => setMenuAnchor(document.getElementById('layer-button')) },
    { icon: <Save />, name: 'Save Area', onClick: handleSaveArea },
    { icon: <Download />, name: 'Export Areas', onClick: handleExportAreas },
    { icon: <Fullscreen />, name: 'Fullscreen', onClick: toggleFullscreen },
    { icon: <Share />, name: 'Share Location', onClick: () => console.log('Share') },
    { icon: <BookmarkAdd />, name: 'Bookmark', onClick: () => console.log('Bookmark') }
  ];

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        height: '100%', 
        width: '100%',
        overflow: 'auto' // Add scrolling capability
      }}
    >
      {/* Simple Control Panel */}
      <Box
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          gap: 1
        }}
      >
        <Tooltip title="Clear all drawn areas">
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={clearAllPolygons}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <Clear fontSize="small" />
          </Button>
        </Tooltip>
        <Tooltip title="Search properties in drawn area">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSearchInPolygon}
            disabled={polygonCount === 0}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <Search fontSize="small" />
          </Button>
        </Tooltip>
      </Box>

      {/* Super Enhanced Map Container */}
      <Box
        id="super-enhanced-freedraw-map"
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
            fontFamily: 'inherit',
            fontSize: '14px'
          },
          '& .free-draw path': {
            stroke: '#2196f3', // Fixed blue color
            strokeWidth: 3, // Fixed stroke width
            fill: '#2196f3', // Fixed blue color
            fillOpacity: 0.1, // Fixed opacity
            strokeOpacity: 0.8
          },
          '& .super-enhanced-property-marker': {
            animation: 'fadeInUp 0.4s ease-out'
          },
          '& .super-enhanced-cluster-marker': {
            animation: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          },
          '@keyframes fadeInUp': {
            from: {
              opacity: 0,
              transform: 'translateY(20px)'
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)'
            }
          },
          '@keyframes bounceIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.3)'
            },
            '50%': {
              opacity: 1,
              transform: 'scale(1.05)'
            },
            '70%': {
              transform: 'scale(0.9)'
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1)'
            }
          }
        }}
      />
    </Box>
  );
}
