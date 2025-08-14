import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Card,
  CardContent,
  Chip,
  MenuItem
} from '@mui/material';
import type { PropertyData } from '../types/property';

interface PropertyDetailsFormProps {
  property: PropertyData;
  onUpdate: (property: PropertyData) => void;
  onNext: () => void;
}

export default function PropertyDetailsForm({ property, onUpdate, onNext }: PropertyDetailsFormProps) {
  const [formData, setFormData] = useState<PropertyData>(property);

  const handleChange = (field: keyof PropertyData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onNext();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Property Details
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review and update the property information below.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Property Address"
              value={formData.address}
              onChange={handleChange('address')}
              required
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange('city')}
                required
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={handleChange('state')}
                required
                sx={{ minWidth: 100 }}
              />
              <TextField
                label="Zip Code"
                value={formData.zipCode}
                onChange={handleChange('zipCode')}
                required
                sx={{ minWidth: 120 }}
              />
            </Box>

            <TextField
              select
              fullWidth
              label="Property Type"
              value={formData.propertyType}
              onChange={handleChange('propertyType')}
              required
            >
              <MenuItem value="single-family">Single Family</MenuItem>
              <MenuItem value="condo">Condo</MenuItem>
              <MenuItem value="townhouse">Townhouse</MenuItem>
              <MenuItem value="multi-family">Multi-Family</MenuItem>
            </TextField>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Property Specifications
          </Typography>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Square Footage"
                type="number"
                value={formData.squareFootage}
                onChange={handleChange('squareFootage')}
                required
              />
              <TextField
                label="Bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange('bedrooms')}
                required
                sx={{ minWidth: 120 }}
              />
              <TextField
                label="Bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange('bathrooms')}
                required
                sx={{ minWidth: 120 }}
              />
            </Box>

            <TextField
              fullWidth
              label="Year Built"
              type="number"
              value={formData.yearBuilt}
              onChange={handleChange('yearBuilt')}
              required
            />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Financial Information
          </Typography>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Purchase Price"
                type="number"
                value={formData.purchasePrice}
                onChange={handleChange('purchasePrice')}
                required
                InputProps={{
                  startAdornment: '$'
                }}
              />
              <TextField
                fullWidth
                label="Current Market Value"
                type="number"
                value={formData.marketValue}
                onChange={handleChange('marketValue')}
                required
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Chip 
          label={`${formData.bedrooms}BR/${formData.bathrooms}BA • ${formData.squareFootage} sq ft • Built ${formData.yearBuilt}`}
          color="primary"
          variant="outlined"
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
        >
          Continue to Financing
        </Button>
      </Box>
    </Box>
  );
}
