import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Link,
  CardActionArea
} from '@mui/material';
import { 
  Home, 
  ExternalLink,
  Calculator,
  Info,
  Bed,
  Bath,
  Square,
  Eye,
  BarChart3
} from 'lucide-react';
import type { PropertyListing } from '../types/property';
import { getPropertyImageUrl, getPropertyListingLinks } from '../utils/propertyLinks';

interface PropertyListViewProps {
  properties: PropertyListing[];
  onPropertySelect: (property: PropertyListing) => void;
  selectedProperty?: PropertyListing | null;
  loading?: boolean;
}

export default function PropertyListView({ 
  properties, 
  onPropertySelect, 
  selectedProperty,
  loading = false 
}: PropertyListViewProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [fullAnalysisOpen, setFullAnalysisOpen] = useState(false);
  const [selectedForAnalysis, setSelectedForAnalysis] = useState<PropertyListing | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'Excellent': return 'success';
      case 'Good': return 'primary';
      case 'Fair': return 'warning';
      case 'Poor': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleQuickView = (property: PropertyListing) => {
    setSelectedForAnalysis(property);
    setQuickViewOpen(true);
  };

  const handleFullAnalysis = (property: PropertyListing) => {
    setSelectedForAnalysis(property);
    setFullAnalysisOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">Loading investment properties...</Typography>
      </Box>
    );
  }

  if (properties.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Home size={64} style={{ color: '#ccc', marginBottom: '16px' }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No properties found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your search criteria or drawing a different area on the map
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* View Mode Toggle */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {properties.length} Properties Found
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('cards')}
            startIcon={<Eye size={16} />}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setViewMode('table')}
            startIcon={<BarChart3 size={16} />}
          >
            Table
          </Button>
        </Stack>
      </Box>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2 
        }}>
          {properties.map((property) => {
            const imageUrl = getPropertyImageUrl(property);
            const listingLinks = getPropertyListingLinks(property);
            
            return (
              <Card 
                key={property.id}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardActionArea onClick={() => onPropertySelect(property)}>
                  <CardMedia
                    component="img"
                    height={180}
                    image={imageUrl}
                    alt={`${property.address}, ${property.city}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop&auto=format&q=80';
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" noWrap gutterBottom>
                      {property.address}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {property.city}, {property.state} {property.zipCode}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        label={`${property.bedrooms || 'N/A'} bed`} 
                        size="small" 
                        icon={<Bed size={14} />}
                        variant="outlined"
                      />
                      <Chip 
                        label={`${property.bathrooms || 'N/A'} bath`} 
                        size="small" 
                        icon={<Bath size={14} />}
                        variant="outlined"
                      />
                      <Chip 
                        label={`${property.squareFootage?.toLocaleString() || 'N/A'} sqft`} 
                        size="small" 
                        icon={<Square size={14} />}
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h5" color="primary" gutterBottom>
                        {formatCurrency(property.purchasePrice || property.marketValue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Est. Rent: {formatCurrency(property.estimatedRent)}/mo
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">ROI:</Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold"
                        color={property.estimatedCOCReturn > 8 ? 'success.main' : property.estimatedCOCReturn > 5 ? 'warning.main' : 'error.main'}
                      >
                        {property.estimatedCOCReturn.toFixed(1)}%
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Cash Flow:</Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold"
                        color={property.estimatedCashFlow > 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(property.estimatedCashFlow)}/mo
                      </Typography>
                    </Box>

                    <Chip 
                      label={property.investmentRank} 
                      color={getRankBadgeColor(property.investmentRank)} 
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  </CardContent>
                </CardActionArea>
                
                <CardContent sx={{ pt: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleQuickView(property)}
                      startIcon={<Info size={14} />}
                    >
                      Quick View
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleFullAnalysis(property)}
                      startIcon={<Calculator size={14} />}
                    >
                      Analyze
                    </Button>
                  </Stack>
                  
                  <Stack direction="row" spacing={1}>
                    <Link 
                      href={listingLinks.zillow} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ textDecoration: 'none' }}
                    >
                      <Button 
                        size="small" 
                        variant="text" 
                        startIcon={<ExternalLink size={12} />}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        Zillow
                      </Button>
                    </Link>
                    <Link 
                      href={listingLinks.redfin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      sx={{ textDecoration: 'none' }}
                    >
                      <Button 
                        size="small" 
                        variant="text" 
                        startIcon={<ExternalLink size={12} />}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        Redfin
                      </Button>
                    </Link>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Rent</TableCell>
                <TableCell align="right">Cash Flow</TableCell>
                <TableCell align="right">COC Return</TableCell>
                <TableCell align="center">Rank</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property) => {
                const imageUrl = getPropertyImageUrl(property);
                const listingLinks = getPropertyListingLinks(property);
                
                return (
                  <TableRow 
                    key={property.id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => onPropertySelect(property)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="img"
                          src={imageUrl}
                          alt={property.address}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=80&fit=crop&auto=format&q=80';
                          }}
                          sx={{
                            width: 80,
                            height: 60,
                            borderRadius: 1,
                            objectFit: 'cover'
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {property.address}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {property.city}, {property.state}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Chip 
                              label={`${property.bedrooms || 'N/A'}BR`} 
                              size="small" 
                              variant="outlined"
                            />
                            <Chip 
                              label={`${property.bathrooms || 'N/A'}BA`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(property.purchasePrice || property.marketValue)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${Math.round((property.purchasePrice || property.marketValue) / (property.squareFootage || 1))}/sqft
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" color="success.main">
                        {formatCurrency(property.estimatedRent)}/mo
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body1" 
                        fontWeight="bold"
                        color={property.estimatedCashFlow > 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(property.estimatedCashFlow)}/mo
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body1" 
                        fontWeight="bold"
                        color={property.estimatedCOCReturn > 8 ? 'success.main' : property.estimatedCOCReturn > 5 ? 'warning.main' : 'error.main'}
                      >
                        {property.estimatedCOCReturn.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={property.investmentRank} 
                        color={getRankBadgeColor(property.investmentRank)} 
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Quick View">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickView(property);
                            }}
                          >
                            <Info size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Full Analysis">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFullAnalysis(property);
                            }}
                          >
                            <Calculator size={16} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View on Zillow">
                          <IconButton 
                            size="small"
                            component={Link}
                            href={listingLinks.zillow}
                            target="_blank"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink size={16} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Quick View Dialog */}
      <Dialog open={quickViewOpen} onClose={() => setQuickViewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Quick Property Overview</DialogTitle>
        <DialogContent>
          {selectedForAnalysis && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedForAnalysis.address}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedForAnalysis.city}, {selectedForAnalysis.state} {selectedForAnalysis.zipCode}
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Purchase Price</Typography>
                  <Typography variant="h6">{formatCurrency(selectedForAnalysis.purchasePrice || selectedForAnalysis.marketValue)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Estimated Rent</Typography>
                  <Typography variant="h6" color="success.main">{formatCurrency(selectedForAnalysis.estimatedRent)}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Monthly Cash Flow</Typography>
                  <Typography 
                    variant="h6" 
                    color={selectedForAnalysis.estimatedCashFlow > 0 ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(selectedForAnalysis.estimatedCashFlow)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">COC Return</Typography>
                  <Typography variant="h6" color="primary.main">{selectedForAnalysis.estimatedCOCReturn.toFixed(1)}%</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickViewOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setQuickViewOpen(false);
              if (selectedForAnalysis) handleFullAnalysis(selectedForAnalysis);
            }}
          >
            Full Analysis
          </Button>
        </DialogActions>
      </Dialog>

      {/* Full Analysis Dialog */}
      <Dialog open={fullAnalysisOpen} onClose={() => setFullAnalysisOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detailed Investment Analysis</DialogTitle>
        <DialogContent>
          {selectedForAnalysis && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedForAnalysis.address}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {selectedForAnalysis.city}, {selectedForAnalysis.state} {selectedForAnalysis.zipCode}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {selectedForAnalysis.estimatedCOCReturn.toFixed(1)}%
                    </Typography>
                    <Typography variant="subtitle1">Cash-on-Cash Return</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {selectedForAnalysis.estimatedCapRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="subtitle1">Cap Rate</Typography>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h4" 
                      color={selectedForAnalysis.estimatedCashFlow > 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(selectedForAnalysis.estimatedCashFlow)}
                    </Typography>
                    <Typography variant="subtitle1">Monthly Cash Flow</Typography>
                  </CardContent>
                </Card>
              </Box>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Monthly Cash Flow Analysis</Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Monthly Rental Income:</Typography>
                      <Typography color="success.main" fontWeight="bold">
                        +{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyRent)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Operating Expenses:</Typography>
                      <Typography color="error.main">
                        -{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyExpenses)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Mortgage Payment:</Typography>
                      <Typography color="error.main">
                        -{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyMortgage)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: 1, borderColor: 'divider', pt: 1 }}>
                      <Typography variant="h6">Net Cash Flow:</Typography>
                      <Typography 
                        variant="h6" 
                        color={selectedForAnalysis.estimatedCashFlow > 0 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {formatCurrency(selectedForAnalysis.estimatedCashFlow)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFullAnalysisOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setFullAnalysisOpen(false);
              if (selectedForAnalysis) onPropertySelect(selectedForAnalysis);
            }}
          >
            Select This Property
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
