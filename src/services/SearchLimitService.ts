import { membershipService } from './SecureMembershipService';
import DatabaseService from './databaseService';

interface SearchQuota {
  userId: string;
  email: string;
  searchCount: number;
  lastSearchDate: string;
  membershipTier: 'free' | 'pro';
  dailyLimit: number;
  resetTime: string;
}

class SearchLimitService {
  private static instance: SearchLimitService;
  private db = DatabaseService.getInstance();
  private storageKey = 'investimate_search_quota';

  private constructor() {}

  static getInstance(): SearchLimitService {
    if (!SearchLimitService.instance) {
      SearchLimitService.instance = new SearchLimitService();
    }
    return SearchLimitService.instance;
  }

  /**
   * Get user's current search quota and usage
   */
  async getUserSearchQuota(userId?: string): Promise<SearchQuota | null> {
    try {
      // Get current user (ignore userId for now as we only support current user)
      let currentUser = this.db.getCurrentUser();
      
      if (!currentUser) {
        console.warn('⚠️ No user found for search quota check');
        return null;
      }

      // Check membership status
      const membershipStatus = await membershipService.checkSubscriptionStatus();
      const isProUser = membershipStatus.isActive && membershipStatus.tier === 'pro';
      
      // Get today's date key
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const quotaKey = `${this.storageKey}_${currentUser.id}_${today}`;
      
      // Get existing quota from localStorage
      const existingQuota = localStorage.getItem(quotaKey);
      let searchQuota: SearchQuota;
      
      if (existingQuota) {
        searchQuota = JSON.parse(existingQuota);
        // Update membership tier in case it changed
        searchQuota.membershipTier = isProUser ? 'pro' : 'free';
        searchQuota.dailyLimit = isProUser ? -1 : 5; // -1 means unlimited for pro
      } else {
        // Create new quota for today
        searchQuota = {
          userId: currentUser.id,
          email: currentUser.email,
          searchCount: 0,
          lastSearchDate: today,
          membershipTier: isProUser ? 'pro' : 'free',
          dailyLimit: isProUser ? -1 : 5,
          resetTime: this.getNextResetTime()
        };
      }
      
      // Save updated quota
      localStorage.setItem(quotaKey, JSON.stringify(searchQuota));
      
      return searchQuota;
    } catch (error) {
      console.error('❌ Error getting search quota:', error);
      return null;
    }
  }

  /**
   * Check if user can perform a search (considering limits)
   */
  async canUserSearch(searchType: 'property' | 'map' = 'property'): Promise<{
    canSearch: boolean;
    quota: SearchQuota | null;
    message?: string;
    remainingSearches?: number;
  }> {
    try {
      const quota = await this.getUserSearchQuota();
      
      if (!quota) {
        return {
          canSearch: false,
          quota: null,
          message: 'Unable to verify search quota. Please sign in.'
        };
      }

      // Pro users have unlimited searches
      if (quota.membershipTier === 'pro') {
        return {
          canSearch: true,
          quota,
          message: 'Unlimited searches (Pro member)',
          remainingSearches: -1
        };
      }

      // Free users: check daily limit
      const remainingSearches = quota.dailyLimit - quota.searchCount;
      
      if (remainingSearches <= 0) {
        return {
          canSearch: false,
          quota,
          message: `Daily search limit reached (${quota.dailyLimit}). Upgrade to Pro for unlimited searches.`,
          remainingSearches: 0
        };
      }

      // Map search requires Pro membership (based on SOW requirements)
      if (searchType === 'map' && quota.membershipTier === 'free') {
        return {
          canSearch: false,
          quota,
          message: 'Map search requires Pro membership. Upgrade to unlock this feature.',
          remainingSearches
        };
      }

      return {
        canSearch: true,
        quota,
        message: `${remainingSearches} searches remaining today`,
        remainingSearches
      };
    } catch (error) {
      console.error('❌ Error checking search permission:', error);
      return {
        canSearch: false,
        quota: null,
        message: 'Unable to verify search quota'
      };
    }
  }

