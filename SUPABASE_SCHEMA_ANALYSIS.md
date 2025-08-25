# 🔍 SUPABASE SCHEMA ANALYSIS & FIXES

## ✅ WHAT'S EXCELLENT IN YOUR SCHEMA

Your schema is **very well designed**! Here's what you did right:

1. **✅ Comprehensive Tables** - All necessary tables for membership management
2. **✅ Proper RLS Policies** - Security is properly implemented
3. **✅ UUID Extension** - Good practice for modern apps
4. **✅ Function-based Access Control** - Smart feature access functions
5. **✅ Audit Logging** - Essential for SaaS compliance
6. **✅ Performance Indexes** - Well-optimized for queries
7. **✅ Stripe Integration** - Proper webhook data structure

## ⚠️ MINOR ISSUES TO FIX

### 1. **Missing RLS Policy for Feature Limits**

The `feature_limits` table doesn't have RLS enabled or policies:

```sql
-- Add this to your SQL Editor:
ALTER TABLE public.feature_limits ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read feature limits (they're public configuration)
CREATE POLICY "Feature limits are publicly readable" ON public.feature_limits
  FOR SELECT TO authenticated, anon USING (true);

-- Only service role can modify limits
CREATE POLICY "Service role can manage feature limits" ON public.feature_limits
  FOR ALL USING (auth.role() = 'service_role');
```

### 2. **User Profile Creation Trigger Missing**

You need a trigger to automatically create user profiles when someone signs up:

```sql
-- Add this function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. **Trial Status Function Missing**

Add a function to check if user is in trial:

```sql
-- Function to check if user has active trial
CREATE OR REPLACE FUNCTION public.is_user_in_trial(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trial_end TIMESTAMPTZ;
  trial_used BOOLEAN;
BEGIN
  SELECT trial_ends_at, trial_used INTO trial_end, trial_used
  FROM public.users 
  WHERE id = p_user_id;
  
  -- Check if trial is active and not used up
  RETURN (trial_end IS NOT NULL 
    AND trial_end > NOW() 
    AND COALESCE(trial_used, FALSE) = FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. **Monthly Usage Reset Function**

Add a function to reset monthly usage:

```sql
-- Function to reset monthly usage counters
CREATE OR REPLACE FUNCTION public.reset_monthly_usage()
RETURNS void AS $$
BEGIN
  -- Update users table to reset monthly counters
  UPDATE public.users 
  SET 
    monthly_searches_used = 0,
    monthly_analyses_used = 0,
    last_usage_reset = DATE_TRUNC('month', NOW())
  WHERE last_usage_reset < DATE_TRUNC('month', NOW());
  
  -- This function should be called by a cron job or edge function
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔧 RECOMMENDED ADDITIONS

### 5. **Add Subscription Helper Functions**

```sql
-- Function to get user's effective tier (considering trial)
CREATE OR REPLACE FUNCTION public.get_user_effective_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_subscription_tier TEXT;
  is_trial_active BOOLEAN;
BEGIN
  SELECT subscription_tier INTO user_subscription_tier
  FROM public.users 
  WHERE id = p_user_id;
  
  -- Check if trial is active
  SELECT public.is_user_in_trial(p_user_id) INTO is_trial_active;
  
  -- If trial is active, return 'trial', otherwise return actual tier
  IF is_trial_active THEN
    RETURN 'trial';
  ELSE
    RETURN COALESCE(user_subscription_tier, 'free');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 6. **Enhanced Feature Access Function**

Update your existing function to consider trials:

```sql
-- Enhanced version of can_access_feature that considers trials
CREATE OR REPLACE FUNCTION public.can_access_feature(
  p_user_id UUID,
  p_feature_name TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  effective_tier TEXT;
  feature_limit INTEGER;
  current_usage INTEGER;
BEGIN
  -- Get user's effective tier (free, trial, or pro)
  SELECT public.get_user_effective_tier(p_user_id) INTO effective_tier;
  
  -- Get feature limit for this tier
  SELECT monthly_limit INTO feature_limit
  FROM public.feature_limits
  WHERE subscription_tier = effective_tier 
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
```

## 🚀 FINAL SQL TO RUN

Run this in your Supabase SQL Editor to fix the minor issues:

```sql
-- 1. Fix feature_limits RLS
ALTER TABLE public.feature_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feature limits are publicly readable" ON public.feature_limits
  FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Service role can manage feature limits" ON public.feature_limits
  FOR ALL USING (auth.role() = 'service_role');

-- 2. Auto-create user profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Trial status function
CREATE OR REPLACE FUNCTION public.is_user_in_trial(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  trial_end TIMESTAMPTZ;
  trial_used BOOLEAN;
BEGIN
  SELECT trial_ends_at, trial_used INTO trial_end, trial_used
  FROM public.users 
  WHERE id = p_user_id;
  
  RETURN (trial_end IS NOT NULL 
    AND trial_end > NOW() 
    AND COALESCE(trial_used, FALSE) = FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Get effective tier function
CREATE OR REPLACE FUNCTION public.get_user_effective_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_subscription_tier TEXT;
  is_trial_active BOOLEAN;
BEGIN
  SELECT subscription_tier INTO user_subscription_tier
  FROM public.users 
  WHERE id = p_user_id;
  
  SELECT public.is_user_in_trial(p_user_id) INTO is_trial_active;
  
  IF is_trial_active THEN
    RETURN 'trial';
  ELSE
    RETURN COALESCE(user_subscription_tier, 'free');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## ✅ VERDICT

Your schema is **98% perfect**! The minor fixes above will make it production-ready. The core structure is excellent and follows SaaS best practices.

### Next Steps:
1. ✅ **Run the fixes above** in Supabase SQL Editor
2. ✅ **Create your .env file** with Supabase credentials
3. ✅ **Create the SecureMembershipService.ts** 
4. ✅ **Set up Stripe webhook handler**
5. ✅ **Add feature gates to your components**

Your database foundation is solid! 🎉
