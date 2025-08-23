# Secure Membership Management Architecture

## 🏆 **Recommended Solution: Stripe + Supabase**

### Why This Stack?
- **Stripe**: Industry-leading payment processing and subscription management
- **Supabase**: Secure PostgreSQL database with built-in auth and real-time features
- **Row Level Security (RLS)**: Database-level access controls
- **Webhooks**: Real-time subscription status updates

---

## 🔐 **Security Architecture**

### 1. Authentication Flow
```
User → Supabase Auth → JWT Token → Protected Routes
```

### 2. Subscription Flow  
```
User → Stripe Checkout → Webhook → Supabase → Update User Role
```

### 3. Feature Access Control
```
Frontend Request → JWT Verification → Database Query → RLS Policy Check → Response
```

---

## 💾 **Database Schema (Supabase)**

### Users Table
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT CHECK (subscription_status IN ('free', 'pro', 'canceled', 'expired')) DEFAULT 'free',
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY, -- Stripe subscription ID
  user_id UUID REFERENCES users(id) NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  plan_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Usage Tracking Table
```sql
CREATE TABLE user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  feature_name TEXT NOT NULL, -- 'property_search', 'cash_flow_analysis'
  usage_count INTEGER DEFAULT 0,
  last_reset TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🛡️ **Row Level Security (RLS) Policies**

### Users Table Policies
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Subscriptions Table Policies
```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());

-- Only service role can insert/update subscriptions (via webhooks)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');
```

---

## 🎫 **Free Trial Implementation**

### Trial Logic
```typescript
export const checkTrialStatus = (user: User): TrialStatus => {
  if (!user.trial_ends_at) {
    return { hasTrialAccess: false, daysLeft: 0 };
  }
  
  const now = new Date();
  const trialEnd = new Date(user.trial_ends_at);
  const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  
  return {
    hasTrialAccess: now <= trialEnd,
    daysLeft
  };
};
```

### Feature Access Control
```typescript
export const canAccessFeature = (user: User, feature: string): boolean => {
  // Pro subscribers get everything
  if (user.subscription_status === 'pro') return true;
  
  // Check trial access
  const trial = checkTrialStatus(user);
  if (trial.hasTrialAccess) return true;
  
  // Free tier limits
  const freeLimits: Record<string, number> = {
    'property_search': 5,
    'cash_flow_analysis': 3
  };
  
  return (user.usage[feature] || 0) < freeLimits[feature];
};
```

---

## 🔄 **Stripe Webhook Integration**

### Webhook Handler (Supabase Edge Function)
```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
});

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );
    
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await updateUserSubscription(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await cancelUserSubscription(subscription);
        break;
      }
    }
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    return new Response('Webhook error', { status: 400 });
  }
});
```

---

## 🎯 **Feature Gating Examples**

### React Hook for Feature Access
```typescript
export const useFeatureAccess = (feature: string) => {
  const { user } = useAuth();
  const [canAccess, setCanAccess] = useState(false);
  const [usage, setUsage] = useState(0);
  const [limit, setLimit] = useState(0);
  
  useEffect(() => {
    if (!user) return;
    
    const checkAccess = async () => {
      const hasAccess = canAccessFeature(user, feature);
      const currentUsage = await getCurrentUsage(user.id, feature);
      const featureLimit = getFeatureLimit(user.subscription_status, feature);
      
      setCanAccess(hasAccess);
      setUsage(currentUsage);
      setLimit(featureLimit);
    };
    
    checkAccess();
  }, [user, feature]);
  
  return { canAccess, usage, limit };
};
```

### Component Usage
```typescript
const PropertySearch = () => {
  const { canAccess, usage, limit } = useFeatureAccess('property_search');
  
  if (!canAccess) {
    return <UpgradePrompt feature="property_search" usage={usage} limit={limit} />;
  }
  
  return <PropertySearchComponent />;
};
```

---

## 📱 **Client-Side Implementation**

### Subscription Status Hook
```typescript
export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchSubscription = async () => {
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setSubscription(data);
    };
    
    fetchSubscription();
    
    // Real-time subscription updates
    const subscription = supabase
      .channel('subscriptions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${user.id}`
      }, fetchSubscription)
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, [user]);
  
  return subscription;
};
```

---

## 🔒 **Security Best Practices**

### 1. Never Trust the Frontend
```typescript
// ❌ BAD - Client-side only check
const canSearch = user?.subscription_status === 'pro';

// ✅ GOOD - Server-side verification
const searchProperties = async (query: string) => {
  const response = await fetch('/api/search', {
    headers: { Authorization: `Bearer ${jwt}` }
  });
  // Server verifies JWT and subscription status
};
```

### 2. Rate Limiting
```typescript
// Supabase Edge Function with rate limiting
const rateLimiter = new Map();

export const checkRateLimit = (userId: string, action: string): boolean => {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const limit = rateLimiter.get(key) || { count: 0, resetTime: now + 60000 };
  
  if (now > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = now + 60000;
  }
  
  if (limit.count >= getActionLimit(action)) {
    return false;
  }
  
  limit.count++;
  rateLimiter.set(key, limit);
  return true;
};
```

### 3. Audit Logging
```sql
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 💰 **Pricing Strategy**

### Recommended Tiers
```typescript
export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      property_search: 5,
      cash_flow_analysis: 3,
      community_posts: 2
    }
  },
  pro: {
    name: 'Pro',
    price: 4.99,
    limits: {
      property_search: -1, // Unlimited
      cash_flow_analysis: -1,
      community_posts: -1
    },
    features: ['Advanced analytics', 'Export reports', 'Priority support']
  },
  trial: {
    name: '14-Day Trial',
    duration: 14, // days
    access: 'pro' // Same as pro features
  }
};
```

---

## 🚀 **Implementation Steps**

### Phase 1: Foundation
1. ✅ Setup Supabase with proper schema
2. ✅ Implement Row Level Security policies
3. ✅ Create Stripe products and prices
4. ✅ Setup webhook endpoints

### Phase 2: Core Features
1. ✅ Build subscription management UI
2. ✅ Implement feature gating
3. ✅ Add usage tracking
4. ✅ Create billing portal

### Phase 3: Advanced Features
1. ✅ Add trial management
2. ✅ Implement analytics
3. ✅ Add admin dashboard
4. ✅ Setup monitoring and alerts

---

## 🏢 **Alternative Solutions**

### Enterprise Options
- **Auth0 + Stripe**: Enterprise-grade auth + payments
- **AWS Cognito + Stripe**: If using AWS ecosystem  
- **Firebase Auth + Stripe**: Google ecosystem
- **Custom JWT + Stripe**: Maximum control

### All-in-One Platforms
- **Supabase + Stripe** (Recommended for your use case)
- **Firebase + RevenueCat**: Good for mobile-first
- **PlanetScale + Clerk + Stripe**: Modern stack
- **Neon + NextAuth + Stripe**: Alternative serverless stack

---

**Recommendation**: Stick with **Supabase + Stripe** for Investimate. It's secure, scalable, and you're already using Supabase. The RLS policies provide database-level security that's very hard to bypass.
