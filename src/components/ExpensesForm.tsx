import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import type { PropertyData, OperatingExpenses } from '../types/property';

interface ExpensesFormProps {
  property: PropertyData;
  onNext: () => void;
  onBack: () => void;
  onAnalysisComplete: (analysis: any) => void;
}

export default function ExpensesForm({ property, onNext, onBack, onAnalysisComplete: _onAnalysisComplete }: ExpensesFormProps) {
  const [expenses, setExpenses] = useState<OperatingExpenses>({
    propertyTaxes: property.marketValue * 0.015 / 12,
    insurance: property.marketValue * 0.005 / 12,
    propertyManagement: 0,
    maintenance: property.marketValue * 0.01 / 12,
    utilities: 0,
    advertising: 25,
    legal: 20,
    accounting: 15,
    otherExpenses: 30,
    totalMonthlyExpenses: 0
  });

  const handleChange = (field: keyof OperatingExpenses) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    const updated = { ...expenses, [field]: value };
    
    // Calculate total
    updated.totalMonthlyExpenses = 
      updated.propertyTaxes +
      updated.insurance +
      updated.propertyManagement +
      updated.maintenance +
      updated.utilities +
      updated.advertising +
      updated.legal +
      updated.accounting +
      updated.otherExpenses;
      
    setExpenses(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Operating Expenses
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Property Taxes (Monthly)"
              type="number"
              value={expenses.propertyTaxes}
              onChange={handleChange('propertyTaxes')}
              InputProps={{ startAdornment: '$' }}
            />
            
            <TextField
              fullWidth
              label="Insurance (Monthly)"
              type="number"
              value={expenses.insurance}
              onChange={handleChange('insurance')}
              InputProps={{ startAdornment: '$' }}
            />
            
            <TextField
              fullWidth
              label="Property Management"
              type="number"
              value={expenses.propertyManagement}
              onChange={handleChange('propertyManagement')}
              InputProps={{ startAdornment: '$' }}
            />
            
            <TextField
              fullWidth
              label="Maintenance & Repairs"
              type="number"
              value={expenses.maintenance}
              onChange={handleChange('maintenance')}
              InputProps={{ startAdornment: '$' }}
            />
            
            <TextField
              fullWidth
              label="Utilities"
              type="number"
              value={expenses.utilities}
              onChange={handleChange('utilities')}
              InputProps={{ startAdornment: '$' }}
            />
            
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="h6">
                Total Monthly Expenses: ${expenses.totalMonthlyExpenses.toFixed(2)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} variant="outlined">
          Back
        </Button>
        <Button type="submit" variant="contained">
          View Results
        </Button>
      </Box>
    </Box>
  );
}
