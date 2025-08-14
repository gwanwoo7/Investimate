import { useState } from 'react';
import {
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Alert
} from '@mui/material';
import AreaSearchForm from './AreaSearchForm';
import PropertyListView from './PropertyListView';
import InteractiveMap from './InteractiveMap';
import type { PropertyListing, AreaSearchParams } from '../types/property';
import { RealEstateAPIService } from '../services/realEstateAPIService';

const steps = [
  'Area Search',
  'Property Selection'
];

interface PropertyCalculatorProps {
  canSearch?: boolean;
  onSearch?: () => void;
  onUpgrade?: () => void;
  searchCount?: number;
  maxSearches?: number;
}

export default function PropertyCalculator({ 
  canSearch = true, 
  onSearch, 
  onUpgrade, 
  searchCount: _searchCount = 0, 
  maxSearches = 5 
}: PropertyCalculatorProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSearchLocation, setCurrentSearchLocation] = useState<string>('');

  const handleAreaSearch = async (searchData: AreaSearchParams) => {
    // Check search limits before proceeding
    if (!canSearch) {
      if (onUpgrade) onUpgrade();
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Call onSearch to increment search count
      if (onSearch) onSearch();
      
      console.log('🔍 PropertyCalculator: Searching with params:', searchData);
      console.log('🔍 PropertyCalculator: Location being searched:', searchData.city, searchData.state);
      console.log('🔍 PropertyCalculator: Full search object:', JSON.stringify(searchData, null, 2));
      
      // Test API directly first
      console.log('🧪 Testing API key:', import.meta.env.VITE_RAPID_API_KEY ? 'API Key present' : 'No API key');
      
      const foundProperties = await RealEstateAPIService.searchProperties(searchData);
      console.log('🏠 Properties found:', foundProperties);
      console.log('🏠 Number of properties:', foundProperties.length);
      console.log('🏠 First property (if any):', foundProperties[0]);
      
      setProperties(foundProperties);
      
      // Update current search location for map display
      const searchLocation = [searchData.city, searchData.state].filter(Boolean).join(', ');
      setCurrentSearchLocation(searchLocation);
      
      if (foundProperties.length === 0) {
        setError('No properties found matching your criteria. Try adjusting your search parameters.');
      }
      // Don't automatically advance to step 1 - let users see results on map first
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('API key') || errorMessage.includes('subscribed')) {
        setError('API configuration required. Please check console for setup instructions or ensure your RapidAPI subscriptions are active.');
      } else {
        setError(`Failed to fetch properties: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (property: PropertyListing) => {
    setSelectedProperty(property);
    console.log('Selected property:', property);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setProperties([]);
    setSelectedProperty(null);
    setCurrentSearchLocation('');
    setError(null);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 2, 
              flexDirection: { xs: 'column', lg: 'row' },
              height: '100%',
              width: '100%'
            }}
          >
            {/* Search Limit Warning */}
            {!canSearch && (
              <Alert severity="warning" sx={{ mb: 2, width: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Search Limit Reached
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  You've used all {maxSearches} free searches. Upgrade to Pro for unlimited access!
                </Typography>
                <Button 
                  variant="contained" 
                  color="warning" 
                  onClick={onUpgrade}
                  sx={{ mt: 1 }}
                >
                  Upgrade to Pro - $4.99/month
                </Button>
              </Alert>
            )}
            
            {/* Left side - Search Form and Results */}
            <Box sx={{ 
              flex: '1 1 50%', 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: 0,
              height: '100%'
            }}>
              {/* Search Form - Scrollable */}
              <Box sx={{ 
                height: '100%',
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <AreaSearchForm 
                  onSearch={handleAreaSearch}
                  loading={loading}
                />
              </Box>
              
              {/* Property Results will show in step 1 */}
            </Box>
            
            {/* Right side - Map */}
            <Box sx={{ 
              flex: '1 1 50%',
              minHeight: { xs: '400px', lg: '100%' },
              height: { xs: '400px', lg: 'auto' }
            }}>
              <InteractiveMap 
                properties={properties}
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertySelect}
                searchLocation={currentSearchLocation}
              />
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 3, 
              flexDirection: { xs: 'column', lg: 'row' },
              height: '100%',
              minHeight: 0 // Important for proper flex shrinking
            }}
          >
            <Box sx={{ 
              flex: '1 1 60%',
              minHeight: 0, // Important for scrolling
              display: 'flex',
              flexDirection: 'column'
            }}>
              <PropertyListView 
                properties={properties}
                onPropertySelect={setSelectedProperty}
                selectedProperty={selectedProperty}
                loading={loading}
              />
            </Box>
            <Box sx={{ 
              flex: '1 1 40%',
              minHeight: 0 // Important for proper flex shrinking
            }}>
              <InteractiveMap 
                properties={properties}
                selectedProperty={selectedProperty}
                onPropertySelect={handlePropertySelect}
                searchLocation={currentSearchLocation}
              />
            </Box>
          </Box>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <Box 
      sx={{ 
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: 'background.default'
      }}
    >
      <Box sx={{ 
        p: { xs: 2, md: 3 }, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 1
      }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🏠 Find Investment Properties
        </Typography>
        
        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
            {error}
          </Box>
        )}

        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Box>

      <Box sx={{ flex: 1, overflow: 'hidden', p: { xs: 1, md: 2 } }}>
        <Paper sx={{ 
          height: '100%', 
          p: { xs: 2, md: 3 }, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Box sx={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            {renderStepContent(activeStep)}
          </Box>
        </Paper>
      </Box>

      <Box sx={{ 
        p: { xs: 2, md: 3 }, 
        borderTop: 1, 
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          
          {activeStep === 0 && properties.length > 0 && (
            <Button
              variant="contained"
              onClick={() => setActiveStep(1)}
              sx={{ ml: 2 }}
            >
              View Property List ({properties.length} found)
            </Button>
          )}
          
          <Button
            variant="outlined"
            onClick={handleReset}
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
