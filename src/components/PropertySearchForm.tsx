import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';
import { Search } from 'lucide-react';

interface PropertySearchFormProps {
  onSearch: (searchData: any) => void;
  loading: boolean;
}

export default function PropertySearchForm({ onSearch, loading }: PropertySearchFormProps) {
  const [searchData, setSearchData] = useState({
    address: '',
    city: '',
    state: 'MI',
    zipCode: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!searchData.address && !searchData.zipCode) {
      setError('Please enter either an address or zip code');
      return;
    }
    
    onSearch(searchData);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" gutterBottom>
        Search for a Property
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Enter the property address or zip code to get started with your investment analysis.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Property Address"
          value={searchData.address}
          onChange={handleChange('address')}
          placeholder="e.g., 28215 Cherry Street"
          disabled={loading}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="City"
            value={searchData.city}
            onChange={handleChange('city')}
            placeholder="e.g., Detroit"
            disabled={loading}
          />
          
          <TextField
            label="State"
            value={searchData.state}
            onChange={handleChange('state')}
            placeholder="MI"
            disabled={loading}
            sx={{ minWidth: 100 }}
          />
          
          <TextField
            label="Zip Code"
            value={searchData.zipCode}
            onChange={handleChange('zipCode')}
            placeholder="48201"
            disabled={loading}
            sx={{ minWidth: 120 }}
          />
        </Box>
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Search />}
          sx={{ minWidth: 150 }}
        >
          {loading ? 'Searching...' : 'Search Property'}
        </Button>
      </Box>
    </Box>
  );
}
