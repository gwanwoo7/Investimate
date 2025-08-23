-- ====================================
-- SECURE MEMBERSHIP DATABASE SCHEMA
-- For Investimate SaaS Application
-- ====================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================
-- 1. USERS TABLE (Enhanced)
-- ====================================
CREATE TABLE public.users (
  -- Primary identifiers
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Subscription management
  subscription_status TEXT CHECK (subscription_status IN ('free', 'pro', 'canceled', 'expired', 'trial')) DEFAULT 'free',
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  
  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  
  -- Trial management
  trial_starts_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  trial_used BOOLEAN DEFAULT FALSE,
  
  -- Subscription periods
  subscription_starts_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  
  -- Billing
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
  last_payment_at TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  
  -- Usage tracking
  monthly_searches_used INTEGER DEFAULT 0,
  monthly_analyses_used INTEGER DEFAULT 0,
  last_usage_reset TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()),
  
  -- Metadata
  onboarding_completed BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMPTZ,
  privacy_accepted_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 2. SUBSCRIPTIONS TABLE
-- ====================================
CREATE TABLE public.subscriptions (
  -- Stripe subscription ID as primary key
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Subscription details
  status TEXT NOT NULL, -- active, canceled, incomplete, past_due, trialing
  plan_id TEXT NOT NULL, -- price_xxx from Stripe
  plan_name TEXT NOT NULL, -- 'Pro Monthly', 'Pro Yearly'
  
  -- Pricing
  unit_amount INTEGER, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  
  -- Periods
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Metadata from Stripe
  stripe_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 3. USER USAGE TRACKING
-- ====================================
CREATE TABLE public.user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Feature tracking
  feature_name TEXT NOT NULL, -- 'property_search', 'cash_flow_analysis', 'market_reports'
  usage_count INTEGER DEFAULT 0,
  
  -- Time periods
  period_start TIMESTAMPTZ NOT NULL DEFAULT DATE_TRUNC('month', NOW()),
  period_end TIMESTAMPTZ NOT NULL DEFAULT (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
  
  -- Metadata
  last_used TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB, -- Store additional context
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user/feature/period
  UNIQUE(user_id, feature_name, period_start)
);

-- ====================================
-- 4. FEATURE LIMITS
-- ====================================
CREATE TABLE public.feature_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Tier and feature
  subscription_tier TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  
  -- Limits (-1 = unlimited)
  monthly_limit INTEGER NOT NULL DEFAULT -1,
  daily_limit INTEGER DEFAULT -1,
  
  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per tier/feature
  UNIQUE(subscription_tier, feature_name)
);

