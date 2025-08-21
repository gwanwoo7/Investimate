import { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Alert,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  Search,
  List as ListIcon,
  PinDrop,
  Brush
} from '@mui/icons-material';
import AreaSearchForm from './AreaSearchForm';
import PropertyListView from './PropertyListView';
import PropertyResultsPage from './PropertyResultsPage';
import SuperEnhancedFreeDrawMap from './SuperEnhancedFreeDrawMap';
import type { PropertyListing, AreaSearchParams } from '../types/property';
import { EnhancedRealEstateAPIService } from '../services/enhancedRealEstateAPIService';

interface PropertyCalculatorWithMapProps {
  canSearch?: boolean;
  onSearch?: () => void;
  onUpgrade?: () => void;
  searchCount?: number;
  maxSearches?: number;
  onShowResults?: (data: {
    properties: any[];
    searchType: 'boundary' | 'area';
    searchQuery?: string;
    boundaryInfo?: { north: number; south: number; east: number; west: number };
  }) => void;
}

type MapProvider = 'super-enhanced';

export default function PropertyCalculatorWithMap({ 
  canSearch = true, 
  onSearch, 
  onUpgrade, 
  searchCount: _searchCount = 0, 
  maxSearches = 5,
  onShowResults
}: PropertyCalculatorWithMapProps) {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentSearchLocation, setCurrentSearchLocation] = useState<string>('');
  const [lastSearchParams, setLastSearchParams] = useState<AreaSearchParams | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [mapProvider] = useState<MapProvider>('super-enhanced');

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
      
      const foundProperties = await EnhancedRealEstateAPIService.searchPropertiesWithBoundary(searchData, undefined);
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
        
        if (onShowResults) {
          onShowResults({
            properties: foundProperties,
            searchType: 'area',
            searchQuery: searchLocation
          });
        } else {
          // Fallback to inline results
          setShowResults(true);
        }
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
      city: lastSearchParams?.city || '',
      state: lastSearchParams?.state || '',
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
      
      const foundProperties = await EnhancedRealEstateAPIService.searchPropertiesWithBoundary(searchParams, bounds);
      console.log('🏠 Properties found in boundary:', foundProperties.length);
      
      setProperties(foundProperties);
      
      if (foundProperties.length === 0) {
        setError('No properties found in the selected area. Try expanding your search area or adjusting your criteria.');
      } else {
        setSuccess(`Found ${foundProperties.length} investment properties in the selected area!`);
        
        if (onShowResults) {
          onShowResults({
            properties: foundProperties,
            searchType: 'boundary',
            boundaryInfo: bounds
          });
        } else {
          // Fallback to inline results
          setShowResults(true);
        }
      }
    } catch (err) {
      console.error('Boundary search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Boundary search failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePolygonSearch = async (polygon: Array<{ lat: number; lng: number }>) => {
    if (!canSearch) {
      if (onUpgrade) onUpgrade();
      return;
    }

    // Calculate bounding box from polygon
    const lats = polygon.map(p => p.lat);
    const lngs = polygon.map(p => p.lng);
    const bounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs)
    };

    // Use the same logic as boundary search but with polygon data
    await handleBoundarySearch(bounds);
  };

  const handlePropertySelect = (property: PropertyListing) => {
    setSelectedProperty(property);
    console.log('Selected property:', property);
  };

  const handleBackToSearch = () => {
    setShowResults(false);
  };

  // Show results page if we have searched properties
  if (showResults && properties.length > 0) {
    return (
      <PropertyResultsPage
        properties={properties}
        searchLocation={currentSearchLocation}
        onBack={handleBackToSearch}
        onPropertySelect={handlePropertySelect}
      />
    );
  }

  return (
    <Box 
      sx={{ 
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '10px',
          '&:hover': {
            background: '#555',
          },
        },
      }}
    >
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold', 
          color: 'primary.main',
          textAlign: 'center',
          mb: 2,
          fontSize: '1.5rem'
        }}>
          🏠 Investment Property Calculator
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
          Search by criteria or draw areas on the map to find profitable investment properties
        </Typography>

        {/* Search limit warning */}
        {!canSearch && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, fontSize: '0.85rem' }}>
              Search Limit Reached
            </Typography>
            <Typography sx={{ mb: 1, fontSize: '0.8rem' }}>
              You've used all {maxSearches} free searches. Upgrade to Pro for unlimited access!
            </Typography>
            <Button 
              variant="contained" 
              color="warning" 
              onClick={onUpgrade}
              sx={{ mt: 1, fontSize: '0.8rem' }}
            >
              Upgrade to Pro - $4.99/month
            </Button>
          </Alert>
        )}

        {/* Status Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, fontSize: '0.8rem' }}>
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
        overflow: 'hidden',
        pb: 4 // Add padding bottom for better view
      }}>
        {/* Left Panel - Search Form */}
        <Box sx={{ 
          flex: { xs: '0 0 auto', lg: '0 0 400px' },
          minHeight: { xs: 'auto', lg: 0 },
          maxHeight: { xs: '60vh', lg: '100%' },
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, pb: 1, fontSize: '0.85rem' }}>
                <Search />
                Search Criteria
              </Typography>
              <Box sx={{ overflowY: 'auto', pr: 1 }}>
                <AreaSearchForm 
                  onSearch={handleAreaSearch}
                  loading={loading}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Center Panel - Map */}
        <Box sx={{ 
          flex: 1,
          minHeight: { xs: '400px', lg: '600px' },
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.85rem' }}>
                  <Brush />
                  Interactive Map Search
                </Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <SuperEnhancedFreeDrawMap 
                  properties={properties}
                  selectedProperty={selectedProperty}
                  onPropertySelect={handlePropertySelect}
                  searchLocation={currentSearchLocation}
                  onBoundarySearch={handleBoundarySearch}
                  onPolygonSearch={handlePolygonSearch}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Panel - Property List */}
        {properties.length > 0 && (
          <Box sx={{ 
            flex: { xs: '0 0 auto', lg: '0 0 400px' },
            minHeight: { xs: 'auto', lg: 0 },
            maxHeight: { xs: '60vh', lg: '100%' },
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 1, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, px: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, fontSize: '0.85rem' }}>
                  <ListIcon />
                  Properties ({properties.length})
                </Typography>
                <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pr: 1 }}>
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
