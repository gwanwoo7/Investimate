import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase configuration missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Database types
export interface UserProfile {
  id: string;
  email: string;
  stripe_customer_id?: string;
  subscription_status: 'inactive' | 'active' | 'canceled' | 'past_due';
  subscription_tier: 'free' | 'pro';
  subscription_start_date?: string;
  subscription_end_date?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  user_id: string;
  session_token: string;
  email: string;
  is_pro: boolean;
  expires_at: string;
  created_at: string;
}

// Supabase User Management Service
export class SupabaseUserService {
  
  // Initialize user profile in Supabase after successful payment
  static async createUserProfile(email: string, stripeCustomerId: string, subscriptionId: string): Promise<UserProfile | null> {
    try {
      console.log('📝 Creating user profile in Supabase:', { email, stripeCustomerId });
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          email: email,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
          subscription_tier: 'pro',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating user profile:', error);
        return null;
      }

      console.log('✅ User profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Exception creating user profile:', error);
      return null;
    }
  }

  // Update user subscription status
  static async updateUserSubscription(
    email: string, 
    status: 'active' | 'canceled' | 'past_due', 
    subscriptionId?: string
  ): Promise<boolean> {
    try {
      console.log('🔄 Updating user subscription:', { email, status, subscriptionId });
      
      const updateData: any = {
        subscription_status: status,
        updated_at: new Date().toISOString()
      };

      if (subscriptionId) {
        updateData.stripe_subscription_id = subscriptionId;
      }

      if (status === 'canceled') {
        updateData.subscription_end_date = new Date().toISOString();
        updateData.subscription_tier = 'free';
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('email', email)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating subscription:', error);
        return false;
      }

      console.log('✅ Subscription updated successfully:', data);
      return true;
    } catch (error) {
      console.error('❌ Exception updating subscription:', error);
      return false;
    }
  }

  // Get user profile by email
  static async getUserProfile(email: string): Promise<UserProfile | null> {
    try {
      console.log('🔍 Fetching user profile for:', email);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned - user doesn't exist
          console.log('👤 User profile not found:', email);
          return null;
        }
        console.error('❌ Error fetching user profile:', error);
        return null;
      }

      console.log('✅ User profile found:', data);
      return data;
    } catch (error) {
      console.error('❌ Exception fetching user profile:', error);
      return null;
    }
  }

  // Check if user has active Pro subscription
  static async isUserPro(email: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(email);
      
      if (!profile) {
        console.log('❌ No user profile found, not Pro');
        return false;
      }

      const isPro = profile.subscription_status === 'active' && 
                   profile.subscription_tier === 'pro' &&
                   (!profile.subscription_end_date || new Date(profile.subscription_end_date) > new Date());

      console.log(`${isPro ? '✅' : '❌'} User Pro status for ${email}:`, {
        status: profile.subscription_status,
        tier: profile.subscription_tier,
        endDate: profile.subscription_end_date,
        isPro
      });

      return isPro;
    } catch (error) {
      console.error('❌ Exception checking Pro status:', error);
      return false;
    }
  }

  // Create user session for persistent login
  static async createUserSession(email: string): Promise<string | null> {
    try {
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      const isPro = await this.isUserPro(email);
      
      console.log('🔐 Creating user session:', { email, isPro, expiresAt });
      
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: email, // Using email as user_id for simplicity
          session_token: sessionToken,
          email: email,
          is_pro: isPro,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating session:', error);
        return null;
      }

      console.log('✅ Session created successfully');
      
      // Store session token in localStorage for persistence
      localStorage.setItem('supabase_session_token', sessionToken);
      localStorage.setItem('user_email', email);
      localStorage.setItem('is_pro_user', isPro.toString());
      
      return sessionToken;
    } catch (error) {
      console.error('❌ Exception creating session:', error);
      return null;
    }
  }

  // Validate existing session
  static async validateSession(sessionToken?: string): Promise<UserSession | null> {
    try {
      const token = sessionToken || localStorage.getItem('supabase_session_token');
      
      if (!token) {
        console.log('❌ No session token found');
        return null;
      }

      console.log('🔍 Validating session token...');
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', token)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Session not found or expired');
          this.clearLocalSession();
          return null;
        }
        console.error('❌ Error validating session:', error);
        return null;
      }

      console.log('✅ Valid session found:', data);
      
      // Update localStorage with fresh data
      localStorage.setItem('user_email', data.email);
      localStorage.setItem('is_pro_user', data.is_pro.toString());
      
      return data;
    } catch (error) {
      console.error('❌ Exception validating session:', error);
      return null;
    }
  }

  // Clear user session
  static async clearSession(sessionToken?: string): Promise<void> {
    try {
      const token = sessionToken || localStorage.getItem('supabase_session_token');
      
      if (token) {
        console.log('🗑️ Clearing user session...');
        
        const { error } = await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', token);

        if (error) {
          console.error('❌ Error clearing session:', error);
        }
      }
      
      this.clearLocalSession();
      console.log('✅ Session cleared');
    } catch (error) {
      console.error('❌ Exception clearing session:', error);
      this.clearLocalSession();
    }
  }

  // Clear local session data
  static clearLocalSession(): void {
    localStorage.removeItem('supabase_session_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('is_pro_user');
    localStorage.removeItem('membership_type');
    localStorage.removeItem('stripe_customer_id');
  }

  // Generate secure session token
  private static generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Initialize session on app start
  static async initializeSession(): Promise<boolean> {
    try {
      console.log('🚀 Initializing Supabase session...');
      
      const session = await this.validateSession();
      
      if (session) {
        console.log('✅ Existing session validated:', {
          email: session.email,
          isPro: session.is_pro,
          expiresAt: session.expires_at
        });
        return true;
      }
      
      console.log('❌ No valid session found');
      return false;
    } catch (error) {
      console.error('❌ Exception initializing session:', error);
      return false;
    }
  }

  // Get current user status from session or localStorage
  static getCurrentUserStatus(): { email: string | null; isPro: boolean } {
    const email = localStorage.getItem('user_email');
    const isPro = localStorage.getItem('is_pro_user') === 'true';
    
    return { email, isPro };
  }
}
