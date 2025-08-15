import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient, User, Session } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  emailVerified: boolean
  provider?: string
  createdAt: string
}

export interface SignUpData {
  email: string
  password: string
  name: string
}

export interface SignInData {
  email: string
  password: string
}

class SupabaseAuthService {
  private static instance: SupabaseAuthService
  private supabase: SupabaseClient | null = null
  private initialized = false

  private constructor() {
    this.initialize()
  }

  static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService()
    }
    return SupabaseAuthService.instance
  }

  private initialize() {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
      return
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey)
      this.initialized = true
      console.log('Supabase Auth initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Supabase:', error)
    }
  }

  isConfigured(): boolean {
    return this.initialized && this.supabase !== null
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!this.supabase) {
      return { user: null, error: 'Supabase not configured' }
    }

    try {
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          }
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (authData.user) {
        const user: AuthUser = {
          id: authData.user.id,
          email: authData.user.email!,
          name: data.name,
          avatar: authData.user.user_metadata?.avatar_url,
          emailVerified: authData.user.email_confirmed_at !== null,
          provider: 'email',
          createdAt: authData.user.created_at
        }
        return { user, error: null }
      }

      return { user: null, error: 'Failed to create user' }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: error instanceof Error ? error.message : 'Sign up failed' }
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!this.supabase) {
      return { user: null, error: 'Supabase not configured' }
    }

    try {
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (authData.user) {
        const user: AuthUser = {
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.name || authData.user.email!.split('@')[0],
          avatar: authData.user.user_metadata?.avatar_url,
          emailVerified: authData.user.email_confirmed_at !== null,
          provider: 'email',
          createdAt: authData.user.created_at
        }
        return { user, error: null }
      }

      return { user: null, error: 'Failed to sign in' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: error instanceof Error ? error.message : 'Sign in failed' }
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!this.supabase) {
      return { user: null, error: 'Supabase not configured' }
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      // Note: OAuth signin redirects, so user data will be available after redirect
      return { user: null, error: null }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { user: null, error: error instanceof Error ? error.message : 'Google sign in failed' }
    }
  }

  /**
   * Sign in with Apple OAuth
   */
  async signInWithApple(): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!this.supabase) {
      return { user: null, error: 'Supabase not configured' }
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('Apple sign in error:', error)
      return { user: null, error: error instanceof Error ? error.message : 'Apple sign in failed' }
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: string | null }> {
    if (!this.supabase) {
      return { error: 'Supabase not configured' }
    }

    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        return { error: error.message }
      }
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error instanceof Error ? error.message : 'Sign out failed' }
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!this.supabase) {
      return { user: null, error: 'Supabase not configured' }
    }

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()

      if (error) {
        return { user: null, error: error.message }
      }

      if (user) {
        const authUser: AuthUser = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email!.split('@')[0],
          avatar: user.user_metadata?.avatar_url,
          emailVerified: user.email_confirmed_at !== null,
          provider: user.app_metadata?.provider || 'email',
          createdAt: user.created_at
        }
        return { user: authUser, error: null }
      }

      return { user: null, error: null }
    } catch (error) {
      console.error('Get user error:', error)
      return { user: null, error: error instanceof Error ? error.message : 'Failed to get user' }
    }
  }

  /**
   * Resend email verification
   */
  async resendVerification(email: string): Promise<{ error: string | null }> {
    if (!this.supabase) {
      return { error: 'Supabase not configured' }
    }

    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Resend verification error:', error)
      return { error: error instanceof Error ? error.message : 'Failed to resend verification' }
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    if (!this.supabase) {
      return { error: 'Supabase not configured' }
    }

    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: error instanceof Error ? error.message : 'Failed to reset password' }
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    if (!this.supabase) {
      return { error: 'Supabase not configured' }
    }

    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Update password error:', error)
      return { error: error instanceof Error ? error.message : 'Failed to update password' }
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!this.supabase) {
      console.warn('Cannot listen to auth changes: Supabase not configured')
      return { data: { subscription: null } }
    }

    return this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
          avatar: session.user.user_metadata?.avatar_url,
          emailVerified: session.user.email_confirmed_at !== null,
          provider: session.user.app_metadata?.provider || 'email',
          createdAt: session.user.created_at
        }
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}

export default SupabaseAuthService
