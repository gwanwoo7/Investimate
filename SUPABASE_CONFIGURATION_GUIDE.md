# 🚀 Supabase Configuration Guide for Investimate

This guide will help you set up Supabase authentication for your Investimate application.

## 📋 Prerequisites

1. Node.js and npm installed
2. A Supabase account (free tier available)
3. Basic understanding of environment variables

## 🏗️ Step 1: Create Supabase Project

1. **Sign up for Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub, Google, or email

2. **Create a new project**
   - Click "New Project"
   - Choose your organization
   - Enter project details:
     - Name: `investimate-auth`
     - Database Password: Generate a strong password (save it!)
     - Region: Choose closest to your users
   - Click "Create new project"

3. **Wait for setup** (usually 2-3 minutes)

## 🔑 Step 2: Get Your Project Credentials

1. **Navigate to Settings**
   - In your Supabase dashboard, click "Settings" (gear icon)
   - Go to "API" section

2. **Copy your credentials**
   ```
   Project URL: https://your-project-id.supabase.co
   Anon/Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Add to your environment files**

   Create/update `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   Update `.env.example`:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## 🔐 Step 3: Configure Authentication

1. **Go to Authentication Settings**
   - In Supabase dashboard, go to "Authentication"
   - Click "Settings" tab

2. **Configure Site URL**
   - Set Site URL to: `http://localhost:5173` (for development)
   - For production, use your actual domain: `https://your-domain.com`

3. **Add Redirect URLs**
   - Add these redirect URLs:
     ```
     http://localhost:5173/auth/callback
     https://your-domain.com/auth/callback
     ```

## 🌐 Step 4: Set Up OAuth Providers (Optional)

### Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```

4. **Configure in Supabase**
   - In Supabase, go to "Authentication" > "Providers"
   - Enable Google provider
   - Add your Google Client ID and Client Secret

### GitHub OAuth Setup

1. **Go to GitHub Settings**
   - Visit [https://github.com/settings/developers](https://github.com/settings/developers)
   - Click "New OAuth App"

2. **Configure OAuth App**
   - Application name: `Investimate`
   - Homepage URL: `https://your-domain.com`
   - Authorization callback URL: `https://your-project-id.supabase.co/auth/v1/callback`

3. **Configure in Supabase**
   - In Supabase, go to "Authentication" > "Providers"
   - Enable GitHub provider
   - Add your GitHub Client ID and Client Secret

## 📧 Step 5: Configure Email Settings

1. **Email Templates**
   - Go to "Authentication" > "Email Templates"
   - Customize your email templates:
     - Confirm signup
     - Magic link
     - Change email address
     - Reset password

2. **SMTP Settings (Optional)**
   - For production, configure custom SMTP
   - Go to "Settings" > "Auth"
   - Configure SMTP settings with your email provider

## 🗄️ Step 6: Set Up Database Tables (Optional)

Create additional tables for user profiles and subscriptions:

```sql
-- User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create a trigger to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 🌍 Step 7: Environment Variables for Production

For **Netlify** deployment:

1. **Go to Netlify Dashboard**
   - Open your site settings
   - Go to "Environment variables"

2. **Add these variables**:
   ```
   VITE_SUPABASE_URL = https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY = your_anon_key_here
   ```

For **Vercel** deployment:

1. **Go to Vercel Dashboard**
   - Open your project settings
   - Go to "Environment Variables"

2. **Add the same variables as above**

## 🧪 Step 8: Test Your Configuration

1. **Start your development server**
   ```bash
   npm run dev
   ```

2. **Test authentication flows**
   - Try signing up with email
   - Check email verification
   - Test OAuth providers (if configured)
   - Test password reset

3. **Check Supabase dashboard**
   - Go to "Authentication" > "Users"
   - Verify new users appear after signup

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Check if email verification is required
   - Verify environment variables are correct

2. **OAuth not working**
   - Check redirect URLs match exactly
   - Verify OAuth provider credentials

3. **CORS errors**
   - Check Site URL configuration
   - Verify redirect URLs include your domain

4. **Environment variables not working**
   - Restart development server after changes
   - Check variable names start with `VITE_`

### Debug Commands

```bash
# Check if environment variables are loaded
echo $VITE_SUPABASE_URL

# Test Supabase connection
npm run dev
# Open browser console and check for Supabase errors
```

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Integration Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-react)
- [OAuth Provider Setup](https://supabase.com/docs/guides/auth/social-login)

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Site URL and redirect URLs set
- [ ] Email verification working
- [ ] OAuth providers configured (optional)
- [ ] Database tables created (optional)
- [ ] Production environment variables set
- [ ] Authentication flows tested

## 🆘 Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Review Supabase dashboard logs
3. Verify all environment variables
4. Test with a clean browser session
5. Contact support at admin@investimate.com

Your Supabase authentication should now be fully configured! 🎉
