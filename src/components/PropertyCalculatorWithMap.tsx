import { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Alert,
  Paper,
  Card,
  CardContent,
  IconButton,
  Divider,
  Stack,
  Chip
} from '@mui/material';
import {
  Search,
  Map as MapIcon,
  List as ListIcon,
  FilterAlt,
  Refresh,
  PinDrop
} from '@mui/icons-material';
import AreaSearchForm from './AreaSearchForm';
import PropertyListView from './PropertyListView';
import InteractiveMapWithBoundary from './InteractiveMapWithBoundary';
import type { PropertyListing, AreaSearchParams } from '../types/property';
import { EnhancedRealEstateAPIService } from '../services/enhancedRealEstateAPIService';

interface PropertyCalculatorWithMapProps {
  canSearch?: boolean;
  onSearch?: () => void;
  onUpgrade?: () => void;
  searchCount?: number;
  maxSearches?: number;
}

export default function PropertyCalculatorWithMap({ 
  canSearch = true, 
  onSearch, 
  onUpgrade, 
  searchCount: _searchCount = 0, 
  maxSearches = 5 
}: PropertyCalculatorWithMapProps) {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentSearchLocation, setCurrentSearchLocation] = useState<string>('');
  const [showMap, setShowMap] = useState(true);
  const [showSearchForm, setShowSearchForm] = useState(true);
  const [lastSearchParams, setLastSearchParams] = useState<AreaSearchParams | null>(null);

  const handleAreaSearch = async (searchData: AreaSearchParams) => {
    // Check search limits before proceeding
    if (!canSearch) {
      if (onUpgrade) onUpgrade();
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Call onSearch to increment search count
      if (onSearch) onSearch();
      
      console.log('🔍 PropertyCalculatorWithMap: Searching with params:', searchData);
      
      const foundProperties = await EnhancedRealEstateAPIService.searchPropertiesWithBoundary(searchData);
      console.log('🏠 Properties found:', foundProperties.length);
      
      setProperties(foundProperties);
      setLastSearchParams(searchData);
      
      // Update current search location for map display
      const searchLocation = [searchData.city, searchData.state].filter(Boolean).join(', ');
      setCurrentSearchLocation(searchLocation);
      
      if (foundProperties.length === 0) {
        setError('No properties found matching your criteria. Try adjusting your search parameters or drawing a different area on the map.');
      } else {
        setSuccess(`Found ${foundProperties.length} investment properties matching your criteria!`);
      }
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Search failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBoundarySearch = async (bounds: { north: number; south: number; east: number; west: number }) => {
    if (!canSearch) {
      if (onUpgrade) onUpgrade();
      return;
    }

    // Use last search params or create default ones
    const searchParams: AreaSearchParams = {
      ...lastSearchParams,
      bounds,
      // Set default values if no previous search
      city: lastSearchParams?.city || 'Santa Clara',
      state: lastSearchParams?.state || 'CA',
      propertyTypes: lastSearchParams?.propertyTypes || ['single-family', 'condo', 'townhouse', 'multi-family'],
      minPrice: lastSearchParams?.minPrice || 50000,
      maxPrice: lastSearchParams?.maxPrice || 20000000,
      minBedrooms: lastSearchParams?.minBedrooms || 2
    };

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (onSearch) onSearch();
      
      console.log('🗺️ Boundary search with bounds:', bounds);
      
      const foundProperties = await EnhancedRealEstateAPIService.searchPropertiesWithBoundary(searchParams);
      console.log('🏠 Properties found in boundary:', foundProperties.length);
      
      setProperties(foundProperties);
      
      if (foundProperties.length === 0) {
        setError('No properties found in the selected area. Try expanding your search area or adjusting your criteria.');
      } else {
        setSuccess(`Found ${foundProperties.length} investment properties in the selected area!`);
      }
    } catch (err) {
      console.error('Boundary search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Boundary search failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (property: PropertyListing) => {
    setSelectedProperty(property);
    console.log('Selected property:', property);
  };

  const handleReset = () => {
    setProperties([]);
    setSelectedProperty(null);
    setCurrentSearchLocation('');
    setError(null);
    setSuccess(null);
    setLastSearchParams(null);
  };

  return (
    <Box 
      sx={{ 
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default'
      }}
    >
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold', 
          color: 'primary.main',
          textAlign: 'center',
          mb: 2
        }}>
          🏠 Investment Property Calculator
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 2, color: 'text.secondary' }}>
          Search by criteria or draw areas on the map to find profitable investment properties
        </Typography>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ mb: 2 }}>
          <Button
            variant={showSearchForm ? "contained" : "outlined"}
            startIcon={<FilterAlt />}
            onClick={() => setShowSearchForm(!showSearchForm)}
            size="small"
          >
            {showSearchForm ? 'Hide' : 'Show'} Search Form
          </Button>
          
          <Button
            variant={showMap ? "contained" : "outlined"}
            startIcon={<MapIcon />}
            onClick={() => setShowMap(!showMap)}
            size="small"
          >
            {showMap ? 'Hide' : 'Show'} Map
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleReset}
            size="small"
          >
            Reset
          </Button>
        </Stack>

        {/* Search limit warning */}
        {!canSearch && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Search Limit Reached
            </Typography>
            <Typography sx={{ mb: 1 }}>
              You've used all {maxSearches} free searches. Upgrade to Pro for unlimited access!
            </Typography>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={onUpgrade}
              sx={{ mt: 1 }}
            >
              Upgrade to Pro - $4.99/month
            </Button>
          </Alert>
        )}

        {/* Status Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Property Count */}
        {properties.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Chip 
              icon={<PinDrop />} 
              label={`${properties.length} Properties Found`} 
              color="primary" 
              variant="filled"
            />
            {currentSearchLocation && (
              <Chip 
                label={`Location: ${currentSearchLocation}`} 
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 2,
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {/* Left Panel - Search Form */}
        {showSearchForm && (
          <Box sx={{ 
            flex: { xs: '0 0 auto', lg: '0 0 400px' },
            minHeight: { xs: 'auto', lg: 0 },
            maxHeight: { xs: '50vh', lg: 'none' },
            overflow: 'auto'
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Search />
                  Search Criteria
                </Typography>
                <AreaSearchForm 
                  onSearch={handleAreaSearch}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Center Panel - Map */}
        {showMap && (
          <Box sx={{ 
            flex: 1,
            minHeight: { xs: '400px', lg: '600px' },
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon />
                    Interactive Map
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                    💡 Draw rectangles to search specific areas
                  </Typography>
                </Box>
                <Divider sx={{ mb: 1 }} />
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <InteractiveMapWithBoundary 
                    properties={properties}
                    selectedProperty={selectedProperty}
                    onPropertySelect={handlePropertySelect}
                    searchLocation={currentSearchLocation}
                    onBoundarySearch={handleBoundarySearch}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Right Panel - Property List */}
        {properties.length > 0 && (
          <Box sx={{ 
            flex: { xs: '0 0 auto', lg: '0 0 400px' },
            minHeight: { xs: 'auto', lg: 0 },
            maxHeight: { xs: '50vh', lg: 'none' },
            overflow: 'auto'
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 1 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, px: 1 }}>
                  <ListIcon />
                  Properties ({properties.length})
                </Typography>
                <Box sx={{ height: 'calc(100% - 48px)', overflow: 'auto' }}>
                  <PropertyListView 
                    properties={properties}
                    onPropertySelect={setSelectedProperty}
                    selectedProperty={selectedProperty}
                    loading={loading}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
}
