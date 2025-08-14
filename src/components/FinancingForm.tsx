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
import type { PropertyData, FinancingDetails } from '../types/property';

interface FinancingFormProps {
  property: PropertyData;
  onNext: () => void;
  onBack: () => void;
  onAnalysisComplete: (analysis: any) => void;
}

export default function FinancingForm({ property, onNext, onBack, onAnalysisComplete: _onAnalysisComplete }: FinancingFormProps) {
  const [financing, setFinancing] = useState<FinancingDetails>({
    downPayment: property.purchasePrice * 0.25,
    loanAmount: property.purchasePrice * 0.75,
    interestRate: 7.5,
    loanTerm: 30,
    monthlyPayment: 0,
    closingCosts: property.purchasePrice * 0.03
  });

  const handleChange = (field: keyof FinancingDetails) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    const updated = { ...financing, [field]: value };
    
    // Recalculate dependent values
    if (field === 'downPayment') {
      updated.loanAmount = property.purchasePrice - value;
    } else if (field === 'loanAmount') {
      updated.downPayment = property.purchasePrice - value;
    }
    
    setFinancing(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Financing Details
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Down Payment"
              type="number"
              value={financing.downPayment}
              onChange={handleChange('downPayment')}
              InputProps={{ startAdornment: '$' }}
            />
            
            <TextField
              fullWidth
              label="Loan Amount"
              type="number"
              value={financing.loanAmount}
              onChange={handleChange('loanAmount')}
              InputProps={{ startAdornment: '$' }}
            />
            
            <TextField
              fullWidth
              label="Interest Rate"
              type="number"
              value={financing.interestRate}
              onChange={handleChange('interestRate')}
              InputProps={{ endAdornment: '%' }}
            />
            
            <TextField
              fullWidth
              label="Loan Term (Years)"
              type="number"
              value={financing.loanTerm}
              onChange={handleChange('loanTerm')}
            />
            
            <TextField
              fullWidth
              label="Closing Costs"
              type="number"
              value={financing.closingCosts}
              onChange={handleChange('closingCosts')}
              InputProps={{ startAdornment: '$' }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={onBack} variant="outlined">
          Back
        </Button>
        <Button type="submit" variant="contained">
          Continue to Expenses
        </Button>
      </Box>
    </Box>
  );
}
