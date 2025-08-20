import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Paper,
  IconButton,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  LocationOn,
  Home,
  Bed,
  Bathtub,
  SquareFoot,
  AttachMoney,
  CalendarToday,
  TrendingUp
} from '@mui/icons-material';
import NavigationBar from './NavigationBar';
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getROIColor = (roi: number) => {
    if (roi >= 15) return 'success';
    if (roi >= 10) return 'warning';
    return 'error';
  };

  const getRentalYield = (property: PropertyListing) => {
    if (!property.purchasePrice || !property.monthlyRent) return 0;
    return ((property.monthlyRent * 12) / property.purchasePrice) * 100;
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
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

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Search Summary */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
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

        {/* Results Grid */}
        {properties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No properties found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or drawing a larger area on the map.
            </Typography>
            <Button 
              variant="contained" 
              onClick={onBack} 
              sx={{ mt: 2 }}
              startIcon={<ArrowBack />}
            >
              Back to Search
            </Button>
          </Paper>
        ) : (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            },
            gap: 3
          }}>
            {properties.map((property, index) => (
              <Card 
                key={`property-${property.id || index}`}
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => onPropertySelect(property)}
              >
                  <CardContent>
                    {/* Property Image Placeholder */}
                    <Box
                      sx={{
                        height: 200,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: (property as any).imageUrl ? `url(${(property as any).imageUrl})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!(property as any).imageUrl && (
                        <Home sx={{ fontSize: 60, color: 'grey.400' }} />
                      )}
                    </Box>

                    {/* Price */}
                    <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                      {formatPrice(property.purchasePrice || 0)}
                    </Typography>

                    {/* Address */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {property.address}, {property.city}, {property.state} {property.zipCode}
                      </Typography>
                    </Box>

                    {/* Property Details */}
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Bed fontSize="small" color="action" />
                        <Typography variant="body2">{property.bedrooms || 'N/A'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Bathtub fontSize="small" color="action" />
                        <Typography variant="body2">{property.bathrooms || 'N/A'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SquareFoot fontSize="small" color="action" />
                        <Typography variant="body2">{formatNumber(property.squareFootage || 0)} sq ft</Typography>
                      </Box>
                    </Stack>

                    {/* Investment Metrics */}
                    <Divider sx={{ my: 2 }} />
                    
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Monthly Rent
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatPrice(property.monthlyRent || 0)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Rental Yield
                        </Typography>
                        <Chip
                          label={`${getRentalYield(property).toFixed(1)}%`}
                          color={getROIColor(getRentalYield(property))}
                          size="small"
                        />
                      </Box>
                    </Stack>

                    {/* Property Type */}
                    <Box sx={{ mt: 2 }}>
                      <Chip
                        label={property.propertyType || 'Single Family'}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
