import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  Paper,
  IconButton,
  Avatar,
  Stack,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
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
  TrendingUp,
  ViewModule,
  ViewList,
  Image as ImageIcon
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  // Generate property images (using placeholder service for demo)
  const getPropertyImage = (property: PropertyListing, index: number) => {
    const propertyId = property.id || `prop-${index}`;
    const seed = propertyId.slice(-3); // Use last 3 chars as seed
    
    // Using Lorem Picsum for placeholder property images
    const imageId = parseInt(seed, 36) % 1000 + 100; // Generate ID between 100-1099
    return `https://picsum.photos/400/300?random=${imageId}`;
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedProperties = properties.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
          // Remove height restrictions to allow natural page scrolling
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
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newView) => newView && setViewMode(newView)}
                size="small"
              >
                <ToggleButton value="cards">
                  <ViewModule sx={{ mr: 1 }} />
                  Cards
                </ToggleButton>
                <ToggleButton value="table">
                  <ViewList sx={{ mr: 1 }} />
                  Table
                </ToggleButton>
              </ToggleButtonGroup>
              
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

        {/* Results Grid */}
        {properties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No properties found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search criteria or drawing a larger area on the map.
            </Typography>
          </Paper>
        ) : viewMode === 'cards' ? (
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)' 
            },
            gap: 3,
            mb: 3
          }}>
            {paginatedProperties.map((property, index) => (
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
                {/* Property Image */}
                <CardMedia
                  component="img"
                  height="200"
                  image={getPropertyImage(property, index)}
                  alt={`${property.address} - Property Image`}
                  sx={{
                    objectFit: 'cover'
                  }}
                />
                
                <CardContent>

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
        ) : (
          // Table View
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Rent</TableCell>
                  <TableCell align="center">Beds/Baths</TableCell>
                  <TableCell align="right">Sq Ft</TableCell>
                  <TableCell align="right">Yield</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProperties.map((property, index) => (
                  <TableRow 
                    key={`property-${property.id || index}`}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => onPropertySelect(property)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="img"
                          src={getPropertyImage(property, index)}
                          alt="Property"
                          sx={{
                            width: 60,
                            height: 45,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {property.address.split(',')[0]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {property.city}, {property.state}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{property.address}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        ${formatNumber(property.purchasePrice || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main">
                        ${formatNumber(property.monthlyRent || 0)}/mo
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {property.bedrooms}/{property.bathrooms}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatNumber(property.squareFootage || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${getRentalYield(property).toFixed(1)}%`}
                        color={getROIColor(getRentalYield(property))}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={property.propertyType || 'Single Family'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <Paper sx={{ p: 2 }}>
          <TablePagination
            component="div"
            count={properties.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[6, 12, 24, 48]}
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
            labelRowsPerPage="Properties per page:"
          />
        </Paper>
      </Container>
    </Box>
  );
}
