import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Dialog,
  DialogContent
} from '@mui/material';
import { Search } from 'lucide-react';
import { useSearchLimits } from '../hooks/useSearchLimits';
import SearchLimitNotification from './common/SearchLimitNotification';

interface PropertySearchFormProps {
  onSearch: (searchData: any) => void;
  loading: boolean;
  onUpgrade?: () => void;
}

export default function PropertySearchForm({ onSearch, loading, onUpgrade }: PropertySearchFormProps) {
  const [searchData, setSearchData] = useState({
    address: '',
    city: '',
    state: 'MI',
    zipCode: ''
  });
  const [error, setError] = useState('');
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  
  // Search limits integration
  const {
    quota,
    remainingSearches,
    canSearch,
    isLoading: limitsLoading,
    error: limitsError,
    checkCanSearch,
    recordSearch
  } = useSearchLimits();

  // Show notification if user is near or at limit
  const shouldShowNotification = quota && (
    (quota.membershipTier === 'free' && remainingSearches <= 1) ||
    !canSearch
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!searchData.address && !searchData.zipCode) {
      setError('Please enter either an address or zip code');
      return;
    }
    
    // Check search limits before proceeding
    const searchCheck = await checkCanSearch('property');
    
    if (!searchCheck.canSearch) {
      setError(searchCheck.message || 'Search limit reached');
      setShowLimitDialog(true);
      return;
    }
    
    // Proceed with search
    onSearch(searchData);
    
    // Record the search after successful initiation
    await recordSearch('property');
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit}>
        {/* Search Limit Notification */}
        {shouldShowNotification && (
          <SearchLimitNotification
            quota={quota}
            remainingSearches={remainingSearches}
            onUpgrade={onUpgrade}
            variant="detailed"
            showCloseButton={false}
          />
        )}

        <Typography variant="h6" gutterBottom sx={{ fontSize: '0.875rem' }}>
          Search for a Property
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
          Enter the property address or zip code to get started with your investment analysis.
          {quota?.membershipTier === 'free' && (
            <span style={{ fontWeight: 'bold', color: 'orange' }}>
              {` (${remainingSearches} searches remaining today)`}
            </span>
          )}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {limitsError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {limitsError}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Property Address"
            value={searchData.address}
            onChange={handleChange('address')}
            placeholder="e.g., 28215 Cherry Street"
            disabled={loading || limitsLoading}
            size="small"
            sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}
          />
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="City"
              value={searchData.city}
              onChange={handleChange('city')}
              placeholder="e.g., Detroit"
              disabled={loading || limitsLoading}
              size="small"
              sx={{ '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}
            />
            
            <TextField
              label="State"
              value={searchData.state}
              onChange={handleChange('state')}
              placeholder="MI"
              disabled={loading || limitsLoading}
              size="small"
              sx={{ minWidth: 100, '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}
            />
            
            <TextField
              label="Zip Code"
              value={searchData.zipCode}
              onChange={handleChange('zipCode')}
              placeholder="48201"
              disabled={loading || limitsLoading}
              size="small"
              sx={{ minWidth: 120, '& .MuiInputLabel-root': { fontSize: '0.875rem' } }}
            />
          </Box>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="medium"
            disabled={loading || limitsLoading || !canSearch}
            startIcon={loading ? <CircularProgress size={16} /> : <Search size={16} />}
            sx={{ minWidth: 140, fontSize: '0.875rem' }}
          >
            {loading ? 'Searching...' : !canSearch ? 'Limit Reached' : 'Search Property'}
          </Button>
        </Box>
      </Box>

      {/* Search Limit Dialog */}
      <Dialog 
        open={showLimitDialog} 
        onClose={() => setShowLimitDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <SearchLimitNotification
            quota={quota}
            remainingSearches={remainingSearches}
            onUpgrade={() => {
              setShowLimitDialog(false);
              onUpgrade?.();
            }}
            onClose={() => setShowLimitDialog(false)}
            variant="detailed"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
