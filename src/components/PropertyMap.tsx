import React, { useState, useEffect } from 'react';
import type { PropertyListing } from '../types/property';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Avatar,
  Tooltip
} from '@mui/material';
import { LocationOn, Home, AttachMoney } from '@mui/icons-material';

interface PropertyMapProps {
  properties: PropertyListing[];
  selectedProperty?: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  searchLocation?: string;
}

// Mock coordinates for demonstration - in a real app, you'd geocode the addresses
const getPropertyCoordinates = (property: PropertyListing) => {
  // Simple hash function to generate consistent coordinates for each property
  let hash = 0;
  for (let i = 0; i < property.address.length; i++) {
    const char = property.address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate coordinates based on state and property hash
  const stateCoords: { [key: string]: { lat: number; lng: number; range: number } } = {
    'TX': { lat: 29.7604, lng: -95.3698, range: 0.5 }, // Houston area
    'FL': { lat: 25.7617, lng: -80.1918, range: 0.3 }, // Miami area
    'IN': { lat: 39.7684, lng: -86.1581, range: 0.2 }, // Indianapolis area
    'GA': { lat: 33.7490, lng: -84.3880, range: 0.3 }, // Atlanta area
    'NC': { lat: 35.2271, lng: -80.8431, range: 0.2 }, // Charlotte area
    'TN': { lat: 36.1627, lng: -86.7816, range: 0.2 }, // Nashville area
    'AL': { lat: 33.5186, lng: -86.8104, range: 0.2 }, // Birmingham area
    'PA': { lat: 39.9526, lng: -75.1652, range: 0.2 }, // Philadelphia area
    'WI': { lat: 43.0389, lng: -87.9065, range: 0.2 }, // Milwaukee area
    'OH': { lat: 41.4993, lng: -81.6944, range: 0.2 }, // Cleveland area
    'MI': { lat: 42.3314, lng: -83.0458, range: 0.2 }, // Detroit area
    'KS': { lat: 39.0997, lng: -94.5786, range: 0.2 }, // Kansas City area
    'OK': { lat: 35.4676, lng: -97.5164, range: 0.2 }, // Oklahoma City area
  };

  const baseCoords = stateCoords[property.state] || stateCoords['IN'];
  const variation = (Math.abs(hash) % 1000) / 1000; // 0-1
  
  return {
    lat: baseCoords.lat + (variation - 0.5) * baseCoords.range,
    lng: baseCoords.lng + (variation - 0.5) * baseCoords.range
  };
};

const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  selectedProperty,
  onPropertySelect,
  searchLocation
}) => {
  const [mapBounds, setMapBounds] = useState({ minLat: 0, maxLat: 0, minLng: 0, maxLng: 0 });
  const [searchCenter, setSearchCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (properties.length > 0) {
      const coords = properties.map(getPropertyCoordinates);
      const lats = coords.map(c => c.lat);
      const lngs = coords.map(c => c.lng);
      
      setMapBounds({
        minLat: Math.min(...lats) - 0.01,
        maxLat: Math.max(...lats) + 0.01,
        minLng: Math.min(...lngs) - 0.01,
        maxLng: Math.max(...lngs) + 0.01
      });
    }
  }, [properties]);

  useEffect(() => {
    // Update search center when search location changes
    if (searchLocation) {
      // Mock geocoding - in real app, use geocoding service
      const stateCoords: { [key: string]: { lat: number; lng: number } } = {
        'TX': { lat: 29.7604, lng: -95.3698 },
        'FL': { lat: 25.7617, lng: -80.1918 },
        'IN': { lat: 39.7684, lng: -86.1581 },
        'GA': { lat: 33.7490, lng: -84.3880 },
        'NC': { lat: 35.2271, lng: -80.8431 },
        'TN': { lat: 36.1627, lng: -86.7816 },
        'AL': { lat: 33.5186, lng: -86.8104 },
        'PA': { lat: 39.9526, lng: -75.1652 },
        'WI': { lat: 43.0389, lng: -87.9065 },
        'OH': { lat: 41.4993, lng: -81.6944 },
        'MI': { lat: 42.3314, lng: -83.0458 },
        'KS': { lat: 39.0997, lng: -94.5786 },
        'OK': { lat: 35.4676, lng: -97.5164 },
      };
      
      // Try to match search location to state
      const stateMatch = Object.keys(stateCoords).find(state => 
        searchLocation.toLowerCase().includes(state.toLowerCase())
      );
      
      if (stateMatch) {
        setSearchCenter(stateCoords[stateMatch]);
      }
    }
  }, [searchLocation]);

  const PropertyMarker: React.FC<{ property: PropertyListing; isSelected: boolean }> = ({ property, isSelected }) => {
    const coords = getPropertyCoordinates(property);
    
    // Calculate position as percentage of map bounds
    const x = ((coords.lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    const y = ((mapBounds.maxLat - coords.lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
    
    const getMarkerColor = () => {
      // Use a simple price-based color coding since we don't have investment analysis
      if (property.purchasePrice >= 200000) return '#4caf50'; // Green - Higher priced
      if (property.purchasePrice >= 150000) return '#ff9800'; // Orange - Mid range
      if (property.purchasePrice >= 100000) return '#2196f3'; // Blue - Lower mid
      return '#f44336'; // Red - Lower priced
    };

    return (
      <Box
        sx={{
          position: 'absolute',
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
          zIndex: isSelected ? 10 : 5,
        }}
        onClick={() => onPropertySelect(property)}
      >
        <Tooltip
          title={
            <Box>
              <Typography variant="subtitle2">{property.address}</Typography>
              <Typography variant="body2">${property.purchasePrice.toLocaleString()}</Typography>
              <Typography variant="body2">
                {property.bedrooms} bed, {property.bathrooms} bath
              </Typography>
            </Box>
          }
          arrow
        >
          <Avatar
            sx={{
              width: isSelected ? 36 : 24,
              height: isSelected ? 36 : 24,
              bgcolor: getMarkerColor(),
              border: isSelected ? '3px solid #fff' : '2px solid #fff',
              boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1)',
              }
            }}
          >
            <Home sx={{ fontSize: isSelected ? 20 : 14 }} />
          </Avatar>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Map Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom>
          Property Locations
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<LocationOn />}
            label={`${properties.length} Properties`}
            size="small"
            color="primary"
          />
          {selectedProperty && (
            <Chip
              label="Selected"
              size="small"
              color="secondary"
              deleteIcon={<Home />}
            />
          )}
          {searchCenter && (
            <Chip
              label="Search Area"
              size="small"
              color="warning"
              icon={<LocationOn />}
            />
          )}
        </Box>
      </Box>

      {/* Map Container */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          bgcolor: '#f5f5f5',
          backgroundImage: `
            linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
            linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
            linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          overflow: 'hidden',
          border: '1px solid #ddd',
          minHeight: '400px'
        }}
      >
        {/* Map Grid Lines */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Street Labels */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            right: 10,
            bottom: 10,
            pointerEvents: 'none',
          }}
        >
          {/* Mock street labels */}
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: '20%',
              left: '10%',
              color: '#666',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px white',
            }}
          >
            Main St
          </Typography>
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: '60%',
              left: '70%',
              color: '#666',
              fontWeight: 'bold',
              textShadow: '1px 1px 2px white',
            }}
          >
            Oak Ave
          </Typography>
        </Box>

        {/* Search Center Indicator */}
        {searchCenter && (
          <Box
            sx={{
              position: 'absolute',
              left: `${((searchCenter.lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100}%`,
              top: `${((mapBounds.maxLat - searchCenter.lat) / (mapBounds.maxLat - mapBounds.minLat)) * 100}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 15,
            }}
          >
            <Tooltip title="Search Area Center" arrow>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#ff4444',
                  border: '3px solid #fff',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                      opacity: 0.7,
                    },
                    '100%': {
                      transform: 'scale(1)',
                      opacity: 1,
                    },
                  },
                }}
              >
                <LocationOn sx={{ fontSize: 18, color: 'white' }} />
              </Avatar>
            </Tooltip>
          </Box>
        )}

        {/* Property Markers */}
        {properties.map((property) => (
          <PropertyMarker
            key={property.id}
            property={property}
            isSelected={selectedProperty?.id === property.id}
          />
        ))}

        {/* Map Legend */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            bgcolor: 'rgba(255,255,255,0.9)',
            p: 1,
            borderRadius: 1,
            boxShadow: 1,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
            Price Range
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#4caf50', borderRadius: '50%' }} />
              <Typography variant="caption">$200K+</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#ff9800', borderRadius: '50%' }} />
              <Typography variant="caption">$150K-$200K</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#2196f3', borderRadius: '50%' }} />
              <Typography variant="caption">$100K-$150K</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#f44336', borderRadius: '50%' }} />
              <Typography variant="caption">&lt;$100K</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Selected Property Info */}
      {selectedProperty && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Property
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
            <Chip
              icon={<AttachMoney />}
              label={`$${selectedProperty.purchasePrice.toLocaleString()}`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<Home />}
              label={`${selectedProperty.bedrooms} bed, ${selectedProperty.bathrooms} bath`}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default PropertyMap;
