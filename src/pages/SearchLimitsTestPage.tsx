import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Paper,
  Stack,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { 
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AdminPanelSettings as AdminIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { useSearchLimits } from '../hooks/useSearchLimits';
import SearchLimitNotification from '../components/common/SearchLimitNotification';
import PropertySearchForm from '../components/PropertySearchForm';
import EnhancedPropertySearchForm from '../components/EnhancedPropertySearchForm';

interface SearchLimitsTestPageProps {
  onUpgrade?: () => void;
}

export const SearchLimitsTestPage: React.FC<SearchLimitsTestPageProps> = ({ onUpgrade }) => {
  const [lastSearchResult, setLastSearchResult] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  
  const {
    quota,
    remainingSearches,
    canSearch,
    isLoading,
    error,
    checkCanSearch,
    recordSearch,
    refreshQuota,
    resetQuota
  } = useSearchLimits();

  const handleTestSearch = async (searchData: any) => {
    setIsSearching(true);
    try {
      // Simulate search process
      console.log('🔍 Test search initiated:', searchData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLastSearchResult(`Search completed for: ${searchData.address || searchData.city || 'Unknown location'}`);
      console.log('✅ Test search completed');
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      setLastSearchResult('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleEnhancedSearch = async (searchData: any) => {
    setIsSearching(true);
    try {
      console.log('🔍 Enhanced search initiated:', searchData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLastSearchResult(`Enhanced search completed for: ${searchData.city}, ${searchData.state}`);
      console.log('✅ Enhanced search completed');
      
    } catch (error) {
      console.error('❌ Enhanced search failed:', error);
      setLastSearchResult('Enhanced search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBoundarySearch = async (bounds: any) => {
    setIsSearching(true);
    try {
      console.log('🗺️ Boundary search initiated:', bounds);
      
      // Check if this should be treated as a map search (Pro only)
      const searchCheck = await checkCanSearch('map');
      
      if (!searchCheck.canSearch) {
        setLastSearchResult(`Map search requires Pro membership: ${searchCheck.message}`);
        setIsSearching(false);
        return;
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Record the search
      await recordSearch('map');
      
      setLastSearchResult(`Map boundary search completed`);
      console.log('✅ Boundary search completed');
      
    } catch (error) {
      console.error('❌ Boundary search failed:', error);
      setLastSearchResult('Boundary search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSearchTest = async () => {
    const result = await checkCanSearch('property');
    if (result.canSearch) {
      await recordSearch('property');
      setLastSearchResult('Manual search test completed');
    } else {
      setLastSearchResult(`Search blocked: ${result.message}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SearchIcon color="primary" />
        Search Limits Test Page
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Test the new search limit functionality with both property and map searches.
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Search Status Panel */}
        <Box sx={{ flex: '0 0 300px' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Search Status
              </Typography>
              
              {isLoading ? (
                <Alert severity="info">Loading search limits...</Alert>
              ) : quota ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Membership: 
                      <strong style={{ marginLeft: 8 }}>
                        {quota.membershipTier === 'pro' ? (
                          <span style={{ color: 'green' }}>
                            <StarIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                            Pro
                          </span>
                        ) : (
                          <span style={{ color: 'orange' }}>Free</span>
                        )}
                      </strong>
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Daily Searches:
                      <strong style={{ marginLeft: 8 }}>
                        {quota.membershipTier === 'pro' ? 'Unlimited' : `${quota.searchCount}/${quota.dailyLimit}`}
                      </strong>
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Remaining:
                      <strong style={{ marginLeft: 8, color: remainingSearches <= 1 ? 'red' : 'inherit' }}>
                        {quota.membershipTier === 'pro' ? 'Unlimited' : remainingSearches}
                      </strong>
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Can Search:
                      <strong style={{ marginLeft: 8, color: canSearch ? 'green' : 'red' }}>
                        {canSearch ? 'Yes' : 'No'}
                      </strong>
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                <Alert severity="warning">No user logged in</Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                  size="small"
                  onClick={refreshQuota}
                  startIcon={<RefreshIcon />}
                  disabled={isLoading}
                >
                  Refresh
                </Button>
                <Button
                  size="small"
                  onClick={resetQuota}
                  startIcon={<AdminIcon />}
                  color="warning"
                  disabled={isLoading}
                >
                  Reset (Admin)
                </Button>
              </Stack>
            </CardContent>
          </Card>
          
          {/* Search Results */}
          {lastSearchResult && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Last Search Result
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {lastSearchResult}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Search Forms */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={3}>
            {/* Search Limit Notification */}
            {quota && (
              <SearchLimitNotification
                quota={quota}
                remainingSearches={remainingSearches}
                onUpgrade={onUpgrade}
                variant="detailed"
              />
            )}

            {/* Manual Test Button */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Manual Search Test
              </Typography>
              <Button
                variant="outlined"
                onClick={handleManualSearchTest}
                disabled={isLoading}
                sx={{ mr: 2 }}
              >
                Test Search Limit Check
              </Button>
            </Paper>

            <Divider />

            {/* Basic Property Search Form */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Basic Property Search
              </Typography>
              <PropertySearchForm
                onSearch={handleTestSearch}
                loading={isSearching}
                onUpgrade={onUpgrade}
              />
            </Paper>

            <Divider />

            {/* Enhanced Property Search Form */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Enhanced Property Search (with Map)
              </Typography>
              <EnhancedPropertySearchForm
                onSearch={handleEnhancedSearch}
                onBoundarySearch={handleBoundarySearch}
                loading={isSearching}
                foundProperties={0}
                onUpgrade={onUpgrade}
              />
            </Paper>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default SearchLimitsTestPage;
