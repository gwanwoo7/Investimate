import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced type definitions
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_status: 'free' | 'active' | 'pro' | 'canceled' | 'expired' | 'trial' | 'inactive' | 'past_due' | 'trialing';
  subscription_tier: 'free' | 'pro' | 'enterprise';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  trial_starts_at?: string;
  trial_ends_at?: string;
  trial_used: boolean;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
  billing_cycle: 'monthly' | 'yearly';
  last_payment_at?: string;
  next_billing_date?: string;
  monthly_searches_used: number;
  monthly_analyses_used: number;
  last_usage_reset: string;
  onboarding_completed: boolean;
  marketing_consent: boolean;
  terms_accepted_at?: string;
  privacy_accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureAccess {
  allowed: boolean;
  remaining: number | null; // null means unlimited
  limit: number | null;
  resetDate?: string;
  requiresUpgrade: boolean;
  message?: string;
}

interface UsageStats {
  totalSearches: number;
  totalAnalyses: number;
  monthlySearches: number;
  monthlyAnalyses: number;
  lastActivity: string | null;
  user?: UserProfile; // Fixed: changed from UserSubscription to UserProfile
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: 'free' | 'trial' | 'pro';
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  trialDaysLeft: number; // Added this property
}

/**
 * 🔒 SECURE MEMBERSHIP SERVICE
 * 
 * Unified service for all membership, subscription, and feature access management
 * Connects React app to Supabase backend with proper security and usage tracking
 */
export class SecureMembershipService {
  private static instance: SecureMembershipService;
  private supabase: SupabaseClient;
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;
  private subscriptionCache: SubscriptionStatus | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Check your .env file.');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.initializeAuth();
    
