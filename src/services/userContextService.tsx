import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { SupabaseUserService } from './supabaseService';
import DatabaseService from './databaseService';

// Enhanced user interface
export interface User {
  id: string;
  email: string;
  name?: string;
  isSubscribed: boolean;
  subscriptionTier: 'free' | 'pro' | 'trial';
  subscriptionStatus: 'inactive' | 'active' | 'canceled' | 'past_due' | 'trial';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionEndDate?: string;
  searchesUsed: number;
  searchesRemaining: number;
  maxSearches: number;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // User actions
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (email: string, name: string, password?: string) => Promise<boolean>;
  
  // Subscription actions
  upgradeToProWithStripe: (stripeCustomerId: string, subscriptionId: string) => Promise<boolean>;
  checkSubscriptionStatus: () => Promise<void>;
  
  // Usage tracking
  canUseFeature: (feature: string) => Promise<boolean>;
  useFeature: (feature: string) => Promise<boolean>;
  resetSearchCount: () => void;
  
  // Utilities
  isProUser: () => boolean;
  isTrialUser: () => boolean;
  getSubscriptionInfo: () => { tier: string; status: string; expiresAt?: string };
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const db = new DatabaseService();

  // Initialize user session on app load
  useEffect(() => {
    initializeUserSession();
  }, []);

