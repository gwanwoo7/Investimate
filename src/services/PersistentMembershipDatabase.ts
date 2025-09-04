/**
 * 🔒 PERSISTENT MEMBERSHIP DATABASE SERVICE
 * 
 * Server-side membership management that persists across browser sessions
 * Integrates with Supabase as the source of truth for subscription status
 * Provides fallback mechanisms for offline scenarios
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { membershipService } from './SecureMembershipService';
import DatabaseService from './databaseService';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface PersistentUserMembership {
  userId: string;
  email: string;
  subscriptionStatus: 'free' | 'pro' | 'trial' | 'expired' | 'canceled';
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  lastSyncedAt: string;
  serverTimestamp: string;
  features: {
    unlimitedSearches: boolean;
    advancedAnalytics: boolean;
    propertyAlerts: boolean;
    portfolioTracking: boolean;
    premiumSupport: boolean;
  };
}

export class PersistentMembershipDatabase {
  private static instance: PersistentMembershipDatabase;
  private supabase: SupabaseClient;
  private localDb: DatabaseService;
  private membershipCache: Map<string, PersistentUserMembership> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly MEMBERSHIP_TABLE = 'user_memberships';
  private readonly LOCAL_STORAGE_KEY = 'investimate_persistent_membership';

  private constructor() {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured for persistent membership database');
    }
    
    this.supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
    this.localDb = DatabaseService.getInstance();
    
    // Initialize periodic sync
    this.startPeriodicSync();
  }

  static getInstance(): PersistentMembershipDatabase {
    if (!PersistentMembershipDatabase.instance) {
      PersistentMembershipDatabase.instance = new PersistentMembershipDatabase();
    }
    return PersistentMembershipDatabase.instance;
  }

  /**
   * Get user membership status from persistent database
   * Falls back to local cache if server unavailable
   */
  async getUserMembership(userId: string): Promise<PersistentUserMembership | null> {
    try {
      console.log('🔍 Fetching persistent membership for user:', userId);

      // Check cache first
      const cached = this.membershipCache.get(userId);
      if (cached && this.isCacheValid(cached.lastSyncedAt)) {
        console.log('⚡ Returning cached membership data');
        return cached;
      }

      // Try to fetch from Supabase first
      if (supabaseUrl && supabaseAnonKey) {
        try {
          const { data, error } = await this.supabase
            .from(this.MEMBERSHIP_TABLE)
            .select('*')
            .eq('user_id', userId)
            .single();

          if (data && !error) {
            const membership = this.mapSupabaseToMembership(data);
            this.membershipCache.set(userId, membership);
            this.saveToLocalStorage(userId, membership);
            console.log('✅ Fetched membership from Supabase:', membership.subscriptionStatus);
            return membership;
          }
        } catch (supabaseError) {
          console.warn('⚠️ Supabase fetch failed, trying fallback:', supabaseError);
        }
      }

      // Fallback to local storage
      const localMembership = this.loadFromLocalStorage(userId);
      if (localMembership) {
        console.log('📦 Using local storage fallback for membership');
        return localMembership;
      }

      // Final fallback: create default membership
      console.log('🔄 Creating default membership for new user');
      return await this.createDefaultMembership(userId);

    } catch (error) {
      console.error('❌ Failed to get user membership:', error);
      return this.createDefaultMembershipLocal(userId);
    }
  }

  /**
   * Update user membership status in persistent database
   */
  async updateUserMembership(
    userId: string, 
    updates: Partial<PersistentUserMembership>
  ): Promise<PersistentUserMembership | null> {
    try {
      console.log('🔄 Updating persistent membership for user:', userId, updates);

      const currentMembership = await this.getUserMembership(userId) || this.createDefaultMembershipLocal(userId);
      const updatedMembership: PersistentUserMembership = {
        ...currentMembership,
        ...updates,
        lastSyncedAt: new Date().toISOString(),
        serverTimestamp: new Date().toISOString()
      };

      // Update cache immediately
      this.membershipCache.set(userId, updatedMembership);

      // Save to local storage immediately
      this.saveToLocalStorage(userId, updatedMembership);

      // Try to sync to Supabase (non-blocking)
      if (supabaseUrl && supabaseAnonKey) {
        this.syncToSupabase(userId, updatedMembership).catch(error => {
          console.warn('⚠️ Background sync to Supabase failed:', error);
        });
      }

      // Update local database user subscription status
      const localUser = this.localDb.getCurrentUser();
      if (localUser && localUser.id === userId) {
        this.localDb.updateUserSubscription(userId, updatedMembership.isActive);
      }

      console.log('✅ Membership updated successfully:', updatedMembership.subscriptionStatus);
      return updatedMembership;

    } catch (error) {
      console.error('❌ Failed to update user membership:', error);
      return null;
    }
  }

  /**
   * Sync membership status with Stripe subscription
   */
  async syncWithStripe(userId: string, stripeData: {
    customerId: string;
    subscriptionId: string;
    status: string;
    currentPeriodEnd: number;
  }): Promise<void> {
    try {
      console.log('💳 Syncing membership with Stripe:', stripeData);

      const isActive = ['active', 'trialing'].includes(stripeData.status);
      const subscriptionStatus: PersistentUserMembership['subscriptionStatus'] = 
        stripeData.status === 'trialing' ? 'trial' :
        isActive ? 'pro' : 'expired';

      await this.updateUserMembership(userId, {
        subscriptionStatus,
        subscriptionTier: isActive ? 'pro' : 'free',
        isActive,
        stripeCustomerId: stripeData.customerId,
        stripeSubscriptionId: stripeData.subscriptionId,
        subscriptionEndDate: new Date(stripeData.currentPeriodEnd * 1000).toISOString(),
        features: {
          unlimitedSearches: isActive,
          advancedAnalytics: isActive,
          propertyAlerts: isActive,
          portfolioTracking: isActive,
          premiumSupport: isActive
        }
      });

      console.log('✅ Membership synced with Stripe successfully');
    } catch (error) {
      console.error('❌ Failed to sync with Stripe:', error);
    }
  }

  /**
   * Check if user has specific feature access
   */
  async hasFeatureAccess(userId: string, feature: keyof PersistentUserMembership['features']): Promise<boolean> {
    const membership = await this.getUserMembership(userId);
    return membership?.features[feature] || false;
  }

  /**
   * Get membership summary for display
   */
  async getMembershipSummary(userId: string): Promise<{
    status: string;
    tier: string;
    isActive: boolean;
    expiresAt?: string;
    features: string[];
  }> {
    const membership = await this.getUserMembership(userId);
    
    if (!membership) {
      return {
        status: 'free',
        tier: 'free',
        isActive: false,
        features: []
      };
    }

    const activeFeatures = Object.entries(membership.features)
      .filter(([_, enabled]) => enabled)
      .map(([feature, _]) => this.formatFeatureName(feature));

    return {
      status: membership.subscriptionStatus,
      tier: membership.subscriptionTier,
      isActive: membership.isActive,
      expiresAt: membership.subscriptionEndDate,
      features: activeFeatures
    };
  }

  /**
   * Force refresh membership from all sources
   */
  async refreshMembership(userId: string): Promise<PersistentUserMembership | null> {
    try {
      console.log('🔄 Force refreshing membership for user:', userId);

      // Clear cache
      this.membershipCache.delete(userId);

      // Fetch latest from membership service
      const subscriptionStatus = await membershipService.checkSubscriptionStatus();
      
      // Update persistent membership
      await this.updateUserMembership(userId, {
        subscriptionStatus: subscriptionStatus.isActive ? 'pro' : 'free',
        subscriptionTier: subscriptionStatus.tier === 'pro' ? 'pro' : 'free',
        isActive: subscriptionStatus.isActive,
        subscriptionEndDate: subscriptionStatus.currentPeriodEnd || undefined,
        features: {
          unlimitedSearches: subscriptionStatus.isActive,
          advancedAnalytics: subscriptionStatus.isActive,
          propertyAlerts: subscriptionStatus.isActive,
          portfolioTracking: subscriptionStatus.isActive,
          premiumSupport: subscriptionStatus.isActive
        }
      });

      return await this.getUserMembership(userId);
    } catch (error) {
      console.error('❌ Failed to refresh membership:', error);
      return null;
    }
  }

  // Private helper methods

  private mapSupabaseToMembership(data: any): PersistentUserMembership {
    return {
      userId: data.user_id,
      email: data.email,
      subscriptionStatus: data.subscription_status || 'free',
      subscriptionTier: data.subscription_tier || 'free',
      isActive: data.is_active || false,
      stripeCustomerId: data.stripe_customer_id,
      stripeSubscriptionId: data.stripe_subscription_id,
      subscriptionStartDate: data.subscription_start_date,
      subscriptionEndDate: data.subscription_end_date,
      trialStartDate: data.trial_start_date,
      trialEndDate: data.trial_end_date,
      lastSyncedAt: new Date().toISOString(),
      serverTimestamp: data.updated_at || new Date().toISOString(),
      features: {
        unlimitedSearches: data.feature_unlimited_searches || false,
        advancedAnalytics: data.feature_advanced_analytics || false,
        propertyAlerts: data.feature_property_alerts || false,
        portfolioTracking: data.feature_portfolio_tracking || false,
        premiumSupport: data.feature_premium_support || false
      }
    };
  }

  private async syncToSupabase(userId: string, membership: PersistentUserMembership): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.MEMBERSHIP_TABLE)
        .upsert({
          user_id: userId,
          email: membership.email,
          subscription_status: membership.subscriptionStatus,
          subscription_tier: membership.subscriptionTier,
          is_active: membership.isActive,
          stripe_customer_id: membership.stripeCustomerId,
          stripe_subscription_id: membership.stripeSubscriptionId,
          subscription_start_date: membership.subscriptionStartDate,
          subscription_end_date: membership.subscriptionEndDate,
          trial_start_date: membership.trialStartDate,
          trial_end_date: membership.trialEndDate,
          feature_unlimited_searches: membership.features.unlimitedSearches,
          feature_advanced_analytics: membership.features.advancedAnalytics,
          feature_property_alerts: membership.features.propertyAlerts,
          feature_portfolio_tracking: membership.features.portfolioTracking,
          feature_premium_support: membership.features.premiumSupport,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      console.log('✅ Membership synced to Supabase successfully');
    } catch (error) {
      console.error('❌ Failed to sync to Supabase:', error);
      throw error;
    }
  }

  private saveToLocalStorage(userId: string, membership: PersistentUserMembership): void {
    try {
      const allMemberships = this.getAllFromLocalStorage();
      allMemberships[userId] = membership;
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(allMemberships));
    } catch (error) {
      console.warn('Failed to save membership to localStorage:', error);
    }
  }

  private loadFromLocalStorage(userId: string): PersistentUserMembership | null {
    try {
      const allMemberships = this.getAllFromLocalStorage();
      return allMemberships[userId] || null;
    } catch (error) {
      console.warn('Failed to load membership from localStorage:', error);
      return null;
    }
  }

  private getAllFromLocalStorage(): Record<string, PersistentUserMembership> {
    try {
      const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  private isCacheValid(lastSyncedAt: string): boolean {
    const now = Date.now();
    const lastSync = new Date(lastSyncedAt).getTime();
    return (now - lastSync) < this.CACHE_DURATION;
  }

  private async createDefaultMembership(userId: string): Promise<PersistentUserMembership> {
    const localUser = this.localDb.getCurrentUser();
    const email = localUser?.email || `user-${userId}@investimate.com`;

    const defaultMembership: PersistentUserMembership = {
      userId,
      email,
      subscriptionStatus: 'free',
      subscriptionTier: 'free',
      isActive: false,
      lastSyncedAt: new Date().toISOString(),
      serverTimestamp: new Date().toISOString(),
      features: {
        unlimitedSearches: false,
        advancedAnalytics: false,
        propertyAlerts: false,
        portfolioTracking: false,
        premiumSupport: false
      }
    };

    await this.updateUserMembership(userId, defaultMembership);
    return defaultMembership;
  }

  private createDefaultMembershipLocal(userId: string): PersistentUserMembership {
    const localUser = this.localDb.getCurrentUser();
    const email = localUser?.email || `user-${userId}@investimate.com`;

    return {
      userId,
      email,
      subscriptionStatus: 'free',
      subscriptionTier: 'free',
      isActive: false,
      lastSyncedAt: new Date().toISOString(),
      serverTimestamp: new Date().toISOString(),
      features: {
        unlimitedSearches: false,
        advancedAnalytics: false,
        propertyAlerts: false,
        portfolioTracking: false,
        premiumSupport: false
      }
    };
  }

  private formatFeatureName(feature: string): string {
    return feature
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private startPeriodicSync(): void {
    // Sync every 30 minutes
    setInterval(async () => {
      const currentUser = this.localDb.getCurrentUser();
      if (currentUser) {
        try {
          await this.refreshMembership(currentUser.id);
          console.log('🔄 Periodic membership sync completed');
        } catch (error) {
          console.warn('⚠️ Periodic sync failed:', error);
        }
      }
    }, 30 * 60 * 1000);
  }
}

export const persistentMembershipDb = PersistentMembershipDatabase.getInstance();
