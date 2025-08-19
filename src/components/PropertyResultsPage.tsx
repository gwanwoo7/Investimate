import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ArrowBack,
  ViewList,
  ViewModule,
  FilterList
} from '@mui/icons-material';
import PropertyListView from './PropertyListView';
import type { PropertyListing } from '../types/property';

interface PropertyResultsPageProps {
  properties: PropertyListing[];
  searchLocation?: string;
  onBack: () => void;
  onPropertySelect?: (property: PropertyListing) => void;
}

export default function PropertyResultsPage({
  properties,
  searchLocation,
  onBack,
  onPropertySelect
}: PropertyResultsPageProps) {
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handlePropertySelect = (property: PropertyListing) => {
    setSelectedProperty(property);
    if (onPropertySelect) {
      onPropertySelect(property);
    }
  };

  const PropertyGridView = () => (
    <Grid container spacing={2}>
      {properties.map((property) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={property.id}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3
              },
              border: selectedProperty?.id === property.id ? '2px solid' : 'none',
              borderColor: 'primary.main'
            }}
            onClick={() => handlePropertySelect(property)}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1, fontWeight: 'bold' }}>
                {property.address}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {property.city}, {property.state}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                  ${property.purchasePrice.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {property.bedrooms} bed • {property.bathrooms} bath • {property.squareFootage} sqft
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Est. Rent:</strong> ${property.estimatedRent.toLocaleString()}/mo
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: property.estimatedCashFlow >= 0 ? 'success.main' : 'error.main' 
                }}>
                  <strong>Cash Flow:</strong> ${property.estimatedCashFlow.toLocaleString()}/mo
                </Typography>
                <Typography variant="body2">
                  <strong>COC Return:</strong> {property.estimatedCOCReturn.toFixed(1)}%
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                  label={`${property.investmentScore.toFixed(1)}/10`}
                  size="small"
                  sx={{
                    backgroundColor: 
                      property.investmentScore >= 8 ? '#4caf50' :
                      property.investmentScore >= 6 ? '#2196f3' :
                      property.investmentScore >= 4 ? '#ff9800' : '#f44336',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {property.investmentRank}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={onBack}
              variant="outlined"
            >
              Back to Search
            </Button>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              Search Results
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="List View">
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Grid View">
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Results Summary */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip 
            icon={<FilterList />}
            label={`${properties.length} Properties Found`} 
            color="primary" 
            variant="filled"
          />
          {searchLocation && (
            <Chip 
              label={`Location: ${searchLocation}`} 
              variant="outlined"
            />
          )}
          <Typography variant="body2" color="text.secondary">
            Showing investment opportunities sorted by score
          </Typography>
        </Box>
      </Paper>

      {/* Results Content */}
      <Box sx={{ flex: 1, overflow: 'auto', pb: 4 }}>
        {properties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Properties Found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Try adjusting your search criteria or drawing a different area on the map.
            </Typography>
            <Button variant="contained" onClick={onBack}>
              Modify Search
            </Button>
          </Paper>
        ) : (
          <>
            {viewMode === 'list' ? (
              <PropertyListView
                properties={properties}
                onPropertySelect={handlePropertySelect}
                selectedProperty={selectedProperty}
                loading={false}
              />
            ) : (
              <PropertyGridView />
            )}
          </>
        )}
      </Box>
    </Box>
  );
}
