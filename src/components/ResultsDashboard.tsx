import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Alert
} from '@mui/material';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { PropertyAnalysis } from '../types/property';

interface ResultsDashboardProps {
  analysis: PropertyAnalysis;
  onReset: () => void;
}

export default function ResultsDashboard({ analysis, onReset }: ResultsDashboardProps) {
  const { cashFlow, recommendation, property } = analysis;

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'Strong Buy': return 'success';
      case 'Buy': return 'info';
      case 'Hold': return 'warning';
      case 'Avoid': return 'error';
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

  const formatPercentage = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Investment Analysis Results
      </Typography>
      
      <Alert 
        severity={getRecommendationColor(recommendation.recommendation) as any}
        sx={{ mb: 3 }}
      >
        <Typography variant="h6">
          Recommendation: {recommendation.recommendation}
        </Typography>
        <Typography variant="body2">
          Investment Score: {recommendation.score}/10
        </Typography>
      </Alert>

      <Stack spacing={3}>
        {/* Key Metrics */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Financial Metrics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ minWidth: 200 }}>
                <Typography color="text.secondary">Monthly Cash Flow</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {cashFlow.monthlyCashFlow >= 0 ? 
                    <TrendingUp color="green" size={20} /> : 
                    <TrendingDown color="red" size={20} />
                  }
                  <Typography variant="h6" color={cashFlow.monthlyCashFlow >= 0 ? 'success.main' : 'error.main'}>
                    {formatCurrency(cashFlow.monthlyCashFlow)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ minWidth: 200 }}>
                <Typography color="text.secondary">Cash-on-Cash Return</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DollarSign size={20} />
                  <Typography variant="h6">
                    {formatPercentage(cashFlow.cashOnCashReturn)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ minWidth: 200 }}>
                <Typography color="text.secondary">Cap Rate</Typography>
                <Typography variant="h6">
                  {formatPercentage(cashFlow.capRate)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Property Summary */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Property Summary
            </Typography>
            <Typography variant="body1" gutterBottom>
              {property.address}, {property.city}, {property.state}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip label={`${property.bedrooms}BR/${property.bathrooms}BA`} size="small" />
              <Chip label={`${property.squareFootage} sq ft`} size="small" />
              <Chip label={property.propertyType} size="small" />
            </Stack>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography color="text.secondary">Purchase Price</Typography>
                <Typography variant="h6">{formatCurrency(property.purchasePrice)}</Typography>
              </Box>
              <Box>
                <Typography color="text.secondary">Market Value</Typography>
                <Typography variant="h6">{formatCurrency(property.marketValue)}</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Cash Flow Breakdown */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Cash Flow Breakdown
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Rental Income</Typography>
                <Typography color="success.main">+{formatCurrency(cashFlow.monthlyRentalIncome)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Operating Expenses</Typography>
                <Typography color="error.main">-{formatCurrency(cashFlow.monthlyOperatingExpenses)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Mortgage Payment</Typography>
                <Typography color="error.main">-{formatCurrency(cashFlow.monthlyMortgagePayment)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: 1, borderColor: 'divider', pt: 1 }}>
                <Typography variant="h6">Net Cash Flow</Typography>
                <Typography variant="h6" color={cashFlow.monthlyCashFlow >= 0 ? 'success.main' : 'error.main'}>
                  {formatCurrency(cashFlow.monthlyCashFlow)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Investment Pros and Cons */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Investment Analysis
            </Typography>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" color="success.main" gutterBottom>
                  Pros
                </Typography>
                <Stack spacing={1}>
                  {recommendation.pros.map((pro, index) => (
                    <Typography key={index} variant="body2">
                      • {pro}
                    </Typography>
                  ))}
                </Stack>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" color="error.main" gutterBottom>
                  Cons
                </Typography>
                <Stack spacing={1}>
                  {recommendation.cons.map((con, index) => (
                    <Typography key={index} variant="body2">
                      • {con}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          size="large" 
          onClick={onReset}
        >
          Analyze Another Property
        </Button>
      </Box>
    </Box>
  );
}