  const initializeUserSession = async () => {
    console.log('🚀 Initializing user session...');
    setIsLoading(true);
    setError(null);

    try {
      // Try to restore session from Supabase first (most reliable)
      const supabaseSession = await SupabaseUserService.validateSession();
      
      if (supabaseSession) {
        console.log('✅ Found valid Supabase session:', supabaseSession.email);
        
        const userProfile = await SupabaseUserService.getUserProfile(supabaseSession.email);
        
        if (userProfile) {
          const isPro = userProfile.subscription_status === 'active' && userProfile.subscription_tier === 'pro';
          
          const userData: User = {
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.email.split('@')[0], // Extract name from email
            isSubscribed: isPro,
            subscriptionTier: userProfile.subscription_tier as 'free' | 'pro' | 'trial',
            subscriptionStatus: userProfile.subscription_status as any,
            stripeCustomerId: userProfile.stripe_customer_id,
            stripeSubscriptionId: userProfile.stripe_subscription_id,
            subscriptionEndDate: userProfile.subscription_end_date,
            searchesUsed: 0,
            searchesRemaining: isPro ? 999 : 5,
            maxSearches: isPro ? 999 : 5
          };
          
          setUser(userData);
          
          // Update local database to match Supabase
          db.updateUser(userData.id, {
            email: userData.email,
            name: userData.name,
            isSubscribed: userData.isSubscribed
          });
          
          console.log('✅ User session restored from Supabase:', userData.email);
          return;
        }
      }

      // Fallback to local storage session
      const localUser = db.getCurrentUser();
      if (localUser) {
        console.log('📱 Restoring session from local storage:', localUser.email);
        
        // Check if local user has Stripe data but not recognized as Pro
        const stripeCustomerId = localStorage.getItem('stripe_customer_id');
        const stripeSubscriptionId = localStorage.getItem('stripe_subscription_id');
        
        if (stripeCustomerId && stripeSubscriptionId && !localUser.isSubscribed) {
          console.log('🔄 Found Stripe subscription data, upgrading local user...');
          
          // Create Supabase profile for this user
          await SupabaseUserService.createUserProfile(
            localUser.email,
            stripeCustomerId,
            stripeSubscriptionId
          );
          
          // Update local user
          const updatedUser = db.updateUserSubscription(localUser.id, true);
          if (updatedUser) {
            localUser.isSubscribed = true;
          }
        }

        const userData: User = {
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
          isSubscribed: localUser.isSubscribed || false,
          subscriptionTier: localUser.isSubscribed ? 'pro' : 'free',
          subscriptionStatus: localUser.isSubscribed ? 'active' : 'inactive',
          stripeCustomerId: stripeCustomerId || undefined,
          stripeSubscriptionId: stripeSubscriptionId || undefined,
          searchesUsed: parseInt(localStorage.getItem('investimate_search_count') || '0'),
          searchesRemaining: localUser.isSubscribed ? 999 : Math.max(0, 5 - parseInt(localStorage.getItem('investimate_search_count') || '0')),
          maxSearches: localUser.isSubscribed ? 999 : 5
        };

        setUser(userData);
        
        // Create session in Supabase for persistence
        await SupabaseUserService.createUserSession(userData.email);
      }

    } catch (err) {
      console.error('❌ Error initializing user session:', err);
      setError('Failed to initialize user session');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    console.log('🔐 Attempting login for:', email);
    setError(null);

    try {
      // Check if user exists in local database first
      const existingUser = await db.getUserByEmail(email);
      
      if (existingUser) {
        // Login successful, check for Supabase profile
        const userProfile = await SupabaseUserService.getUserProfile(email);
        
        const isPro = userProfile?.subscription_status === 'active' && userProfile?.subscription_tier === 'pro';
        
        const userData: User = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name,
          isSubscribed: isPro || existingUser.isSubscribed,
          subscriptionTier: isPro ? 'pro' : 'free',
          subscriptionStatus: isPro ? 'active' : 'inactive',
          stripeCustomerId: userProfile?.stripe_customer_id,
          stripeSubscriptionId: userProfile?.stripe_subscription_id,
          subscriptionEndDate: userProfile?.subscription_end_date,
          searchesUsed: parseInt(localStorage.getItem('investimate_search_count') || '0'),
          searchesRemaining: isPro ? 999 : Math.max(0, 5 - parseInt(localStorage.getItem('investimate_search_count') || '0')),
          maxSearches: isPro ? 999 : 5
        };

        setUser(userData);
        
        // Create session in Supabase
        await SupabaseUserService.createUserSession(email);
        
        console.log('✅ Login successful:', email);
        return true;
      } else {
        setError('User not found. Please sign up first.');
        return false;
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Login failed. Please try again.');
      return false;
    }
  };

  const signup = async (email: string, name: string, password?: string): Promise<boolean> => {
    console.log('📝 Attempting signup for:', email);
    setError(null);

    try {
      const newUser = await db.createUser(email, 'defaultPassword', name);
      
      if (newUser) {
        const userData: User = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          isSubscribed: false,
          subscriptionTier: 'free',
          subscriptionStatus: 'inactive',
          searchesUsed: 0,
          searchesRemaining: 5,
          maxSearches: 5
        };

        setUser(userData);
        
        // Create session in Supabase
        await SupabaseUserService.createUserSession(email);
        
        console.log('✅ Signup successful:', email);
        return true;
      } else {
        setError('Failed to create user account');
        return false;
      }
    } catch (err) {
      console.error('❌ Signup error:', err);
      setError('Signup failed. Please try again.');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('👋 Logging out user...');
    
    try {
      // Clear Supabase session
      await SupabaseUserService.clearSession();
      
      // Clear local state
      setUser(null);
      
      // Clear local storage session data
      localStorage.removeItem('investimate_current_user');
      localStorage.removeItem('stripe_customer_id');
      localStorage.removeItem('stripe_subscription_id');
      
      console.log('✅ Logout successful');
    } catch (err) {
      console.error('❌ Logout error:', err);
    }
  };

  const upgradeToProWithStripe = async (stripeCustomerId: string, subscriptionId: string): Promise<boolean> => {
    console.log('⬆️ Upgrading user to Pro with Stripe:', { stripeCustomerId, subscriptionId });
    
    if (!user) {
      setError('No user logged in');
      return false;
    }

    try {
      // Create or update Supabase profile
      await SupabaseUserService.createUserProfile(user.email, stripeCustomerId, subscriptionId);
      
      // Update local user
      const updatedLocalUser = db.updateUserSubscription(user.id, true);
      
      if (updatedLocalUser) {
        const updatedUser: User = {
          ...user,
          isSubscribed: true,
          subscriptionTier: 'pro',
          subscriptionStatus: 'active',
          stripeCustomerId,
          stripeSubscriptionId: subscriptionId,
          searchesRemaining: 999,
          maxSearches: 999
        };

        setUser(updatedUser);
        
        // Store Stripe info in localStorage
        localStorage.setItem('stripe_customer_id', stripeCustomerId);
        localStorage.setItem('stripe_subscription_id', subscriptionId);
        localStorage.removeItem('investimate_search_count'); // Reset search count
        
        console.log('✅ User upgraded to Pro successfully');
        return true;
      }
      
      setError('Failed to update local user subscription');
      return false;
    } catch (err) {
      console.error('❌ Upgrade error:', err);
      setError('Failed to upgrade subscription');
      return false;
    }
  };

  const checkSubscriptionStatus = async (): Promise<void> => {
    if (!user) return;

    try {
      const userProfile = await SupabaseUserService.getUserProfile(user.email);
      
      if (userProfile) {
        const isPro = userProfile.subscription_status === 'active' && userProfile.subscription_tier === 'pro';
        
        if (isPro !== user.isSubscribed) {
          console.log('🔄 Subscription status changed, updating user...');
          
          const updatedUser: User = {
            ...user,
            isSubscribed: isPro,
            subscriptionTier: userProfile.subscription_tier as 'free' | 'pro' | 'trial',
            subscriptionStatus: userProfile.subscription_status as any,
            searchesRemaining: isPro ? 999 : Math.max(0, 5 - user.searchesUsed),
            maxSearches: isPro ? 999 : 5
          };

          setUser(updatedUser);
          
          // Update local database
          db.updateUserSubscription(user.id, isPro);
        }
      }
    } catch (err) {
      console.error('❌ Error checking subscription status:', err);
    }
  };

  const canUseFeature = async (feature: string): Promise<boolean> => {
    if (!user) return false;

    // Pro users have unlimited access
    if (user.isSubscribed) return true;

    // Free users have limited searches
    if (feature === 'property_search') {
      return user.searchesRemaining > 0;
    }

    return true; // Other features are unlimited for now
  };

  const useFeature = async (feature: string): Promise<boolean> => {
    if (!user) return false;

    const canUse = await canUseFeature(feature);
    if (!canUse) return false;

    // Pro users don't need usage tracking
    if (user.isSubscribed) return true;

    // Track usage for free users
    if (feature === 'property_search') {
      const newSearchesUsed = user.searchesUsed + 1;
      const newSearchesRemaining = Math.max(0, user.maxSearches - newSearchesUsed);

      setUser({
        ...user,
        searchesUsed: newSearchesUsed,
        searchesRemaining: newSearchesRemaining
      });

      // Update localStorage
      localStorage.setItem('investimate_search_count', newSearchesUsed.toString());
      
      console.log(`🔍 Search used. Remaining: ${newSearchesRemaining}/${user.maxSearches}`);
    }

    return true;
  };

  const resetSearchCount = () => {
    if (!user) return;

    const updatedUser: User = {
      ...user,
      searchesUsed: 0,
      searchesRemaining: user.maxSearches
    };

    setUser(updatedUser);
    localStorage.setItem('investimate_search_count', '0');
    
    console.log('🔄 Search count reset');
  };

  const isProUser = (): boolean => {
    return user?.isSubscribed === true && user?.subscriptionTier === 'pro';
  };

  const isTrialUser = (): boolean => {
    return user?.subscriptionTier === 'trial';
  };

  const getSubscriptionInfo = () => {
    if (!user) return { tier: 'free', status: 'inactive' };
    
    return {
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      expiresAt: user.subscriptionEndDate
    };
  };

  const value: UserContextType = {
    user,
    isLoading,
    error,
    login,
    logout,
    signup,
    upgradeToProWithStripe,
    checkSubscriptionStatus,
    canUseFeature,
    useFeature,
    resetSearchCount,
    isProUser,
    isTrialUser,
    getSubscriptionInfo
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
