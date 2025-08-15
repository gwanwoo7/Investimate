/**
 * OAuth Service for Google and Apple authentication
 */

interface OAuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'apple';
}

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  verified_email: boolean;
}

interface AppleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  id_token: string;
}

interface AppleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: {
    firstName: string;
    lastName: string;
  };
}

class OAuthService {
  private static instance: OAuthService;
  private googleClientId: string;
  private appleClientId: string;
  private appleRedirectUri: string;

  private constructor() {
    // These should be set in your environment variables
    this.googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    this.appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID || '';
    this.appleRedirectUri = import.meta.env.VITE_APPLE_REDIRECT_URI || `${window.location.origin}/auth/apple/callback`;
  }

  static getInstance(): OAuthService {
    if (!OAuthService.instance) {
      OAuthService.instance = new OAuthService();
    }
    return OAuthService.instance;
  }

  /**
   * Initialize Google OAuth SDK
   */
  private async initializeGoogleSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google && window.google.accounts) {
          resolve();
        } else {
          reject(new Error('Google SDK failed to load'));
        }
      };
      
      script.onerror = () => reject(new Error('Failed to load Google SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<OAuthUser> {
    if (!this.googleClientId) {
      throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
    }

    try {
      await this.initializeGoogleSDK();

      return new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: this.googleClientId,
          callback: async (response: any) => {
            try {
              const userInfo = await this.parseGoogleJWT(response.credential);
              const oauthUser: OAuthUser = {
                id: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
                avatar: userInfo.picture,
                provider: 'google'
              };
              resolve(oauthUser);
            } catch (error) {
              reject(error);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to popup if prompt is not displayed
            window.google.accounts.id.renderButton(
              document.createElement('div'),
              {
                theme: 'outline',
                size: 'large',
                width: '100%',
                click_listener: () => {
                  window.google.accounts.id.prompt();
                }
              }
            );
          }
        });
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw new Error('Google sign-in failed. Please try again.');
    }
  }

  /**
   * Parse Google JWT token
   */
  private async parseGoogleJWT(token: string): Promise<any> {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      throw new Error('Failed to parse Google token');
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<OAuthUser> {
    if (!this.appleClientId) {
      throw new Error('Apple Client ID not configured. Please set VITE_APPLE_CLIENT_ID in your environment variables.');
    }

    try {
      // Load Apple SDK if not already loaded
      if (!window.AppleID) {
        await this.loadAppleSDK();
      }

      return new Promise((resolve, reject) => {
        window.AppleID.auth.init({
          clientId: this.appleClientId,
          scope: 'name email',
          redirectURI: this.appleRedirectUri,
          state: 'apple-signin',
          usePopup: true
        });

        window.AppleID.auth.signIn().then((response: any) => {
          try {
            const userInfo = this.parseAppleResponse(response);
            const oauthUser: OAuthUser = {
              id: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name ? `${userInfo.name.firstName} ${userInfo.name.lastName}` : userInfo.email,
              provider: 'apple'
            };
            resolve(oauthUser);
          } catch (error) {
            reject(error);
          }
        }).catch((error: any) => {
          console.error('Apple sign-in error:', error);
          reject(new Error('Apple sign-in failed. Please try again.'));
        });
      });
    } catch (error) {
      console.error('Apple sign-in initialization error:', error);
      throw new Error('Apple sign-in failed. Please try again.');
    }
  }

  /**
   * Load Apple SDK
   */
  private async loadAppleSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.AppleID) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      
      script.onload = () => {
        if (window.AppleID) {
          resolve();
        } else {
          reject(new Error('Apple SDK failed to load'));
        }
      };
      
      script.onerror = () => reject(new Error('Failed to load Apple SDK'));
      document.head.appendChild(script);
    });
  }

  /**
   * Parse Apple response
   */
  private parseAppleResponse(response: any): AppleUserInfo {
    try {
      // Decode the ID token
      const idToken = response.authorization.id_token;
      const payload = idToken.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      return {
        sub: decoded.sub,
        email: decoded.email,
        email_verified: decoded.email_verified,
        name: response.user?.name
      };
    } catch (error) {
      throw new Error('Failed to parse Apple response');
    }
  }

  /**
   * Check if OAuth providers are configured
   */
  isGoogleConfigured(): boolean {
    return !!this.googleClientId;
  }

  isAppleConfigured(): boolean {
    return !!this.appleClientId;
  }
}

// Extend window interface for OAuth SDKs
declare global {
  interface Window {
    google: any;
    AppleID: any;
  }
}

export default OAuthService;
export type { OAuthUser };