-- ====================================
-- 5. PAYMENT HISTORY
-- ====================================
CREATE TABLE public.payments (
  id TEXT PRIMARY KEY, -- Stripe payment intent ID
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id TEXT REFERENCES public.subscriptions(id),
  
  -- Payment details
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- succeeded, failed, pending, canceled
  
  -- Stripe data
  stripe_invoice_id TEXT,
  stripe_charge_id TEXT,
  payment_method_id TEXT,
  
  -- Billing
  billing_reason TEXT, -- subscription_create, subscription_cycle, manual
  
  -- Metadata
  stripe_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ====================================
-- 6. AUDIT LOGS
-- ====================================
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Action details
  action TEXT NOT NULL, -- 'subscription_created', 'feature_accessed', 'payment_processed'
  resource_type TEXT, -- 'subscription', 'payment', 'feature'
  resource_id TEXT,
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  
  -- Result
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ====================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Subscriptions table policies  
CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- User usage policies
CREATE POLICY "Users can view their own usage" ON public.user_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage usage" ON public.user_usage
  FOR ALL USING (auth.role() = 'service_role');

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage payments" ON public.payments
  FOR ALL USING (auth.role() = 'service_role');

-- Audit logs policies (read-only for users)
CREATE POLICY "Users can view their own audit logs" ON public.audit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage audit logs" ON public.audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- ====================================
-- 8. FUNCTIONS AND TRIGGERS
-- ====================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER subscriptions_updated_at 
  BEFORE UPDATE ON public.subscriptions 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_usage_updated_at 
  BEFORE UPDATE ON public.user_usage 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to check feature access
CREATE OR REPLACE FUNCTION public.can_access_feature(
  p_user_id UUID,
  p_feature_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  feature_limit INTEGER;
  current_usage INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM public.users 
  WHERE id = p_user_id;
  
  -- Get feature limit for this tier
  SELECT monthly_limit INTO feature_limit
  FROM public.feature_limits
  WHERE subscription_tier = user_tier 
    AND feature_name = p_feature_name
    AND is_active = TRUE;
  
  -- If no limit found or unlimited (-1), allow access
  IF feature_limit IS NULL OR feature_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Get current month usage
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM public.user_usage
  WHERE user_id = p_user_id 
    AND feature_name = p_feature_name
    AND period_start = DATE_TRUNC('month', NOW());
  
  -- Check if under limit
  RETURN current_usage < feature_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment feature usage
CREATE OR REPLACE FUNCTION public.increment_feature_usage(
  p_user_id UUID,
  p_feature_name TEXT,
  p_metadata JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  current_period_start TIMESTAMPTZ;
  current_period_end TIMESTAMPTZ;
BEGIN
  current_period_start := DATE_TRUNC('month', NOW());
  current_period_end := current_period_start + INTERVAL '1 month';
  
  -- Insert or update usage record
  INSERT INTO public.user_usage (
    user_id, 
    feature_name, 
    usage_count, 
    period_start, 
    period_end, 
    last_used,
    metadata
  ) VALUES (
    p_user_id, 
    p_feature_name, 
    1, 
    current_period_start, 
    current_period_end, 
    NOW(),
    p_metadata
  )
  ON CONFLICT (user_id, feature_name, period_start)
  DO UPDATE SET 
    usage_count = user_usage.usage_count + 1,
    last_used = NOW(),
    metadata = CASE 
      WHEN p_metadata IS NOT NULL THEN p_metadata 
      ELSE user_usage.metadata 
    END;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================
-- 9. INITIAL FEATURE LIMITS DATA
-- ====================================
INSERT INTO public.feature_limits (subscription_tier, feature_name, monthly_limit, description) VALUES
-- Free tier limits
('free', 'property_search', 5, 'Property search queries per month'),
('free', 'cash_flow_analysis', 3, 'Cash flow analysis reports per month'),
('free', 'community_posts', 2, 'Community posts per month'),
('free', 'saved_properties', 10, 'Maximum saved properties'),

-- Pro tier limits (unlimited = -1)
('pro', 'property_search', -1, 'Unlimited property searches'),
('pro', 'cash_flow_analysis', -1, 'Unlimited cash flow analysis'),
('pro', 'community_posts', -1, 'Unlimited community posts'),
('pro', 'saved_properties', -1, 'Unlimited saved properties'),
('pro', 'market_reports', 10, 'Market reports per month'),
('pro', 'export_reports', -1, 'Unlimited report exports'),

-- Trial tier (same as pro)
('trial', 'property_search', -1, 'Unlimited during trial'),
('trial', 'cash_flow_analysis', -1, 'Unlimited during trial'),
('trial', 'community_posts', -1, 'Unlimited during trial'),
('trial', 'saved_properties', -1, 'Unlimited during trial'),
('trial', 'market_reports', 10, 'Market reports during trial'),
('trial', 'export_reports', -1, 'Unlimited report exports during trial');

-- ====================================
-- 10. INDEXES FOR PERFORMANCE
-- ====================================
CREATE INDEX idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_user_usage_user_feature ON public.user_usage(user_id, feature_name);
CREATE INDEX idx_user_usage_period ON public.user_usage(period_start, period_end);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_audit_logs_user_action ON public.audit_logs(user_id, action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ====================================
-- SETUP COMPLETE
-- ====================================
COMMENT ON TABLE public.users IS 'User profiles with subscription and trial management';
COMMENT ON TABLE public.subscriptions IS 'Stripe subscription data synchronized via webhooks';
COMMENT ON TABLE public.user_usage IS 'Feature usage tracking for all users';
COMMENT ON TABLE public.feature_limits IS 'Feature limits by subscription tier';
COMMENT ON TABLE public.payments IS 'Payment history from Stripe';
COMMENT ON TABLE public.audit_logs IS 'Audit trail for security and debugging';