    // Listen for auth state changes to clear cache
    this.supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        this.clearSubscriptionCache();
      }
    });
  }

  static getInstance(): SecureMembershipService {
    if (!SecureMembershipService.instance) {
      SecureMembershipService.instance = new SecureMembershipService();
    }
    return SecureMembershipService.instance;
  }

  // ====================================
  // AUTHENTICATION & USER MANAGEMENT
  // ====================================

  private async initializeAuth(): Promise<void> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session?.user) {
        this.currentUser = session.user;
        await this.loadUserProfile();
      }

      // Listen for auth changes
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        
        if (session?.user) {
          this.currentUser = session.user;
          await this.loadUserProfile();
        } else {
          this.currentUser = null;
          this.userProfile = null;
        }
      });
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
    }
  }

  private async loadUserProfile(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();

      if (error) {
        console.error('❌ Error loading user profile:', error);
        return;
      }

      this.userProfile = data;
      
      // Clear subscription cache when profile is refreshed
      this.clearSubscriptionCache();
      
      console.log('✅ User profile loaded:', {
        email: data.email,
        tier: data.subscription_tier,
        status: data.subscription_status,
        endsAt: data.subscription_ends_at,
        trialEndsAt: data.trial_ends_at
      });
    } catch (error) {
      console.error('❌ Exception loading user profile:', error);
    }
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    if (!this.userProfile && this.currentUser) {
      await this.loadUserProfile();
    }
    return this.userProfile;
  }

  async getUserProfile(): Promise<UserProfile | null> {
    if (!this.userProfile && this.currentUser) {
      await this.loadUserProfile();
    }
    return this.userProfile;
  }

  async refreshUserProfile(): Promise<UserProfile | null> {
    await this.loadUserProfile();
    return this.userProfile;
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      if (!this.currentUser) return false;

      const { error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', this.currentUser.id);

      if (error) {
        console.error('❌ Error updating user profile:', error);
        return false;
      }

      // Refresh local profile
      await this.loadUserProfile();
      return true;
    } catch (error) {
      console.error('❌ Exception updating user profile:', error);
      return false;
    }
  }

  // ====================================
  // CACHE MANAGEMENT
  // ====================================

  private clearSubscriptionCache(): void {
    this.subscriptionCache = null;
    this.cacheExpiry = 0;
    console.log('🔄 Subscription cache cleared');
  }

  private isSubscriptionCacheValid(): boolean {
    return this.subscriptionCache !== null && Date.now() < this.cacheExpiry;
  }

  private setCachedSubscription(subscription: SubscriptionStatus): void {
    this.subscriptionCache = subscription;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
    console.log('💾 Subscription cached for 5 minutes');
  }

  // Force refresh subscription status (bypasses cache)
  async refreshSubscriptionStatus(): Promise<SubscriptionStatus> {
    this.clearSubscriptionCache();
    return this.checkSubscriptionStatus();
  }

  // ====================================
  // SUBSCRIPTION STATUS MANAGEMENT
  // ====================================

  async checkSubscriptionStatus(): Promise<SubscriptionStatus> {
    // Return cached result if valid
    if (this.isSubscriptionCacheValid()) {
      console.log('✅ Using cached subscription status');
      return this.subscriptionCache!;
    }

    console.log('🔍 Fetching fresh subscription status...');
    const profile = await this.getUserProfile();
    
    if (!profile) {
      const freeStatus: SubscriptionStatus = {
        tier: 'free',
        status: 'free',
        isActive: false,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        trialEnd: null,
        trialDaysLeft: 0
      };
      this.setCachedSubscription(freeStatus);
      return freeStatus;
    }

    // Check if trial is active
    const isInTrial = await this.isUserInTrial();
    
    if (isInTrial) {
      const trialDaysRemaining = this.calculateTrialDaysRemaining(profile);
      const trialStatus: SubscriptionStatus = {
        tier: 'trial',
        status: 'trial',
        isActive: true,
        currentPeriodEnd: profile.trial_ends_at || null,
        cancelAtPeriodEnd: false,
        trialEnd: profile.trial_ends_at || null,
        trialDaysLeft: trialDaysRemaining
      };
      this.setCachedSubscription(trialStatus);
      return trialStatus;
    }

    // Check regular subscription - be flexible with status values
    const now = new Date();
    
    // Check multiple possible ways the subscription could be marked as active
    const hasActiveStatus = profile.subscription_status === 'active' || 
                           profile.subscription_status === 'pro';
    
    const hasProTier = profile.subscription_tier === 'pro' || 
                      profile.subscription_tier === 'enterprise';
    
    const isNotExpired = !profile.subscription_ends_at || 
                        new Date(profile.subscription_ends_at) > now;
    
    // Consider subscription active if either:
    // 1. Status indicates active/pro AND tier is pro/enterprise AND not expired
    // 2. Tier is pro/enterprise AND not expired (even if status is not set correctly)
    const subscriptionActive = (hasActiveStatus && hasProTier && isNotExpired) ||
                              (hasProTier && isNotExpired);
    
    // Determine the effective tier
    let effectiveTier: 'free' | 'trial' | 'pro' = 'free';
    if (subscriptionActive && hasProTier) {
      effectiveTier = 'pro';
    }

    console.log('🔍 Subscription Status Check (Enhanced):', {
      userId: profile.id,
      profileStatus: profile.subscription_status,
      profileTier: profile.subscription_tier,
      subscriptionEndsAt: profile.subscription_ends_at,
      hasActiveStatus,
      hasProTier,
      isNotExpired,
      subscriptionActive,
      effectiveTier,
      now: now.toISOString()
    });

    const subscriptionStatus: SubscriptionStatus = {
      tier: effectiveTier,
      status: profile.subscription_status,
      isActive: subscriptionActive,
      currentPeriodEnd: profile.subscription_ends_at || null,
      cancelAtPeriodEnd: false, // This would come from Stripe subscription data
      trialEnd: profile.trial_ends_at || null,
      trialDaysLeft: 0
    };

    this.setCachedSubscription(subscriptionStatus);
    return subscriptionStatus;
  }

  private async isUserInTrial(): Promise<boolean> {
    const profile = await this.getUserProfile();
    if (!profile) return false;

    return !!(
      profile.trial_ends_at &&
      new Date(profile.trial_ends_at) > new Date() &&
      !profile.trial_used
    );
  }

  private calculateTrialDaysRemaining(profile: UserProfile): number {
    if (!profile.trial_ends_at) return 0;
    
    const endDate = new Date(profile.trial_ends_at);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  // ====================================
  // FEATURE ACCESS CONTROL
  // ====================================

  async canAccessFeature(featureName: string): Promise<FeatureAccess> {
    try {
      const profile = await this.getUserProfile();
      
      if (!profile) {
        return {
          allowed: false,
          remaining: null,
          limit: null,
          requiresUpgrade: true,
          message: 'Please sign in to access this feature'
        };
      }

      // Call the database function to check access
      const { data, error } = await this.supabase
        .rpc('can_access_feature', {
          p_user_id: profile.id,
          p_feature_name: featureName
        });

      if (error) {
        console.error('❌ Error checking feature access:', error);
        return {
          allowed: false,
          remaining: null,
          limit: null,
          requiresUpgrade: true,
          message: 'Error checking access. Please try again.'
        };
      }

      if (data === true) {
        return {
          allowed: true,
          remaining: null,
          limit: null,
          requiresUpgrade: false
        };
      }

      // Get usage details for better UX
      const usageInfo = await this.getFeatureUsage(featureName);
      const limit = usageInfo?.limit || 0;
      const used = usageInfo?.used || 0;
      const remaining = limit === -1 ? null : Math.max(0, limit - used);

      return {
        allowed: false,
        remaining,
        limit: limit === -1 ? null : limit,
        requiresUpgrade: true,
        message: this.getUpgradeMessage(featureName, remaining, limit),
        resetDate: this.getNextResetDate()
      };
    } catch (error) {
      console.error('❌ Exception checking feature access:', error);
      return {
        allowed: false,
        remaining: null,
        limit: null,
        requiresUpgrade: true,
        message: 'Access check failed. Please try again.'
      };
    }
  }

  private getUpgradeMessage(feature: string, remaining: number | null, limit: number | null): string {
    if (remaining === 0) {
      return `You've reached your monthly limit for ${feature}. Upgrade to Pro for unlimited access!`;
    }
    if (remaining && remaining > 0) {
      return `${remaining} ${feature} searches remaining this month.`;
    }
    return `Upgrade to Pro for unlimited ${feature}!`;
  }

  private getNextResetDate(): string {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    return nextMonth.toISOString();
  }

  async getFeatureUsage(featureName: string): Promise<{
    used: number;
    limit: number;
    remaining: number;
    resetDate: string;
  } | null> {
    try {
      const profile = await this.getUserProfile();
      if (!profile) return null;

      // Get feature limit for current tier
      const subscriptionStatus = await this.checkSubscriptionStatus();
      const tier = subscriptionStatus.isActive ? subscriptionStatus.tier : 'free';

      const { data: featureLimit } = await this.supabase
        .from('feature_limits')
        .select('monthly_limit')
        .eq('subscription_tier', tier)
        .eq('feature_name', featureName)
        .eq('is_active', true)
        .single();

      // Get current usage
      const currentPeriodStart = new Date();
      currentPeriodStart.setDate(1);
      currentPeriodStart.setHours(0, 0, 0, 0);

      const { data: usage } = await this.supabase
        .from('user_usage')
        .select('usage_count')
        .eq('user_id', profile.id)
        .eq('feature_name', featureName)
        .eq('period_start', currentPeriodStart.toISOString())
        .single();

      const limit = featureLimit?.monthly_limit || 0;
      const used = usage?.usage_count || 0;
      const remaining = limit === -1 ? -1 : Math.max(0, limit - used);

      return {
        used,
        limit,
        remaining,
        resetDate: this.getNextResetDate()
      };
    } catch (error) {
      console.error('❌ Error getting feature usage:', error);
      return null;
    }
  }

  async useFeature(featureName: string, metadata?: any): Promise<{
    success: boolean;
    remaining?: number;
    error?: string;
  }> {
    try {
      // Check if feature access is allowed first
      const access = await this.canAccessFeature(featureName);
      if (!access.allowed) {
        return {
          success: false,
          error: access.message || 'Feature access denied',
          remaining: access.remaining || undefined
        };
      }

      const profile = await this.getUserProfile();
      if (!profile) {
        return { success: false, error: 'User not authenticated' };
      }

      // Increment usage
      const { error } = await this.supabase
        .rpc('increment_feature_usage', {
          p_user_id: profile.id,
          p_feature_name: featureName,
          p_metadata: metadata || null
        });

      if (error) {
        console.error('❌ Error incrementing feature usage:', error);
        return { success: false, error: 'Failed to track usage' };
      }

      // Log audit event
      await this.logAuditEvent(
        `feature_used`,
        'feature',
        featureName,
        { feature: featureName, metadata }
      );

      // Get updated remaining count
      const updatedAccess = await this.canAccessFeature(featureName);
      
      console.log(`✅ Feature used: ${featureName}`);
      return {
        success: true,
        remaining: updatedAccess.remaining || undefined
      };
    } catch (error) {
      console.error('❌ Exception using feature:', error);
      return { success: false, error: 'Internal error' };
    }
  }

  // ====================================
  // TRIAL MANAGEMENT
  // ====================================

  async startFreeTrial(durationDays: number = 14): Promise<{
    success: boolean;
    trialEnds?: string;
    error?: string;
  }> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      if (user.trial_used) {
        return { success: false, error: 'Free trial already used' };
      }

      const now = new Date();
      const trialEnds = new Date(now.getTime() + (durationDays * 24 * 60 * 60 * 1000));

      const { error } = await this.supabase
        .from('users')
        .update({
          subscription_status: 'trial',
          subscription_tier: 'pro', // Trial gets pro features
          trial_starts_at: now.toISOString(),
          trial_ends_at: trialEnds.toISOString(),
          trial_used: true
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error starting trial:', error);
        return { success: false, error: 'Failed to start trial' };
      }

      await this.logAuditEvent('trial_started', 'subscription', user.id, {
        duration_days: durationDays,
        trial_ends: trialEnds.toISOString()
      });

      return {
        success: true,
        trialEnds: trialEnds.toISOString()
      };
    } catch (error) {
      console.error('Error in startFreeTrial:', error);
      return { success: false, error: 'Internal error' };
    }
  }

  // ====================================
  // USAGE ANALYTICS
  // ====================================

  async getUserUsageStats(period: 'current' | 'previous' = 'current'): Promise<{
    period: string;
    usage: Record<string, number>;
    limits: Record<string, number>;
  }> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { period, usage: {}, limits: {} };
      }

      // Calculate period dates
      const now = new Date();
      let periodStart: Date;
      
      if (period === 'current') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      }

      // Get usage data
      const { data: usageData } = await this.supabase
        .from('user_usage')
        .select('feature_name, usage_count')
        .eq('user_id', user.id)
        .eq('period_start', periodStart.toISOString());

      // Get limits for user's tier
      const subscriptionStatus = await this.checkSubscriptionStatus();
      const effectiveTier = subscriptionStatus.isActive ? 
        (subscriptionStatus.tier === 'trial' ? 'pro' : subscriptionStatus.tier) : 
        'free';

      const { data: limitsData } = await this.supabase
        .from('feature_limits')
        .select('feature_name, monthly_limit')
        .eq('subscription_tier', effectiveTier)
        .eq('is_active', true);

      const usage: Record<string, number> = {};
      const limits: Record<string, number> = {};

      usageData?.forEach(item => {
        usage[item.feature_name] = item.usage_count;
      });

      limitsData?.forEach(item => {
        limits[item.feature_name] = item.monthly_limit;
      });

      return {
        period: periodStart.toISOString(),
        usage,
        limits
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return { period, usage: {}, limits: {} };
    }
  }

  // ====================================
  // AUDIT LOGGING
  // ====================================

  async logAuditEvent(
    action: string,
    resourceType: string,
    resourceId: string,
    metadata?: any
  ): Promise<void> {
    try {
      const user = await this.getCurrentUser();

      await this.supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id || null,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          metadata: metadata ? JSON.stringify(metadata) : null,
          success: true
        });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  // ====================================
  // STRIPE INTEGRATION
  // ====================================

  async createCheckoutSession(tier: 'pro'): Promise<{ url: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      const profile = await this.getUserProfile();
      if (!profile) {
        throw new Error('User profile not found');
      }

      // This would typically call your backend API
      // For now, redirect to your subscription page
      const baseUrl = window.location.origin;
      const checkoutUrl = `${baseUrl}/subscription?plan=${tier}&user=${user.id}`;
      
      return { url: checkoutUrl };
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      throw error;
    }
  }

  async createBillingPortalSession(): Promise<{ url: string }> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // This would typically call your backend API
      // For now, redirect to account management
      const baseUrl = window.location.origin;
      const portalUrl = `${baseUrl}/account/billing`;
      
      return { url: portalUrl };
    } catch (error) {
      console.error('❌ Error creating billing portal session:', error);
      throw error;
    }
  }

  // ====================================
  // AUTH HELPERS
  // ====================================

  async signOut(): Promise<void> {
    try {
      await this.logAuditEvent('user_logout', 'auth', 'logout');
      
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
        throw error;
      }
      
      // Clear cached data
      this.clearCache();
      
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Exception during sign out:', error);
      throw error;
    }
  }

  getAuthStateChangeSubscription() {
    return this.supabase.auth.onAuthStateChange.bind(this.supabase.auth);
  }

  private clearCache(): void {
    // Clear any cached user data
    // This could be expanded to clear other caches as needed
    console.log('🔄 Clearing user data cache');
  }

  async validateUserAccess(requiredTier?: string): Promise<{
    valid: boolean;
    user?: UserProfile; // Fixed: changed from UserSubscription to UserProfile
    error?: string;
  }> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { valid: false, error: 'Authentication required' };
      }

      const profile = await this.getUserProfile();
      if (!profile) {
        return { valid: false, error: 'User profile not found' };
      }

      if (requiredTier) {
        const subscription = await this.checkSubscriptionStatus();
        
        if (!subscription.isActive && requiredTier !== 'free') {
          return { valid: false, error: 'Subscription required' };
        }

        // Check tier hierarchy: free < trial/pro < enterprise
        const tierLevels = { free: 0, trial: 1, pro: 1, enterprise: 2 };
        const userLevel = tierLevels[subscription.tier as keyof typeof tierLevels] || 0;
        const requiredLevel = tierLevels[requiredTier as keyof typeof tierLevels] || 0;

        if (userLevel < requiredLevel) {
          return { valid: false, error: `${requiredTier} subscription required` };
        }
      }

      return { valid: true, user };
    } catch (error) {
      console.error('Error validating user access:', error);
      return { valid: false, error: 'Validation error' };
    }
  }

  // ====================================
  // MONTHLY RESET (for usage counters)
  // ====================================

  async resetMonthlyUsage(): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) return;

      const now = new Date();
      const lastReset = new Date(user.last_usage_reset);
      
      // Check if we need to reset (new month)
      if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        await this.supabase
          .from('users')
          .update({
            monthly_searches_used: 0,
            monthly_analyses_used: 0,
            last_usage_reset: now.toISOString()
          })
          .eq('id', user.id);

        await this.logAuditEvent('usage_reset', 'user', user.id, {
          reset_date: now.toISOString(),
          previous_reset: lastReset.toISOString()
        });
      }
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
    }
  }
}

// Export singleton instance
export const membershipService = SecureMembershipService.getInstance();
