import { useState, useEffect, useCallback } from 'react';
import SearchLimitService from '../services/SearchLimitService';

interface SearchQuota {
  userId: string;
  email: string;
  searchCount: number;
  lastSearchDate: string;
  membershipTier: 'free' | 'pro';
  dailyLimit: number;
  resetTime: string;
}

interface UseSearchLimitsResult {
  quota: SearchQuota | null;
  remainingSearches: number;
  canSearch: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  checkCanSearch: (searchType?: 'property' | 'map') => Promise<{
    canSearch: boolean;
    message?: string;
  }>;
  recordSearch: (searchType?: 'property' | 'map') => Promise<{
    success: boolean;
    message?: string;
  }>;
  refreshQuota: () => Promise<void>;
  resetQuota: () => Promise<boolean>;
}

export const useSearchLimits = (): UseSearchLimitsResult => {
  const [quota, setQuota] = useState<SearchQuota | null>(null);
  const [remainingSearches, setRemainingSearches] = useState<number>(0);
  const [canSearch, setCanSearch] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchLimitService = SearchLimitService.getInstance();

  // Initialize and load quota
  const loadQuota = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const userQuota = await searchLimitService.getUserSearchQuota();
      
      if (userQuota) {
        setQuota(userQuota);
        
        const remaining = userQuota.membershipTier === 'pro' 
          ? -1 // Unlimited for pro
          : Math.max(0, userQuota.dailyLimit - userQuota.searchCount);
        
        setRemainingSearches(remaining);
        setCanSearch(userQuota.membershipTier === 'pro' || remaining > 0);
      } else {
        setQuota(null);
        setRemainingSearches(0);
        setCanSearch(false);
      }
    } catch (err) {
      console.error('❌ Failed to load search quota:', err);
      setError('Failed to load search limits');
      setCanSearch(false);
    } finally {
      setIsLoading(false);
    }
  }, [searchLimitService]);

  // Check if user can perform a search
  const checkCanSearch = useCallback(async (searchType: 'property' | 'map' = 'property') => {
    try {
      const result = await searchLimitService.canUserSearch(searchType);
      
      // Update local state
      if (result.quota) {
        setQuota(result.quota);
        setRemainingSearches(result.remainingSearches || 0);
      }
      setCanSearch(result.canSearch);
      
      if (!result.canSearch && result.message) {
        setError(result.message);
      } else {
        setError(null);
      }
      
      return {
        canSearch: result.canSearch,
        message: result.message
      };
    } catch (err) {
      console.error('❌ Failed to check search permission:', err);
      const errorMessage = 'Unable to verify search limits';
      setError(errorMessage);
      return {
        canSearch: false,
        message: errorMessage
      };
    }
  }, [searchLimitService]);

  // Record a search (increment counter)
  const recordSearch = useCallback(async (searchType: 'property' | 'map' = 'property') => {
    try {
      const result = await searchLimitService.recordSearch(searchType);
      
      if (result.success && result.quota) {
        // Update local state with new quota
        setQuota(result.quota);
        
        const remaining = result.quota.membershipTier === 'pro' 
          ? -1 
          : Math.max(0, result.quota.dailyLimit - result.quota.searchCount);
        
        setRemainingSearches(remaining);
        setCanSearch(result.quota.membershipTier === 'pro' || remaining > 0);
        
        // Clear any previous errors
        setError(null);
        
        console.log('✅ Search recorded successfully:', result.message);
      } else {
        setError(result.message || 'Failed to record search');
      }
      
      return {
        success: result.success,
        message: result.message
      };
    } catch (err) {
      console.error('❌ Failed to record search:', err);
      const errorMessage = 'Failed to record search';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }
  }, [searchLimitService]);

  // Refresh quota (re-fetch from service)
  const refreshQuota = useCallback(async () => {
    await loadQuota();
  }, [loadQuota]);

  // Reset quota (for testing/admin purposes)
  const resetQuota = useCallback(async (): Promise<boolean> => {
    try {
      const success = await searchLimitService.resetUserQuota();
      if (success) {
        await loadQuota(); // Reload after reset
        console.log('🔄 Search quota reset successfully');
      }
      return success;
    } catch (err) {
      console.error('❌ Failed to reset quota:', err);
      setError('Failed to reset search quota');
      return false;
    }
  }, [searchLimitService, loadQuota]);

  // Load quota on mount and when user changes
  useEffect(() => {
    loadQuota();
    
    // Initialize service
    searchLimitService.initialize();
    
    // Set up refresh interval (every 5 minutes)
    const refreshInterval = setInterval(() => {
      loadQuota();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [loadQuota, searchLimitService]);

  // Listen for user authentication changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Refresh quota when user data changes
      if (e.key && (e.key.includes('user') || e.key.includes('auth'))) {
        loadQuota();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadQuota]);

  return {
    quota,
    remainingSearches,
    canSearch,
    isLoading,
    error,
    checkCanSearch,
    recordSearch,
    refreshQuota,
    resetQuota
  };
};

export default useSearchLimits;
