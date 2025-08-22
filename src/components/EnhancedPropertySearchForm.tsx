import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  Search,
  ExpandMore,
  CropFree,
  FilterList,
  LocationOn
} from '@mui/icons-material';
import type { AreaSearchParams } from '../types/property';

interface EnhancedPropertySearchFormProps {
  onSearch: (searchData: AreaSearchParams) => void;
  onBoundarySearch: (bounds: { north: number; south: number; east: number; west: number }) => void;
  loading: boolean;
  foundProperties: number;
  isDrawingMode?: boolean;
  onDrawingModeChange?: (isDrawing: boolean) => void;
}

export default function EnhancedPropertySearchForm({ 
  onSearch, 
  onBoundarySearch,
  loading, 
  foundProperties,
  isDrawingMode = false,
  onDrawingModeChange
}: EnhancedPropertySearchFormProps) {
  const [searchData, setSearchData] = useState<AreaSearchParams>({
    city: 'Santa Clara',
    state: 'CA',
    minPrice: 50000,
    maxPrice: 20000000,
    minBedrooms: 2,
    propertyTypes: ['single-family', 'townhouse', 'condo', 'multi-family'],
    limit: 100
  });
  
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!searchData.city && !searchData.zipCode) {
      setError('Please enter either a city or zip code');
      return;
    }
    
    console.log('🔍 Submitting search with parameters:', searchData);
    onSearch(searchData);
  };

  const handleChange = (field: keyof AreaSearchParams) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearchData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const handleSelectChange = (field: keyof AreaSearchParams) => (e: any) => {
    const value = e.target.value;
    setSearchData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }));
  };

  const handlePropertyTypeChange = (type: string) => {
    const currentTypes = searchData.propertyTypes || [];
    let newTypes;
    
    if (currentTypes.includes(type as any)) {
      newTypes = currentTypes.filter(t => t !== type);
    } else {
      newTypes = [...currentTypes, type];
    }
    
    setSearchData(prev => ({
      ...prev,
      propertyTypes: newTypes.length > 0 ? newTypes as any : undefined
    }));
  };

  const toggleDrawingMode = () => {
    if (onDrawingModeChange) {
      onDrawingModeChange(!isDrawingMode);
    }
  };

  const propertyTypes = [
    { value: 'single-family', label: 'Single Family' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'condo', label: 'Condo' },
    { value: 'multi-family', label: 'Multi-Family' }
  ];

  const states = [
    { value: 'CA', label: 'California' },
    { value: 'TX', label: 'Texas' },
    { value: 'FL', label: 'Florida' },
    { value: 'NY', label: 'New York' },
    { value: 'GA', label: 'Georgia' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'AL', label: 'Alabama' }
  ];

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.1rem', fontWeight: 'bold' }}>
          <LocationOn color="primary" />
          Find Investment Properties
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '10.5px', lineHeight: 1.4 }}>
          Search for rental properties with strong investment potential. Use the form below or draw a boundary on the map.
        </Typography>

        {/* Search Results Summary */}
        {foundProperties > 0 && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontSize: '10.5px' }}>
              Found {foundProperties} properties matching your criteria
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontSize: '10.5px' }}>
              {error}
            </Typography>
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Basic Search Fields */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ flex: 2, minWidth: 200 }}
              label="City"
              value={searchData.city || ''}
              onChange={handleChange('city')}
              placeholder="e.g., Santa Clara"
              disabled={loading}
            />
            
            <FormControl sx={{ flex: 1, minWidth: 120 }}>
              <InputLabel>State</InputLabel>
              <Select
                value={searchData.state || ''}
                label="State"
                onChange={handleSelectChange('state')}
              >
                <MenuItem value="CA">California</MenuItem>
                <MenuItem value="TX">Texas</MenuItem>
                <MenuItem value="FL">Florida</MenuItem>
                <MenuItem value="NY">New York</MenuItem>
                <MenuItem value="WA">Washington</MenuItem>
                <MenuItem value="IL">Illinois</MenuItem>
                <MenuItem value="PA">Pennsylvania</MenuItem>
                <MenuItem value="OH">Ohio</MenuItem>
                <MenuItem value="GA">Georgia</MenuItem>
                <MenuItem value="NC">North Carolina</MenuItem>
                <MenuItem value="MI">Michigan</MenuItem>
                <MenuItem value="NJ">New Jersey</MenuItem>
                <MenuItem value="VA">Virginia</MenuItem>
                <MenuItem value="AZ">Arizona</MenuItem>
                <MenuItem value="MA">Massachusetts</MenuItem>
                <MenuItem value="TN">Tennessee</MenuItem>
                <MenuItem value="IN">Indiana</MenuItem>
                <MenuItem value="MO">Missouri</MenuItem>
                <MenuItem value="MD">Maryland</MenuItem>
                <MenuItem value="WI">Wisconsin</MenuItem>
                <MenuItem value="CO">Colorado</MenuItem>
                <MenuItem value="MN">Minnesota</MenuItem>
                <MenuItem value="SC">South Carolina</MenuItem>
                <MenuItem value="AL">Alabama</MenuItem>
                <MenuItem value="LA">Louisiana</MenuItem>
                <MenuItem value="KY">Kentucky</MenuItem>
                <MenuItem value="OR">Oregon</MenuItem>
                <MenuItem value="OK">Oklahoma</MenuItem>
                <MenuItem value="CT">Connecticut</MenuItem>
                <MenuItem value="UT">Utah</MenuItem>
                <MenuItem value="IA">Iowa</MenuItem>
                <MenuItem value="NV">Nevada</MenuItem>
                <MenuItem value="AR">Arkansas</MenuItem>
                <MenuItem value="MS">Mississippi</MenuItem>
                <MenuItem value="KS">Kansas</MenuItem>
                <MenuItem value="NM">New Mexico</MenuItem>
                <MenuItem value="NE">Nebraska</MenuItem>
                <MenuItem value="WV">West Virginia</MenuItem>
                <MenuItem value="ID">Idaho</MenuItem>
                <MenuItem value="HI">Hawaii</MenuItem>
                <MenuItem value="NH">New Hampshire</MenuItem>
                <MenuItem value="ME">Maine</MenuItem>
                <MenuItem value="MT">Montana</MenuItem>
                <MenuItem value="RI">Rhode Island</MenuItem>
                <MenuItem value="DE">Delaware</MenuItem>
                <MenuItem value="SD">South Dakota</MenuItem>
                <MenuItem value="ND">North Dakota</MenuItem>
                <MenuItem value="AK">Alaska</MenuItem>
                <MenuItem value="VT">Vermont</MenuItem>
                <MenuItem value="WY">Wyoming</MenuItem>
              </Select>
            </FormControl>

            <TextField
              sx={{ flex: 1, minWidth: 140 }}
              label="Zip Code (Optional)"
              value={searchData.zipCode || ''}
              onChange={handleChange('zipCode')}
              type="text"
            />

            <Button
              variant="outlined"
              startIcon={<CropFree />}
              onClick={toggleDrawingMode}
              color={isDrawingMode ? 'primary' : 'inherit'}
              disabled={loading}
              sx={{ minWidth: 140 }}
            >
              {isDrawingMode ? 'Drawing...' : 'Draw Area'}
            </Button>
          </Box>

          {/* Price Range */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              sx={{ flex: 1, minWidth: 150 }}
              label="Min Price"
              type="number"
              value={searchData.minPrice || ''}
              onChange={handleChange('minPrice')}
              disabled={loading}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, fontSize: '10.5px' }}>$</Typography>
              }}
            />
            <TextField
              sx={{ flex: 1, minWidth: 150 }}
              label="Max Price"
              type="number"
              value={searchData.maxPrice || ''}
              onChange={handleChange('maxPrice')}
              disabled={loading}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, fontSize: '10.5px' }}>$</Typography>
              }}
            />
          </Box>

          {/* Property Types */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Property Types
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {propertyTypes.map(type => (
                <Chip
                  key={type.value}
                  label={type.label}
                  onClick={() => handlePropertyTypeChange(type.value)}
                  color={searchData.propertyTypes?.includes(type.value as any) ? 'primary' : 'default'}
                  variant={searchData.propertyTypes?.includes(type.value as any) ? 'filled' : 'outlined'}
                  disabled={loading}
                />
              ))}
            </Box>
          </Box>

          {/* Advanced Filters */}
          <Accordion expanded={showAdvanced} onChange={(_, expanded) => setShowAdvanced(expanded)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterList fontSize="small" />
                <Typography>Advanced Filters</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    sx={{ flex: 1, minWidth: 120 }}
                    label="Min Bedrooms"
                    type="number"
                    value={searchData.minBedrooms || ''}
                    onChange={handleChange('minBedrooms')}
                    disabled={loading}
                    inputProps={{ min: 1, max: 10 }}
                  />
                  <TextField
                    sx={{ flex: 1, minWidth: 120 }}
                    label="Max Bedrooms"
                    type="number"
                    value={searchData.maxBedrooms || ''}
                    onChange={handleChange('maxBedrooms')}
                    disabled={loading}
                    inputProps={{ min: 1, max: 10 }}
                  />
                  <TextField
                    sx={{ flex: 1, minWidth: 120 }}
                    label="Min Bathrooms"
                    type="number"
                    value={searchData.minBathrooms || ''}
                    onChange={handleChange('minBathrooms')}
                    disabled={loading}
                    inputProps={{ min: 1, max: 10, step: 0.5 }}
                  />
                  <TextField
                    sx={{ flex: 1, minWidth: 120 }}
                    label="Max Results"
                    type="number"
                    value={searchData.limit || 50}
                    onChange={handleChange('limit')}
                    disabled={loading}
                    inputProps={{ min: 10, max: 200, step: 10 }}
                  />
                </Box>

                <Divider />

                <Typography variant="subtitle2" gutterBottom>
                  Investment Filters
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    sx={{ flex: 1, minWidth: 150 }}
                    label="Min Cash-on-Cash ROI (%)"
                    type="number"
                    value={searchData.minCashOnCashROI || ''}
                    onChange={handleChange('minCashOnCashROI')}
                    disabled={loading}
                    inputProps={{ min: 0, max: 50, step: 0.1 }}
                  />
                  <TextField
                    sx={{ flex: 1, minWidth: 150 }}
                    label="Min Cap Rate (%)"
                    type="number"
                    value={searchData.minCapRate || ''}
                    onChange={handleChange('minCapRate')}
                    disabled={loading}
                    inputProps={{ min: 0, max: 20, step: 0.1 }}
                  />
                  <TextField
                    sx={{ flex: 1, minWidth: 150 }}
                    label="Min Monthly Cash Flow"
                    type="number"
                    value={searchData.minMonthlyCashFlow || ''}
                    onChange={handleChange('minMonthlyCashFlow')}
                    disabled={loading}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                    }}
                  />
                  <TextField
                    sx={{ flex: 1, minWidth: 150 }}
                    label="Min Investment Score"
                    type="number"
                    value={searchData.minInvestmentScore || ''}
                    onChange={handleChange('minInvestmentScore')}
                    disabled={loading}
                    inputProps={{ min: 1, max: 10, step: 0.1 }}
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Search Button */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Search />}
              sx={{ minWidth: 200, fontSize: '10.5px' }}
            >
              {loading ? 'Searching...' : 'Search Properties'}
            </Button>

            {foundProperties > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '10.5px' }}>
                Showing {foundProperties} properties
              </Typography>
            )}
          </Box>

          {/* Search Tips */}
          <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.dark' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '10.5px', fontWeight: 'bold' }}>
              💡 Search Tips:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '10.5px', lineHeight: 1.6 }}>
              • Try broader price ranges to find more properties<br/>
              • Use the "Draw Area" feature to search within specific neighborhoods<br/>
              • For Santa Clara, CA: Enhanced search finds 55+ properties matching Zillow results<br/>
              • Investment scores help identify the most profitable opportunities
            </Typography>
          </Paper>
        </Stack>
      </Box>
    </Paper>
  );
}
