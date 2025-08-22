import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Paper
} from '@mui/material';
import { Search, MapPin, TrendingUp, DollarSign } from 'lucide-react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { AreaSearchParams } from '../types/property';

interface AreaSearchFormProps {
  onSearch: (searchData: AreaSearchParams) => void;
  loading: boolean;
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

const PROPERTY_TYPES = [
  { value: 'single-family', label: 'Single Family' },
  { value: 'condo', label: 'Condo' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'multi-family', label: 'Multi-Family' }
];

const INVESTMENT_CITIES = [
  { state: 'MI', cities: ['Detroit', 'Grand Rapids', 'Flint', 'Lansing', 'Kalamazoo'] },
  { state: 'OH', cities: ['Cleveland', 'Columbus', 'Cincinnati', 'Toledo', 'Akron'] },
  { state: 'IN', cities: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Gary'] },
  { state: 'IL', cities: ['Chicago', 'Rockford', 'Peoria', 'Springfield', 'Decatur'] },
  { state: 'TX', cities: ['Houston', 'Dallas', 'San Antonio', 'Austin', 'Fort Worth'] },
  { state: 'FL', cities: ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg'] },
  { state: 'GA', cities: ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens'] },
  { state: 'NC', cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem'] },
  { state: 'TN', cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'] },
  { state: 'AL', cities: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa'] }
];

const SORT_OPTIONS = [
  { value: 'cashOnCashROI', label: 'Cash-on-Cash ROI' },
  { value: 'capRate', label: 'Cap Rate' },
  { value: 'monthlyCashFlow', label: 'Monthly Cash Flow' },
  { value: 'investmentScore', label: 'Investment Score' },
  { value: 'price', label: 'Price' }
];

export default function AreaSearchForm({ onSearch, loading }: AreaSearchFormProps) {
  const [formData, setFormData] = useState<AreaSearchParams>({
    city: '',
    state: '',
    zipCode: '',
    propertyTypes: ['single-family', 'condo', 'townhouse'],
    minPrice: 50000,
    maxPrice: 2000000,
    minBedrooms: 2,
    maxBedrooms: 10,
    minBathrooms: 1,
    maxBathrooms: 10
  });

  // Custom styling for consistent 10.5px font size
  const smallTextStyle = {
    fontSize: '10.5px',
    '& .MuiInputLabel-root': {
      fontSize: '10.5px',
    },
    '& .MuiInputBase-input': {
      fontSize: '10.5px',
    },
    '& .MuiFormHelperText-root': {
      fontSize: '10.5px',
    }
  };

  const smallTypographyStyle = {
    fontSize: '10.5px',
    lineHeight: 1.4
  };

  const smallButtonStyle = {
    fontSize: '10.5px',
    padding: '6px 12px'
  };
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('🔍 AreaSearchForm: Form submitted with search data:', formData);
    console.log('📝 AreaSearchForm: City:', formData.city, 'State:', formData.state);
    console.log('📝 AreaSearchForm: Complete data object:', JSON.stringify(formData, null, 2));
    
    if (!formData.city && !formData.zipCode && !formData.county) {
      setError('Please enter a city, zip code, or county to search');
      return;
    }
    
    console.log('📝 AreaSearchForm: Calling onSearch with:', formData);
    onSearch(formData);
  };

  const handleChange = (field: keyof AreaSearchParams) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: any = e.target.value;
    
    if (field === 'maxPrice' || field === 'minPrice' || field === 'radius' || field === 'minBedrooms' || field === 'maxBedrooms' ||
        field === 'minCashOnCashROI' || field === 'maxCashOnCashROI' || field === 'minCapRate' || field === 'maxCapRate' ||
        field === 'minMonthlyCashFlow' || field === 'maxMonthlyCashFlow' || field === 'minInvestmentScore' || field === 'maxInvestmentScore') {
      value = parseFloat(value) || undefined;
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: keyof AreaSearchParams) => (e: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handlePropertyTypeChange = (type: string) => {
    setFormData(prev => {
      const currentTypes = prev.propertyTypes || [];
      const newTypes = currentTypes.includes(type as any)
        ? currentTypes.filter((t: any) => t !== type)
        : [...currentTypes, type as any];
      
      return {
        ...prev,
        propertyTypes: newTypes
      };
    });
  };

  const handleCitySelect = (city: string) => {
    setFormData(prev => ({
      ...prev,
      city
    }));
  };

  const getCurrentStateCities = () => {
    return INVESTMENT_CITIES.find(item => item.state === formData.state)?.cities || [];
  };

  return (
    <Paper sx={{ 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Box sx={{
        height: '100%',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#1976d2',
          borderRadius: '4px',
          '&:hover': {
            background: '#1565c0',
          },
        },
        // Add a subtle gradient at bottom to indicate more content
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'sticky',
          bottom: 0,
          height: '20px',
          background: 'linear-gradient(transparent, rgba(255,255,255,0.8))',
          pointerEvents: 'none',
          zIndex: 1
        }
      }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ 
          p: 3,
          minHeight: '100%',
          pb: 5 // Extra padding at bottom for better scroll experience
        }}>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              fontSize: '1.5rem', // Same as "Interactive Map Search" 
              fontWeight: 600 
            }}>
              Search Criteria
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={smallTypographyStyle}>
              Find properties by location and criteria
            </Typography>
          </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Location Section */}
        <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ ...smallTypographyStyle, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MapPin size={14} />
            Location
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              select
              label="State"
              value={formData.state}
              onChange={handleSelectChange('state')}
              disabled={loading}
              sx={{ ...smallTextStyle, minWidth: 160 }}
              size="small"
            >
              {US_STATES.map(state => (
                <MenuItem key={state.value} value={state.value}>
                  {state.label}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              label="City"
              value={formData.city}
              onChange={handleChange('city')}
              placeholder="Enter city name"
              disabled={loading}
              sx={{ ...smallTextStyle, flex: 1, minWidth: 200 }}
              size="small"
            />
            
            <TextField
              label="Zip Code (Optional)"
              value={formData.zipCode || ''}
              onChange={handleChange('zipCode')}
              placeholder="12345"
              disabled={loading}
              sx={{ minWidth: 150 }}
            />
          </Box>

          {/* Popular Cities for Selected State */}
          {getCurrentStateCities().length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Popular investment cities in {US_STATES.find(s => s.value === formData.state)?.label}:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {getCurrentStateCities().map(city => (
                  <Chip
                    key={city}
                    label={city}
                    size="small"
                    onClick={() => handleCitySelect(city)}
                    color={formData.city === city ? 'primary' : 'default'}
                    variant={formData.city === city ? 'filled' : 'outlined'}
                    disabled={loading}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Investment Criteria Filters */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp size={20} />
              Investment Criteria Filters
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* Sort By and Limit */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Sort Results By
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={formData.sortBy || 'cashOnCashROI'}
                      onChange={handleSelectChange('sortBy')}
                      label="Sort By"
                      disabled={loading}
                    >
                      {SORT_OPTIONS.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={formData.sortOrder || 'desc'}
                      onChange={handleSelectChange('sortOrder')}
                      label="Order"
                      disabled={loading}
                    >
                      <MenuItem value="desc">Highest First</MenuItem>
                      <MenuItem value="asc">Lowest First</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Results Limit</InputLabel>
                    <Select
                      value={formData.limit || 50}
                      onChange={handleSelectChange('limit')}
                      label="Results Limit"
                      disabled={loading}
                    >
                      <MenuItem value={10}>10 Properties</MenuItem>
                      <MenuItem value={50}>50 Properties</MenuItem>
                      <MenuItem value={100}>100 Properties</MenuItem>
                      <MenuItem value={200}>200 Properties</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Investment Metric Ranges */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Cash-on-Cash ROI Range (%)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Min ROI %"
                    type="number"
                    value={formData.minCashOnCashROI || ''}
                    onChange={handleChange('minCashOnCashROI')}
                    placeholder="8"
                    disabled={loading}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Max ROI %"
                    type="number"
                    value={formData.maxCashOnCashROI || ''}
                    onChange={handleChange('maxCashOnCashROI')}
                    placeholder="25"
                    disabled={loading}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Cap Rate Range (%)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Min Cap Rate %"
                    type="number"
                    value={formData.minCapRate || ''}
                    onChange={handleChange('minCapRate')}
                    placeholder="6"
                    disabled={loading}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Max Cap Rate %"
                    type="number"
                    value={formData.maxCapRate || ''}
                    onChange={handleChange('maxCapRate')}
                    placeholder="15"
                    disabled={loading}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Monthly Cash Flow Range ($)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Min Cash Flow"
                    type="number"
                    value={formData.minMonthlyCashFlow || ''}
                    onChange={handleChange('minMonthlyCashFlow')}
                    placeholder="200"
                    InputProps={{ startAdornment: '$' }}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Max Cash Flow"
                    type="number"
                    value={formData.maxMonthlyCashFlow || ''}
                    onChange={handleChange('maxMonthlyCashFlow')}
                    placeholder="1000"
                    InputProps={{ startAdornment: '$' }}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Investment Score Range (1-10)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Min Score"
                    type="number"
                    value={formData.minInvestmentScore || ''}
                    onChange={handleChange('minInvestmentScore')}
                    placeholder="6"
                    inputProps={{ min: 1, max: 10 }}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Max Score"
                    type="number"
                    value={formData.maxInvestmentScore || ''}
                    onChange={handleChange('maxInvestmentScore')}
                    placeholder="10"
                    inputProps={{ min: 1, max: 10 }}
                    disabled={loading}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Price Range Section */}
        <Box>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DollarSign size={20} />
            Price & Property Criteria
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Min Price"
              type="number"
              value={formData.minPrice || ''}
              onChange={handleChange('minPrice')}
              InputProps={{ startAdornment: '$' }}
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Max Price"
              type="number"
              value={formData.maxPrice || ''}
              onChange={handleChange('maxPrice')}
              InputProps={{ startAdornment: '$' }}
              disabled={loading}
            />
          </Box>

          {/* Property Types Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Property Types
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {PROPERTY_TYPES.map(type => (
                <Chip
                  key={type.value}
                  label={type.label}
                  onClick={() => handlePropertyTypeChange(type.value)}
                  color={formData.propertyTypes?.includes(type.value as any) ? 'primary' : 'default'}
                  variant={formData.propertyTypes?.includes(type.value as any) ? 'filled' : 'outlined'}
                  disabled={loading}
                />
              ))}
            </Box>
          </Box>

          {/* Additional Filters */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Additional Filters
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Min Bedrooms"
                type="number"
                value={formData.minBedrooms || ''}
                onChange={handleChange('minBedrooms')}
                disabled={loading}
                sx={{ minWidth: 150 }}
              />
              <TextField
                label="Search Radius (miles)"
                type="number"
                value={formData.radius || ''}
                onChange={handleChange('radius')}
                placeholder="25"
                disabled={loading}
                sx={{ minWidth: 150 }}
              />
            </Box>
          </Box>
        </Box>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Search />}
          sx={{ minWidth: 250, py: 1.5, fontSize: '1.1rem' }}
        >
          {loading ? 'Searching Properties...' : 'Find Investment Properties'}
        </Button>
      </Box>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Properties will be ranked by your selected criteria with detailed investment analysis
        </Typography>
      </Box>
        </Box>
      </Box>
    </Paper>
  );
}
