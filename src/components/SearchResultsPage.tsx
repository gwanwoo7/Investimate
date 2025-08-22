import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  LocationOn
} from '@mui/icons-material';
import NavigationBar from './NavigationBar';
import PropertyListView from './PropertyListView';
import type { PropertyListing } from '../types/property';

interface SearchResultsPageProps {
  properties: PropertyListing[];
  searchType: 'boundary' | 'area';
  searchQuery?: string;
  boundaryInfo?: { north: number; south: number; east: number; west: number };
  onBack: () => void;
  onPropertySelect: (property: PropertyListing) => void;
  user?: { email: string; isSubscribed: boolean } | null;
  onLogout?: () => void;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onSubscriptionClick?: () => void;
}

export default function SearchResultsPage({
  properties,
  searchType,
  searchQuery,
  boundaryInfo,
  onBack,
  onPropertySelect,
  user,
  onLogout,
  onLoginClick,
  onSignupClick,
  onSubscriptionClick
}: SearchResultsPageProps) {

  return (
    <Box sx={{ 
      bgcolor: 'grey.50', 
      minHeight: '100vh'
    }}>
      <NavigationBar
        title="Search Results"
        showBackButton={true}
        onBackClick={onBack}
        user={user}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onSubscriptionClick={onSubscriptionClick}
        showNavButtons={true}
      />

      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 3,
        }}
      >
        {/* Search Summary */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocationOn color="primary" />
              <Typography variant="h5" fontWeight="bold">
                Search Results
              </Typography>
              <Chip 
                label={`${properties.length} properties found`}
                color="primary"
                variant="outlined"
              />
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                onClick={onBack}
                startIcon={<ArrowBack />}
                variant="outlined"
                color="primary"
              >
                Back to Search
              </Button>
            </Box>
          </Box>

          <Typography variant="body1" color="text.secondary">
            {searchType === 'boundary' 
              ? `Properties found within drawn boundary area`
              : `Properties found in ${searchQuery}`
            }
          </Typography>

          {boundaryInfo && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Boundary: {boundaryInfo.north.toFixed(4)}°N, {boundaryInfo.south.toFixed(4)}°S, 
              {boundaryInfo.east.toFixed(4)}°E, {boundaryInfo.west.toFixed(4)}°W
            </Typography>
          )}
        </Paper>

        {/* Enhanced Property List with Investment Analysis */}
        {properties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No properties found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or drawing a larger area on the map.
            </Typography>
          </Paper>
        ) : (
          <PropertyListView 
            properties={properties}
            onPropertySelect={onPropertySelect}
            loading={false}
          />
        )}

      </Container>
    </Box>
  );
}
