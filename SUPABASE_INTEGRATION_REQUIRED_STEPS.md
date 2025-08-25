# 🔧 REQUIRED STEPS: SUPABASE MEMBER & USER MANAGEMENT CONNECTION

## ❌ CURRENT STATUS - WHAT'S MISSING

Your app has basic Supabase services but is **NOT fully connected** for member management. Here are the required steps:

## 📋 STEP 1: COMPLETE DATABASE SCHEMA

You need to create the proper database tables in Supabase:

### 1.1 Create Database Schema

```sql
-- Run this in your Supabase SQL Editor

-- 1. Enhanced Users Table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'trial', 'pro')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id TEXT UNIQUE,
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subscriptions Table (Stripe sync)
CREATE TABLE public.subscriptions (
  id TEXT PRIMARY KEY, -- Stripe subscription ID
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL, -- Stripe customer ID
  status TEXT NOT NULL,
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Feature Limits Table
CREATE TABLE public.feature_limits (
  id SERIAL PRIMARY KEY,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'trial', 'pro')),
  feature_name TEXT NOT NULL,
  limit_value INTEGER NOT NULL DEFAULT -1, -- -1 means unlimited
  reset_period TEXT DEFAULT 'monthly' CHECK (reset_period IN ('daily', 'weekly', 'monthly', 'yearly', 'never')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Usage Tracking
CREATE TABLE public.user_usage (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_reset_date TIMESTAMPTZ DEFAULT NOW(),
  period_start TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Audit Logs
CREATE TABLE public.audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_stripe_customer ON public.users(stripe_customer_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_user_usage_user_feature ON public.user_usage(user_id, feature_name);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_subscriptions BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_user_usage BEFORE UPDATE ON public.user_usage FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
```

### 1.2 Setup Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON public.user_usage FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Service can insert usage" ON public.user_usage FOR INSERT WITH CHECK (true);
CREATE POLICY "Service can update usage" ON public.user_usage FOR UPDATE USING (true);

-- Audit logs (read-only for users)
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (user_id = auth.uid());
```

### 1.3 Insert Default Feature Limits

```sql
-- Insert default feature limits
INSERT INTO public.feature_limits (tier, feature_name, limit_value, reset_period) VALUES
-- Free tier limits
('free', 'property_search', 5, 'monthly'),
('free', 'cash_flow_analysis', 3, 'monthly'),
('free', 'saved_properties', 10, 'never'),
('free', 'property_comparison', 2, 'monthly'),
('free', 'market_analysis', 1, 'monthly'),

-- Trial tier (14 days unlimited)
('trial', 'property_search', -1, 'never'),
('trial', 'cash_flow_analysis', -1, 'never'),
('trial', 'saved_properties', -1, 'never'),
('trial', 'property_comparison', -1, 'never'),
('trial', 'market_analysis', -1, 'never'),
('trial', 'community_posts', -1, 'never'),
('trial', 'advanced_filters', -1, 'never'),

-- Pro tier (unlimited)
('pro', 'property_search', -1, 'never'),
('pro', 'cash_flow_analysis', -1, 'never'),
('pro', 'saved_properties', -1, 'never'),
('pro', 'property_comparison', -1, 'never'),
('pro', 'market_analysis', -1, 'never'),
('pro', 'community_posts', -1, 'never'),
('pro', 'advanced_filters', -1, 'never'),
('pro', 'export_reports', -1, 'never'),
('pro', 'api_access', -1, 'never');
```

## 📋 STEP 2: CREATE SECURE MEMBERSHIP SERVICE

You need a unified service that handles all membership logic:

```bash
# Create this file: src/services/SecureMembershipService.ts
```

## 📋 STEP 3: ENVIRONMENT CONFIGURATION

Create a `.env` file with your Supabase credentials:

```bash
# Copy .env.example to .env and add:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Also needed for webhooks:
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 STEP 4: STRIPE WEBHOOK SETUP

Create Netlify function for Stripe webhooks:

```bash
# Create: netlify/functions/stripe-webhook.js
```

## 📋 STEP 5: AUTH INTEGRATION

Update your app to use proper Supabase Auth with membership:

```bash
# Modify your main App.tsx to integrate membership
```

## 📋 STEP 6: FEATURE GATES

Add feature gates throughout your app:

```bash
# Add membership checks before any premium features
```

## ⚠️ CRITICAL MISSING COMPONENTS

1. **No Database Schema** - Tables don't exist in Supabase
2. **No Row Level Security** - Data isn't properly secured
3. **No Feature Limits** - No usage tracking or restrictions
4. **No Stripe Integration** - No payment processing connection
5. **No Webhook Handler** - No real-time subscription updates
6. **No Unified Service** - Multiple scattered auth services
7. **No Feature Gates** - All features are currently free/unlimited

## 🚀 QUICK START COMMANDS

1. **Setup Database:**
```bash
# Go to your Supabase dashboard → SQL Editor → Run the schema above
```

2. **Configure Environment:**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. **Install Dependencies:**
```bash
npm install @stripe/stripe-js stripe
```

4. **Create Services:**
```bash
# I can help you create the SecureMembershipService.ts
```

## ✅ WHAT YOU HAVE VS WHAT YOU NEED

**✅ What You Have:**
- Basic Supabase client setup
- Basic auth service
- User profile service (incomplete)

**❌ What You're Missing:**
- Complete database schema
- Row Level Security policies
- Feature usage tracking
- Stripe payment integration
- Webhook handling for real-time updates
- Unified membership service
- Feature gates in your app
- Trial system implementation

## 🎯 NEXT IMMEDIATE STEPS

1. **Run the SQL schema** in your Supabase dashboard
2. **Create your .env** file with Supabase credentials  
3. **Let me create the SecureMembershipService** for you
4. **Setup Stripe webhook** for payment processing
5. **Add feature gates** to your property search components

Would you like me to help you implement any of these missing pieces?
