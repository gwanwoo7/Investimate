import { createClient } from '@supabase/supabase-js';

// Types for our membership system
export interface UserSubscription {
  id: string;
  email: string;
  full_name?: string;
  subscription_status: 'free' | 'pro' | 'canceled' | 'expired' | 'trial';
  subscription_tier: 'free' | 'pro' | 'enterprise';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  trial_starts_at?: string;
  trial_ends_at?: string;
  trial_used: boolean;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
  monthly_searches_used: number;
  monthly_analyses_used: number;
  last_usage_reset: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureLimit {
  subscription_tier: string;
  feature_name: string;
  monthly_limit: number;
  daily_limit?: number;
}

export interface UsageRecord {
  user_id: string;
  feature_name: string;
  usage_count: number;
  period_start: string;
  period_end: string;
  last_used: string;
}

class SecureMembershipService {
  private supabase;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  // ====================================
  // USER MANAGEMENT
  // ====================================

  async getCurrentUser(): Promise<UserSubscription | null> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) {
        return null;
      }

      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }

  async updateUserProfile(updates: Partial<UserSubscription>): Promise<boolean> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      
      if (authError || !user) {
        return false;
      }

      const { error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserProfile:', error);
      return false;
    }
  }

  // ====================================
  // SUBSCRIPTION MANAGEMENT
  // ====================================

  async checkSubscriptionStatus(): Promise<{
    isActive: boolean;
    tier: string;
    status: string;
    trialRemaining?: number;
    subscriptionEnds?: string;
  }> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { isActive: false, tier: 'free', status: 'free' };
      }

      const now = new Date();
      
      // Check if trial is active
      if (user.trial_ends_at && new Date(user.trial_ends_at) > now) {
        const trialEnd = new Date(user.trial_ends_at);
        const trialRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        return {
          isActive: true,
          tier: 'trial',
          status: 'trial',
          trialRemaining
        };
      }

      // Check if subscription is active
      if (user.subscription_ends_at && new Date(user.subscription_ends_at) > now) {
        return {
          isActive: true,
          tier: user.subscription_tier,
          status: user.subscription_status,
          subscriptionEnds: user.subscription_ends_at
        };
      }

      // Default to free
      return { isActive: false, tier: 'free', status: 'free' };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return { isActive: false, tier: 'free', status: 'free' };
    }
  }

  // ====================================
  // FEATURE ACCESS CONTROL
  // ====================================

  async canAccessFeature(featureName: string): Promise<{
    allowed: boolean;
    remaining?: number;
    limit?: number;
    tier: string;
  }> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { allowed: false, tier: 'free' };
      }

      // Get user's effective tier (trial acts as pro)
      const subscriptionStatus = await this.checkSubscriptionStatus();
      const effectiveTier = subscriptionStatus.isActive ? 
        (subscriptionStatus.tier === 'trial' ? 'pro' : subscriptionStatus.tier) : 
        'free';

      // Get feature limit for this tier
      const { data: featureLimit } = await this.supabase
        .from('feature_limits')
        .select('monthly_limit')
        .eq('subscription_tier', effectiveTier)
        .eq('feature_name', featureName)
        .eq('is_active', true)
        .single();

      // If no limit found or unlimited (-1), allow access
      if (!featureLimit || featureLimit.monthly_limit === -1) {
        return { allowed: true, tier: effectiveTier };
      }

      // Get current month usage
      const currentPeriodStart = new Date();
      currentPeriodStart.setDate(1);
      currentPeriodStart.setHours(0, 0, 0, 0);

      const { data: usage } = await this.supabase
        .from('user_usage')
        .select('usage_count')
        .eq('user_id', user.id)
        .eq('feature_name', featureName)
        .eq('period_start', currentPeriodStart.toISOString())
        .single();

      const currentUsage = usage?.usage_count || 0;
      const remaining = Math.max(0, featureLimit.monthly_limit - currentUsage);

      return {
        allowed: remaining > 0,
        remaining,
        limit: featureLimit.monthly_limit,
        tier: effectiveTier
      };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return { allowed: false, tier: 'free' };
    }
  }

  async useFeature(featureName: string, metadata?: any): Promise<{
    success: boolean;
    remaining?: number;
    error?: string;
  }> {
    try {
      // Check if feature can be accessed
      const access = await this.canAccessFeature(featureName);
      
      if (!access.allowed) {
        return {
          success: false,
          error: access.remaining === 0 ? 
            `Monthly limit of ${access.limit} reached for ${featureName}` :
            `Access denied for ${featureName}`
        };
      }

      const user = await this.getCurrentUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Call the database function to increment usage
      const { error } = await this.supabase.rpc('increment_feature_usage', {
        p_user_id: user.id,
        p_feature_name: featureName,
        p_metadata: metadata ? JSON.stringify(metadata) : null
      });

      if (error) {
        console.error('Error incrementing feature usage:', error);
        return { success: false, error: 'Failed to track usage' };
      }

      // Log the feature access
      await this.logAuditEvent('feature_accessed', 'feature', featureName, {
        success: true,
        metadata
      });

      // Return updated remaining count
      const updatedAccess = await this.canAccessFeature(featureName);
      
      return {
        success: true,
        remaining: updatedAccess.remaining
      };
    } catch (error) {
      console.error('Error using feature:', error);
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
  // SECURITY HELPERS
  // ====================================

  async validateUserAccess(requiredTier?: string): Promise<{
    valid: boolean;
    user?: UserSubscription;
    error?: string;
  }> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { valid: false, error: 'Authentication required' };
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
export const membershipService = new SecureMembershipService();
