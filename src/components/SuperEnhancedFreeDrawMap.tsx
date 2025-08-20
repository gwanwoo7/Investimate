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
  ListItemText
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
  BookmarkAdd
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
  
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
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

      // Initialize Enhanced FreeDraw
      freeDrawRef.current = new FreeDraw({
        mode: NONE,
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
    if (undoStack.length > 0 && freeDrawRef.current) {
      const previousState = undoStack[undoStack.length - 2] || [];
      freeDrawRef.current.clear();
      // Restore previous polygons
      previousState.forEach((polygon: any) => {
        // Implementation depends on FreeDraw API
      });
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

  const speedDialActions = [
    { icon: <LayersOutlined />, name: 'Switch Layer', onClick: () => setMenuAnchor(document.getElementById('layer-button')) },
    { icon: <Save />, name: 'Save Area', onClick: handleSaveArea },
    { icon: <Download />, name: 'Export Areas', onClick: handleExportAreas },
    { icon: <Fullscreen />, name: 'Fullscreen', onClick: toggleFullscreen },
    { icon: <Share />, name: 'Share Location', onClick: () => console.log('Share') },
    { icon: <BookmarkAdd />, name: 'Bookmark', onClick: () => console.log('Bookmark') }
  ];

  return (
    <Box sx={{ position: 'relative', height: isFullscreen ? '100vh' : '100%', width: '100%' }}>
      {/* Enhanced Controls Toolbar */}
      <Paper sx={{ 
        p: 2, 
        mb: isFullscreen ? 0 : 2, 
        bgcolor: 'background.paper', 
        borderRadius: isFullscreen ? 0 : 2,
        position: isFullscreen ? 'absolute' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        zIndex: 1000
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Brush color="primary" />
              Super Enhanced Free-Draw Map
            </Typography>
            
            {properties.length > 0 && (
              <Badge badgeContent={properties.length} color="primary" max={999}>
                <Chip label="Properties" color="primary" variant="outlined" size="small" />
              </Badge>
            )}

            {polygonCount > 0 && (
              <Badge badgeContent={polygonCount} color="secondary" max={99}>
                <Chip label="Areas" color="secondary" variant="outlined" size="small" />
              </Badge>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Enhanced Drawing Mode Controls */}
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
                <Tooltip title="Pan Mode">
                  <PanTool />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="create">
                <Tooltip title="Free-Hand Draw">
                  <Create />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="edit">
                <Tooltip title="Edit Areas">
                  <Edit />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="delete">
                <Tooltip title="Delete Areas">
                  <DeleteOutline />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
            
            {/* Color Palette */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {colorPalette.slice(0, 5).map((color) => (
                <IconButton
                  key={color}
                  size="small"
                  onClick={() => setDrawingSettings(prev => ({ ...prev, strokeColor: color }))}
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: color,
                    border: drawingSettings.strokeColor === color ? '2px solid white' : '1px solid rgba(0,0,0,0.2)',
                    '&:hover': { transform: 'scale(1.1)' }
                  }}
                />
              ))}
            </Box>
            
            {/* Quick Actions */}
            {drawingSettings.enableUndo && (
              <Tooltip title="Undo (Ctrl+Z)">
                <IconButton 
                  onClick={handleUndo} 
                  size="small" 
                  disabled={undoStack.length === 0}
                >
                  <Undo />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Clear All (Ctrl+C)">
              <IconButton onClick={clearAllDrawings} size="small" color="error">
                <Clear />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Center on Properties">
              <IconButton onClick={() => {
                if (mapRef.current && markersRef.current.length > 0) {
                  const group = L.featureGroup(markersRef.current);
                  mapRef.current.fitBounds(group.getBounds().pad(0.1));
                }
              }} size="small" color="primary">
                <CenterFocusStrong />
              </IconButton>
            </Tooltip>
            
            {/* Layer Switch Button */}
            <Button
              id="layer-button"
              variant="outlined"
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              startIcon={<LayersOutlined />}
            >
              {mapLayers[currentLayer].name}
            </Button>
          </Box>
        </Box>
        
        {/* Enhanced Drawing Settings */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" gutterBottom>
              Stroke: {drawingSettings.strokeWidth}px
            </Typography>
            <Slider
              value={drawingSettings.strokeWidth}
              onChange={(_, value) => setDrawingSettings(prev => ({ ...prev, strokeWidth: value as number }))}
              min={1}
              max={10}
              size="small"
              sx={{ width: 100 }}
            />
          </Box>
          
          <Box sx={{ minWidth: 120 }}>
            <Typography variant="body2" gutterBottom>
              Opacity: {Math.round(drawingSettings.fillOpacity * 100)}%
            </Typography>
            <Slider
              value={drawingSettings.fillOpacity}
              onChange={(_, value) => setDrawingSettings(prev => ({ ...prev, fillOpacity: value as number }))}
              min={0}
              max={0.5}
              step={0.1}
              size="small"
              sx={{ width: 100 }}
            />
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={drawingSettings.snapToGrid}
                onChange={(e) => setDrawingSettings(prev => ({ ...prev, snapToGrid: e.target.checked }))}
                size="small"
              />
            }
            label="Snap to Grid"
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={drawingSettings.magneticEdges}
                onChange={(e) => setDrawingSettings(prev => ({ ...prev, magneticEdges: e.target.checked }))}
                size="small"
              />
            }
            label="Magnetic Edges"
          />
        </Box>
      </Paper>
      
      {/* Layer Selection Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {Object.entries(mapLayers).map(([key, layer]) => (
          <MenuItem
            key={key}
            selected={currentLayer === key}
            onClick={() => {
              switchLayer(key as MapLayer);
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <LayersOutlined />
            </ListItemIcon>
            <ListItemText>{layer.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
      
      {/* Super Enhanced Map Container */}
      <Box
        id="super-enhanced-freedraw-map"
        sx={{
          height: isFullscreen ? 'calc(100vh - 120px)' : 600,
          width: '100%',
          border: '2px solid',
          borderColor: isDrawing ? 'primary.main' : 'divider',
          borderRadius: isFullscreen ? 0 : 2,
          cursor: drawingMode === 'create' ? 'crosshair' : 'default',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isFullscreen ? 'none' : 2,
          mt: isFullscreen ? 1 : 0,
          '& .leaflet-container': {
            fontFamily: 'inherit',
            fontSize: '14px'
          },
          '& .free-draw path': {
            stroke: drawingSettings.strokeColor,
            strokeWidth: drawingSettings.strokeWidth,
            fill: drawingSettings.strokeColor,
            fillOpacity: drawingSettings.fillOpacity,
            strokeOpacity: 0.8
          }
        }}
      />

      {/* Floating Speed Dial for Advanced Tools */}
      <SpeedDial
        ariaLabel="Advanced Tools"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        open={showAdvancedTools}
        onClose={() => setShowAdvancedTools(false)}
        onOpen={() => setShowAdvancedTools(true)}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.onClick}
          />
        ))}
      </SpeedDial>

      {/* Keyboard Shortcuts Help */}
      {drawingSettings.showHelp && (
        <Paper sx={{ 
          position: 'absolute', 
          bottom: 16, 
          left: 16, 
          p: 2, 
          maxWidth: 250,
          bgcolor: 'rgba(255, 255, 255, 0.95)'
        }}>
          <Typography variant="subtitle2" gutterBottom>
            Keyboard Shortcuts
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
            • <strong>Ctrl+Z</strong>: Undo<br/>
            • <strong>Ctrl+S</strong>: Save Area<br/>
            • <strong>Ctrl+C</strong>: Clear All<br/>
            • <strong>Escape</strong>: Cancel Drawing
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
