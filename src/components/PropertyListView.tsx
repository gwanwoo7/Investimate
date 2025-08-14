import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Avatar,
  Divider,
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
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton
} from '@mui/material';
import { 
  TrendingUp, 
  Home, 
  Calendar,
  MapPin,
  ExternalLink,
  Calculator,
  Info,
  ChevronDown
} from 'lucide-react';
import type { PropertyListing } from '../types/property';

interface PropertyListViewProps {
  properties: PropertyListing[];
  onPropertySelect: (property: PropertyListing) => void;
  selectedProperty?: PropertyListing | null;
  loading?: boolean;
}

export default function PropertyListView({ 
  properties, 
  onPropertySelect, 
  selectedProperty: _selectedProperty,
  loading = false 
}: PropertyListViewProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [fullAnalysisOpen, setFullAnalysisOpen] = useState(false);
  const [selectedForAnalysis, setSelectedForAnalysis] = useState<PropertyListing | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#4caf50'; // Green
    if (score >= 6) return '#ff9800'; // Orange
    if (score >= 4) return '#f44336'; // Red
    return '#9e9e9e'; // Grey
  };

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
        <Typography variant="h6" gutterBottom>
          No properties found
        </Typography>
        <Typography color="text.secondary">
          Try adjusting your search criteria or check your API connection
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      p: 2
    }}>
      {/* Header with smaller font */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
        <Typography variant="body1" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
          Investment Properties ({properties.length} found)
        </Typography>
        <Box>
          <Button
            size="small"
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            sx={{ mr: 1 }}
          >
            Table View
          </Button>
          <Button
            size="small"
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('cards')}
          >
            Card View
          </Button>
        </Box>
      </Box>
      
      {viewMode === 'table' ? (
        /* Table View */
        <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>BR/BA</TableCell>
                <TableCell>Sq Ft</TableCell>
                <TableCell>Monthly Rent</TableCell>
                <TableCell>Cash Flow</TableCell>
                <TableCell>COC Return</TableCell>
                <TableCell>Cap Rate</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.map((property, index) => (
                <TableRow 
                  key={property.id}
                  sx={{ 
                    backgroundColor: index === 0 ? '#e8f5e8' : 'inherit',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {index === 0 && <Typography sx={{ mr: 1 }}>🏆</Typography>}
                      <Chip 
                        label={index + 1}
                        size="small"
                        color={index === 0 ? 'success' : 'default'}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {property.address}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {property.city}, {property.state}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(property.purchasePrice)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {property.bedrooms}BR/{property.bathrooms}BA
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {property.squareFootage} sq ft
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatCurrency(property.quickAnalysis.monthlyRent)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={property.estimatedCashFlow > 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(property.estimatedCashFlow)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {property.estimatedCOCReturn.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {property.estimatedCapRate.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Avatar
                      sx={{ 
                        bgcolor: getScoreColor(property.investmentScore),
                        width: 32,
                        height: 32
                      }}
                    >
                      <Typography variant="caption" color="white" fontWeight="bold">
                        {property.investmentScore}
                      </Typography>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip
                        title={
                          <Box sx={{ p: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>{property.address}</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '12px' }}>
                              <Box>Price: {formatCurrency(property.purchasePrice)}</Box>
                              <Box>Rent: {formatCurrency(property.quickAnalysis.monthlyRent)}</Box>
                              <Box>Bedrooms: {property.bedrooms}BR</Box>
                              <Box>Bathrooms: {property.bathrooms}BA</Box>
                              <Box>Sq Ft: {property.squareFootage}</Box>
                              <Box>Type: {property.propertyType}</Box>
                              <Box>Cash Flow: {formatCurrency(property.estimatedCashFlow)}</Box>
                              <Box>COC: {property.estimatedCOCReturn.toFixed(1)}%</Box>
                              <Box>Days on Market: {property.daysOnMarket || 'N/A'}</Box>
                              <Box>Score: {property.investmentScore}/10</Box>
                            </Box>
                          </Box>
                        }
                        placement="left"
                        arrow
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleQuickView(property)}
                        >
                          <Info size={16} />
                        </IconButton>
                      </Tooltip>
                      
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleFullAnalysis(property)}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        <Calculator size={16} />
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* Card View */
        <Box sx={{ 
          flex: 1,
          overflow: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px',
            '&:hover': {
              background: '#a8a8a8',
            },
          },
        }}>
          <Stack spacing={2} sx={{ pb: 2 }}>
            {properties.map((property, index) => (
            <Card 
              key={property.id}
              sx={{ 
                position: 'relative',
                border: index === 0 ? '2px solid #4caf50' : '1px solid #e0e0e0',
                '&:hover': { 
                  boxShadow: 6,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              {index === 0 && (
                <Chip
                  label="🏆 Best Investment"
                  color="success"
                  sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}
                />
              )}
              
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
                  {/* Property Info */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{ 
                          bgcolor: getScoreColor(property.investmentScore),
                          width: 56,
                          height: 56,
                          mr: 2
                        }}
                      >
                        <Typography variant="h6" color="white">
                          {property.investmentScore}
                        </Typography>
                      </Avatar>
                      <Box>
                        <Chip 
                          label={property.investmentRank}
                          color={getRankBadgeColor(property.investmentRank) as any}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Investment Score
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      {property.address}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                      <Chip icon={<MapPin size={16} />} label={`${property.city}, ${property.state}`} size="small" />
                      <Chip label={`${property.bedrooms}BR/${property.bathrooms}BA`} size="small" />
                      <Chip label={`${property.squareFootage} sq ft`} size="small" />
                    </Stack>

                    <Typography variant="h5" color="primary" gutterBottom>
                      ${property.purchasePrice.toLocaleString()}
                    </Typography>

                    {property.daysOnMarket && (
                      <Typography variant="body2" color="text.secondary">
                        <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        {property.daysOnMarket} days on market
                      </Typography>
                    )}
                  </Box>

                  {/* Investment Metrics */}
                  <Box sx={{ flex: 1.5 }}>
                    <Typography variant="h6" gutterBottom>
                      Investment Metrics (Real Zillow Data)
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mb: 2 }}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="h5" color="success.main">
                          {property.estimatedCOCReturn.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">Cash-on-Cash ROI</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="h5" color="primary.main">
                          {property.estimatedCapRate.toFixed(1)}%
                        </Typography>
                        <Typography variant="body2">Cap Rate</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="h5" color={property.estimatedCashFlow > 0 ? 'success.main' : 'error.main'}>
                          ${property.estimatedCashFlow}
                        </Typography>
                        <Typography variant="body2">Monthly Cash Flow</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="h5">
                          ${property.quickAnalysis.totalCashNeeded.toLocaleString()}
                        </Typography>
                        <Typography variant="body2">Cash Needed</Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" gutterBottom>
                      Analysis with Real Market Data:
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Monthly Rent (Zillow estimate):</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          ${property.quickAnalysis.monthlyRent}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Monthly Expenses:</Typography>
                        <Typography variant="body2">
                          -${property.quickAnalysis.monthlyExpenses}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 2, fontSize: '11px', color: 'text.secondary' }}>
                        • Property Management: {formatCurrency(property.quickAnalysis.monthlyRent * 0.10)} (10% of rent)<br/>
                        • Property Tax: {formatCurrency((property.monthlyPropertyTaxes || (property.purchasePrice * 0.015) / 12))} {property.monthlyPropertyTaxes ? '(Zillow API)' : '(estimated)'}<br/>
                        • Insurance: {formatCurrency((property.monthlyInsurance || (property.purchasePrice * 0.006) / 12))} {property.monthlyInsurance ? '(Zillow API)' : '(estimated)'}<br/>
                        • Vacancy Reserve: {formatCurrency(property.quickAnalysis.monthlyRent * 0.035)} (3.5% of rent)<br/>
                        • Maintenance Reserve: {formatCurrency(property.quickAnalysis.monthlyRent * 0.08)} (8% of rent)<br/>
                        • Owner Paid Utilities: $0 (per your formula)<br/>
                        {property.monthlyHoaFee && property.monthlyHoaFee > 0 && `• HOA Fees: ${formatCurrency(property.monthlyHoaFee)} (Zillow API)`}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Monthly Mortgage:</Typography>
                        <Typography variant="body2">
                          -${property.quickAnalysis.monthlyMortgage}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 2, fontSize: '11px', color: 'text.secondary' }}>
                        • {property.mortgagePayment ? 'Zillow Mortgage Data' : '25% down payment, 6.5% rate, 30-year term'}
                        {property.interestRate && <br/>}
                        {property.interestRate && `• Interest Rate: ${(property.interestRate * 100).toFixed(2)}% (Zillow API)`}
                      </Box>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" fontWeight="bold">Net Cash Flow:</Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={property.quickAnalysis.monthlyCashFlow > 0 ? 'success.main' : 'error.main'}
                        >
                          ${property.quickAnalysis.monthlyCashFlow}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ flex: 0.8 }}>
                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Calculator />}
                        onClick={() => handleFullAnalysis(property)}
                        size="large"
                      >
                        Full Analysis
                      </Button>
                      
                      <Tooltip
                        title={
                          <Box sx={{ p: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>{property.address}</Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, fontSize: '12px' }}>
                              <Box>Price: {formatCurrency(property.purchasePrice)}</Box>
                              <Box>Rent: {formatCurrency(property.quickAnalysis.monthlyRent)}</Box>
                              <Box>Bedrooms: {property.bedrooms}BR</Box>
                              <Box>Bathrooms: {property.bathrooms}BA</Box>
                              <Box>Sq Ft: {property.squareFootage}</Box>
                              <Box>Type: {property.propertyType}</Box>
                              <Box>Cash Flow: {formatCurrency(property.estimatedCashFlow)}</Box>
                              <Box>COC: {property.estimatedCOCReturn.toFixed(1)}%</Box>
                              <Box>Days on Market: {property.daysOnMarket || 'N/A'}</Box>
                              <Box>Score: {property.investmentScore}/10</Box>
                            </Box>
                          </Box>
                        }
                        placement="left"
                        arrow
                      >
                        <Button
                          variant="outlined"
                          fullWidth
                          startIcon={<TrendingUp />}
                          onClick={() => handleQuickView(property)}
                        >
                          Quick View
                        </Button>
                      </Tooltip>
                      
                      {property.listingUrl && (
                        <Button
                          variant="text"
                          fullWidth
                          startIcon={<ExternalLink />}
                          onClick={() => window.open(property.listingUrl, '_blank')}
                          size="small"
                        >
                          View on Zillow
                        </Button>
                      )}
                    </Stack>

                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Rank #{index + 1}
                      </Typography>
                      <Typography variant="h6" align="center" color="primary">
                        {property.investmentScore}/10
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
          </Stack>
        </Box>
      )}

      {/* Quick View Dialog */}
      <Dialog open={quickViewOpen} onClose={() => setQuickViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Quick Property Analysis
          {selectedForAnalysis && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedForAnalysis.address}, {selectedForAnalysis.city}, {selectedForAnalysis.state}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedForAnalysis && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3, mb: 3 }}>
                <Box>
                  <Typography variant="h6" gutterBottom>Property Details</Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Price:</Typography>
                      <Typography fontWeight="bold">{formatCurrency(selectedForAnalysis.purchasePrice)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Bedrooms/Bathrooms:</Typography>
                      <Typography>{selectedForAnalysis.bedrooms}BR/{selectedForAnalysis.bathrooms}BA</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Square Footage:</Typography>
                      <Typography>{selectedForAnalysis.squareFootage} sq ft</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Property Type:</Typography>
                      <Typography>{selectedForAnalysis.propertyType}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Days on Market:</Typography>
                      <Typography>{selectedForAnalysis.daysOnMarket || 'N/A'}</Typography>
                    </Box>
                  </Stack>
                </Box>
                
                <Box>
                  <Typography variant="h6" gutterBottom>Investment Metrics</Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Monthly Rent:</Typography>
                      <Typography fontWeight="bold" color="success.main">
                        {formatCurrency(selectedForAnalysis.quickAnalysis.monthlyRent)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Cash Flow:</Typography>
                      <Typography 
                        fontWeight="bold"
                        color={selectedForAnalysis.estimatedCashFlow > 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(selectedForAnalysis.estimatedCashFlow)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">COC Return:</Typography>
                      <Typography fontWeight="bold">{selectedForAnalysis.estimatedCOCReturn.toFixed(1)}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Cap Rate:</Typography>
                      <Typography fontWeight="bold">{selectedForAnalysis.estimatedCapRate.toFixed(1)}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography color="text.secondary">Investment Score:</Typography>
                      <Typography fontWeight="bold" color={getScoreColor(selectedForAnalysis.investmentScore)}>
                        {selectedForAnalysis.investmentScore}/10
                      </Typography>
                    </Box>
                  </Stack>
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
      <Dialog open={fullAnalysisOpen} onClose={() => setFullAnalysisOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Detailed Investment Analysis with Real Zillow Data
          {selectedForAnalysis && (
            <Typography variant="subtitle1" color="text.secondary">
              {selectedForAnalysis.address}, {selectedForAnalysis.city}, {selectedForAnalysis.state}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedForAnalysis && (
            <Box sx={{ mt: 2 }}>
              {/* Investment Summary */}
              <Alert 
                severity={selectedForAnalysis.investmentScore >= 7 ? 'success' : 
                         selectedForAnalysis.investmentScore >= 5 ? 'warning' : 'error'}
                sx={{ mb: 3 }}
              >
                <Typography variant="h6">
                  Investment Recommendation: {selectedForAnalysis.investmentRank}
                </Typography>
                <Typography>
                  Score: {selectedForAnalysis.investmentScore}/10 | 
                  Expected Monthly Cash Flow: {formatCurrency(selectedForAnalysis.estimatedCashFlow)}
                </Typography>
              </Alert>

              {/* Real Data Source Information */}
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Real Market Data Sources</Typography>
                <Typography variant="body2">
                  • Property Price & Details: Zillow API (Live Data)<br/>
                  • Rent Estimates: Zillow RentZestimate (Live Data)<br/>
                  • Insurance & Mortgage: Market-based calculations using current rates<br/>
                  • Property Tax: Local assessment data (1.5% annually)<br/>
                  • Market comparables updated in real-time
                </Typography>
              </Alert>

              {/* Calculation Methodology */}
              <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <Typography variant="h6">Your Financial Formula Breakdown (10% + 3.5% + 8% + Zillow API Data)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold">Your Operating Cost Formula (10% + 3.5% + 8%):</Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Property Management (10% of rent):</Typography>
                          <Typography>{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyRent * 0.10)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Property Tax {selectedForAnalysis.monthlyPropertyTaxes ? '(Zillow API)' : '(1.5% annually)'}:</Typography>
                          <Typography>{formatCurrency(selectedForAnalysis.monthlyPropertyTaxes || (selectedForAnalysis.purchasePrice * 0.015) / 12)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Insurance {selectedForAnalysis.monthlyInsurance ? '(Zillow API)' : '(0.6% annually)'}:</Typography>
                          <Typography>{formatCurrency(selectedForAnalysis.monthlyInsurance || (selectedForAnalysis.purchasePrice * 0.006) / 12)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Owner Paid Utilities (per your formula):</Typography>
                          <Typography>$0</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Vacancy Reserves (3.5% of rent):</Typography>
                          <Typography>{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyRent * 0.035)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Maintenance Reserve (8% of rent):</Typography>
                          <Typography>{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyRent * 0.08)}</Typography>
                        </Box>
                        {selectedForAnalysis.monthlyHoaFee && selectedForAnalysis.monthlyHoaFee > 0 && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>HOA Fees (Zillow API):</Typography>
                            <Typography>{formatCurrency(selectedForAnalysis.monthlyHoaFee)}</Typography>
                          </Box>
                        )}
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography fontWeight="bold">Total Operating Cost:</Typography>
                          <Typography fontWeight="bold">{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyExpenses)}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle1" gutterBottom fontWeight="bold">Mortgage Details {selectedForAnalysis.mortgagePayment ? '(Zillow API)' : '(Calculated)'}:</Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Property Price (Zillow Data):</Typography>
                          <Typography>{formatCurrency(selectedForAnalysis.purchasePrice)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Down Payment (25% Standard):</Typography>
                          <Typography>{formatCurrency(selectedForAnalysis.purchasePrice * 0.25)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Loan Amount:</Typography>
                          <Typography>{formatCurrency(selectedForAnalysis.purchasePrice * 0.75)}</Typography>
                        </Box>
                        {selectedForAnalysis.mortgagePayment ? (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Mortgage Source:</Typography>
                            <Typography color="success.main">Zillow API Data</Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Interest Rate (Calculated):</Typography>
                            <Typography>6.5% (30-year fixed)</Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Interest Rate Used:</Typography>
                          <Typography fontWeight="bold" color={selectedForAnalysis.interestRate ? 'success.main' : 'text.secondary'}>
                            {((selectedForAnalysis.interestRate || 0.065) * 100).toFixed(2)}% {selectedForAnalysis.interestRate ? '(Zillow API)' : '(Market Rate)'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Monthly Rent (Zillow RentZestimate):</Typography>
                          <Typography color="success.main">{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyRent)}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography fontWeight="bold">Monthly Mortgage P&I:</Typography>
                          <Typography fontWeight="bold">{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyMortgage)}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Detailed Financial Analysis */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 3 }}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {selectedForAnalysis.estimatedCOCReturn.toFixed(1)}%
                    </Typography>
                    <Typography variant="subtitle1">Cash-on-Cash Return</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Annual cash flow / Total cash invested
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {selectedForAnalysis.estimatedCapRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="subtitle1">Cap Rate</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Net operating income / Property value
                    </Typography>
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
                    <Typography variant="body2" color="text.secondary">
                      Zillow rent estimate - All expenses
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* Cash Flow Summary */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Monthly Net Cash Flow = Rent - Operating Cost - Mortgage (Your Formula)</Typography>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Monthly Rental Income (Zillow RentZestimate):</Typography>
                      <Typography color="success.main" fontWeight="bold">
                        +{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyRent)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Total Operating Cost (10% + 3.5% + 8% + Taxes + Insurance):</Typography>
                      <Typography color="error.main">
                        -{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyExpenses)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Mortgage P&I {selectedForAnalysis.mortgagePayment ? '(Zillow API)' : '(6.5%, 30yr)'}:</Typography>
                      <Typography color="error.main">
                        -{formatCurrency(selectedForAnalysis.quickAnalysis.monthlyMortgage)}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6">Monthly Net Cash Flow:</Typography>
                      <Typography 
                        variant="h6" 
                        color={selectedForAnalysis.estimatedCashFlow > 0 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {formatCurrency(selectedForAnalysis.estimatedCashFlow)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontStyle="italic">1st Year COC ROI = (Annual Cash Flow / Cash Invested) × 100:</Typography>
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {selectedForAnalysis.estimatedCOCReturn.toFixed(1)}%
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
            onClick={() => onPropertySelect(selectedForAnalysis!)}
          >
            Analyze This Property
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
