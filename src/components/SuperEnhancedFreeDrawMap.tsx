import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Snackbar,
  Card,
  CardContent,
} from '@mui/material';
import GoogleMapsPropertySearch from './GoogleMapsPropertySearch';
import type { PropertyListing } from '../types/property';

interface SuperEnhancedFreeDrawMapProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onPropertySelect: (property: PropertyListing) => void;
  onBoundarySearch: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onPolygonSearch: (polygon: Array<{ lat: number; lng: number }>) => void;
  searchLocation?: string;
}

export default function SuperEnhancedFreeDrawMap({ 
  properties, 
  selectedProperty, 
  onPropertySelect, 
  onBoundarySearch,
  onPolygonSearch,
  searchLocation
}: SuperEnhancedFreeDrawMapProps) {
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setShowAlert(true);
  }, []);

  const handleCloseAlert = useCallback(() => {
    setShowAlert(false);
    setTimeout(() => setError(null), 300);
  }, []);

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        height: '100%', 
        width: '100%',
        overflow: 'auto'
      }}
    >
      {/* Error Display */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Google Maps Component */}
      <GoogleMapsPropertySearch
        properties={properties}
        selectedProperty={selectedProperty}
        onPropertySelect={onPropertySelect}
        onBoundarySearch={onBoundarySearch}
        onPolygonSearch={onPolygonSearch}
        searchLocation={searchLocation}
      />

      {/* Property Stats Card */}
      {properties.length > 0 && (
        <Card
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
            minWidth: 200,
            opacity: 0.95,
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="h6" component="div" sx={{ mb: 1 }}>
              Search Results
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {properties.length} properties found
            </Typography>
            {searchLocation && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Near: {searchLocation}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
