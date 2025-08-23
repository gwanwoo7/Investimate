import DatabaseService from './databaseService';

/**
 * Subscription Sync Service
 * Helps synchronize Stripe subscriptions with local user accounts
 */
class SubscriptionSyncService {
  private static instance: SubscriptionSyncService;

  static getInstance(): SubscriptionSyncService {
    if (!SubscriptionSyncService.instance) {
      SubscriptionSyncService.instance = new SubscriptionSyncService();
    }
    return SubscriptionSyncService.instance;
  }

  /**
   * Check if user has an active Stripe subscription
   * This can be used to verify subscription status on login
   */
  async checkStripeSubscription(email: string): Promise<boolean> {
    try {
      console.log('🔍 Checking Stripe subscription for:', email);
      
      // In a real implementation, this would call your backend API
      // that queries Stripe for active subscriptions by customer email
      
      const response = await fetch('/.netlify/functions/check-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Stripe subscription check result:', data.hasActiveSubscription);
        return data.hasActiveSubscription;
      }
      
      console.log('⚠️ Could not check Stripe subscription, assuming local status');
      return false;
      
    } catch (error) {
      console.error('❌ Error checking Stripe subscription:', error);
      return false;
    }
  }

  /**
   * Sync user subscription status with Stripe
   * This updates local database based on Stripe status
   */
  async syncUserSubscription(email: string): Promise<boolean> {
    try {
      const db = DatabaseService.getInstance();
      const hasStripeSubscription = await this.checkStripeSubscription(email);
      
      // Get user from local database
      const user = await db.getUserByEmail(email);
      
      if (user && hasStripeSubscription && !user.isSubscribed) {
        console.log('🔄 Syncing subscription status - upgrading user to Pro');
        const updatedUser = db.updateUserSubscription(user.id, true);
        
        // Update current session if this is the current user
        const currentUser = db.getCurrentUser();
        if (currentUser && currentUser.email === email && updatedUser) {
          db.setCurrentUser(updatedUser);
        }
        
        return true;
      } else if (user && !hasStripeSubscription && user.isSubscribed) {
        console.log('🔄 Syncing subscription status - downgrading user to free');
        const updatedUser = db.updateUserSubscription(user.id, false);
        
        // Update current session if this is the current user
        const currentUser = db.getCurrentUser();
        if (currentUser && currentUser.email === email && updatedUser) {
          db.setCurrentUser(updatedUser);
        }
        
        return true;
      }
      
      console.log('ℹ️ User subscription status already in sync');
      return false;
      
    } catch (error) {
      console.error('❌ Error syncing user subscription:', error);
      return false;
    }
  }

  /**
   * Auto-sync subscription status on app startup
   * This helps catch cases where subscription was purchased but not recognized
   */
  async autoSyncOnStartup(): Promise<void> {
    try {
      const db = DatabaseService.getInstance();
      const currentUser = db.getCurrentUser();
      
      if (currentUser && currentUser.email) {
        console.log('🚀 Auto-syncing subscription status on startup...');
        
        const synced = await this.syncUserSubscription(currentUser.email);
        if (synced) {
          console.log('✅ Subscription status auto-synced successfully');
          
          // Optionally reload the page to reflect changes
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          console.log('ℹ️ No subscription sync needed');
        }
      }
    } catch (error) {
      console.error('❌ Error during auto-sync:', error);
    }
  }

  /**
   * Manual sync subscription - for user-initiated checks
   */
  async manualSync(): Promise<{ success: boolean; message: string }> {
    try {
      const db = DatabaseService.getInstance();
      const currentUser = db.getCurrentUser();
      
      if (!currentUser) {
        return {
          success: false,
          message: 'Please log in to sync your subscription status'
        };
      }
      
      console.log('🔄 Manual subscription sync requested...');
      const synced = await this.syncUserSubscription(currentUser.email);
      
      if (synced) {
        return {
          success: true,
          message: 'Subscription status updated successfully! Please refresh the page to see changes.'
        };
      } else {
        return {
          success: true,
          message: 'Your subscription status is already up to date.'
        };
      }
      
    } catch (error) {
      console.error('❌ Manual sync error:', error);
      return {
        success: false,
        message: 'Failed to sync subscription status. Please try again or contact support.'
      };
    }
  }

  /**
   * Get subscription debug info
   */
  getDebugInfo(): any {
    const db = DatabaseService.getInstance();
    const currentUser = db.getCurrentUser();
    const stripeCustomerId = localStorage.getItem('stripe_customer_id');
    const stripeSubscriptionId = localStorage.getItem('stripe_subscription_id');
    
    return {
      currentUser: currentUser ? {
        email: currentUser.email,
        isSubscribed: currentUser.isSubscribed,
        name: currentUser.name,
        id: currentUser.id
      } : null,
      stripeInfo: {
        customerId: stripeCustomerId,
        subscriptionId: stripeSubscriptionId
      },
      timestamp: new Date().toISOString()
    };
  }
}

export default SubscriptionSyncService;
