import { useState, useEffect, useCallback } from 'react';
import { membershipService, type FeatureAccess, type SubscriptionStatus } from '../services/SecureMembershipService';

/**
 * Hook for managing feature access and usage tracking
 */
export function useFeatureAccess(featureName: string) {
  const [access, setAccess] = useState<FeatureAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await membershipService.canAccessFeature(featureName);
      setAccess(result);
    } catch (err) {
      console.error('Error checking feature access:', err);
      setError('Failed to check feature access');
      setAccess({
        allowed: false,
        remaining: null,
        limit: null,
        requiresUpgrade: true,
        message: 'Error checking access'
      });
    } finally {
      setLoading(false);
    }
  }, [featureName]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  const useFeature = useCallback(async (metadata?: any) => {
    try {
      const result = await membershipService.useFeature(featureName, metadata);
      
      if (result.success) {
        // Refresh access info to get updated remaining count
        await checkAccess();
      }
      
      return result;
    } catch (error) {
      console.error('Error using feature:', error);
      return { success: false, error: 'Failed to use feature' };
    }
  }, [featureName, checkAccess]);

  return {
    access,
    loading,
    error,
    useFeature,
    refreshAccess: checkAccess,
    canAccess: access?.allowed || false,
    remaining: access?.remaining,
    requiresUpgrade: access?.requiresUpgrade || false
  };
}

/**
 * Hook for managing subscription status
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await membershipService.checkSubscriptionStatus();
      setSubscription(status);
      console.log('🔄 Subscription status checked:', status);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError('Failed to check subscription status');
    } finally {
      setLoading(false);
    }
  }, []);

  const forceRefreshSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Force refreshing subscription status...');
      const status = await membershipService.refreshSubscriptionStatus();
      setSubscription(status);
      console.log('✅ Subscription status force refreshed:', status);
    } catch (err) {
      console.error('Error force refreshing subscription:', err);
      setError('Failed to refresh subscription status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const manageSubscription = useCallback(async () => {
    try {
      return await membershipService.createBillingPortalSession();
    } catch (error) {
      console.error('Error accessing billing portal:', error);
      throw error;
    }
  }, []);

  const upgradeToPro = useCallback(async () => {
    try {
      return await membershipService.createCheckoutSession('pro');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }, []);

  return {
    subscription,
    loading,
    error,
    refreshSubscription: checkSubscription,
    forceRefreshSubscription, // New method for force refresh
    manageSubscription,
    upgradeToPro,
    isActive: subscription?.isActive || false,
    tier: subscription?.tier || 'free',
    isPro: subscription?.tier === 'pro' && subscription?.isActive,
    isTrial: subscription?.tier === 'trial' && subscription?.isActive,
    trialDaysLeft: subscription?.trialDaysLeft || 0
  };
}

/**
 * Hook for user authentication state
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await membershipService.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const userProfile = await membershipService.getUserProfile();
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      setError('Failed to check authentication');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const authChangeHandler = membershipService.getAuthStateChangeSubscription();
    const { data: { subscription } } = authChangeHandler(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          checkAuth();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  const signOut = useCallback(async () => {
    try {
      await membershipService.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    signOut,
    refreshAuth: checkAuth
  };
}

/**
 * Hook for usage statistics
 */
export function useUsageStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const usage = await membershipService.getUserUsageStats();
      setStats(usage);
    } catch (err) {
      console.error('Error loading usage stats:', err);
      setError('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: loadStats
  };
}