  /**
   * Record a search (increment counter)
   */
  async recordSearch(searchType: 'property' | 'map' = 'property'): Promise<{
    success: boolean;
    quota: SearchQuota | null;
    message?: string;
  }> {
    try {
      const quota = await this.getUserSearchQuota();
      
      if (!quota) {
        return {
          success: false,
          quota: null,
          message: 'Unable to record search - no quota found'
        };
      }

      // Don't record searches for Pro users (unlimited)
      if (quota.membershipTier === 'pro') {
        console.log('🌟 Pro user search recorded (unlimited)');
        return {
          success: true,
          quota,
          message: 'Search recorded (Pro unlimited)'
        };
      }

      // Increment search count for free users
      quota.searchCount += 1;
      
      // Save updated quota
      const today = new Date().toISOString().split('T')[0];
      const quotaKey = `${this.storageKey}_${quota.userId}_${today}`;
      localStorage.setItem(quotaKey, JSON.stringify(quota));
      
      console.log(`🔍 Search recorded for free user: ${quota.searchCount}/${quota.dailyLimit}`);
      
      const remainingSearches = quota.dailyLimit - quota.searchCount;
      
      return {
        success: true,
        quota,
        message: remainingSearches > 0 
          ? `Search recorded. ${remainingSearches} searches remaining today.`
          : 'Search recorded. Daily limit reached - upgrade to Pro for unlimited searches!'
      };
    } catch (error) {
      console.error('❌ Error recording search:', error);
      return {
        success: false,
        quota: null,
        message: 'Failed to record search'
      };
    }
  }

  /**
   * Get next reset time (midnight UTC)
   */
  private getNextResetTime(): string {
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0); // Set to midnight UTC tomorrow
    return tomorrow.toISOString();
  }

  /**
   * Clean up old quota data (keep only last 7 days)
   */
  cleanupOldQuotas(): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7);
      const cutoffStr = cutoffDate.toISOString().split('T')[0];
      
      // Get all localStorage keys
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          // Extract date from key: investimate_search_quota_userId_YYYY-MM-DD
          const datePart = key.split('_').pop();
          if (datePart && datePart < cutoffStr) {
            keysToRemove.push(key);
          }
        }
      }
      
      // Remove old keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      if (keysToRemove.length > 0) {
        console.log(`🧹 Cleaned up ${keysToRemove.length} old search quota entries`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup old quotas:', error);
    }
  }

  /**
   * Reset quota for testing purposes (admin only)
   */
  async resetUserQuota(userId?: string): Promise<boolean> {
    try {
      const currentUser = this.db.getCurrentUser();
      
      if (!currentUser) {
        return false;
      }

      const today = new Date().toISOString().split('T')[0];
      const quotaKey = `${this.storageKey}_${currentUser.id}_${today}`;
      
      localStorage.removeItem(quotaKey);
      console.log('🔄 User search quota reset for testing');
      return true;
    } catch (error) {
      console.error('❌ Failed to reset quota:', error);
      return false;
    }
  }

  /**
   * Get quota summary for all users (admin feature)
   */
  getAllQuotaSummary(): Array<{
    date: string;
    userId: string;
    searchCount: number;
    membershipTier: string;
  }> {
    try {
      const summaries: Array<any> = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          try {
            const quota = JSON.parse(localStorage.getItem(key) || '{}');
            const datePart = key.split('_').pop() || 'unknown';
            
            summaries.push({
              date: datePart,
              userId: quota.userId,
              searchCount: quota.searchCount,
              membershipTier: quota.membershipTier
            });
          } catch (parseError) {
            console.warn('⚠️ Failed to parse quota data:', key);
          }
        }
      }
      
      return summaries.sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('❌ Failed to get quota summary:', error);
      return [];
    }
  }

  /**
   * Initialize service and cleanup old data
   */
  initialize(): void {
    console.log('🔍 Search Limit Service initialized');
    this.cleanupOldQuotas();
  }
}

export default SearchLimitService;
