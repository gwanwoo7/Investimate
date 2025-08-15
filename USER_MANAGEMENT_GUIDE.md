# User Management & Security Guide

## 🔍 How to View Registered Users

### Current Demo Implementation

**Local Storage (Development/Demo):**
- User data is stored in browser localStorage
- You can view users through the Admin Dashboard component
- Access via developer tools: `localStorage.getItem('rental_cash_flow_users')`

**Admin Dashboard Access:**
```typescript
import AdminDashboard from './src/components/AdminDashboard';
// Add to your app for admin access
```

### With Supabase (Production)

**Supabase Dashboard:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Users**
4. View all registered users, their status, and metadata

**Admin API Access:**
```typescript
// Server-side admin access (requires service role key)
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Admin access
)

const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
```

## 🔒 Security & Encryption

### Current Demo Security

**Password Security:**
- Passwords are hashed using `crypto.subtle.digest()` with SHA-256
- Original passwords are never stored
- Salt is generated for each password

**OAuth Security:**
- OAuth tokens managed by Google/Apple
- No sensitive OAuth data stored locally
- Tokens expire automatically

**Limitations:**
- Local storage is client-side (not secure for production)
- No server-side validation
- Data not encrypted at rest

### Supabase Production Security

**Enterprise-Grade Encryption:**
- **Database**: PostgreSQL with TDE (Transparent Data Encryption)
- **At Rest**: AES-256 encryption for all stored data
- **In Transit**: TLS 1.3 for all connections
- **Backups**: Encrypted with separate keys

**Authentication Security:**
- **JWT Tokens**: RSA-256 signed with automatic rotation
- **Password Hashing**: bcrypt with configurable rounds
- **Email Verification**: Required before account access
- **Rate Limiting**: Built-in protection against brute force

**Database Security:**
- **Row Level Security (RLS)**: Users can only access their own data
- **SQL Injection Protection**: Parameterized queries
- **Audit Logging**: All access logged and monitored

## 📊 User Data Structure

### Current User Schema
```typescript
interface User {
  id: string;              // UUID
  email: string;           // Email address
  name: string;            // Display name
  avatar: string;          // Profile picture URL
  isSubscribed: boolean;   // Subscription status
  joinDate: string;        // Registration date
  hashedPassword?: string; // Hashed password (local only)
  oauthProvider?: string;  // OAuth provider (google/apple)
  oauthId?: string;        // OAuth user ID
}
```

### Supabase User Schema
```sql
-- auth.users table (managed by Supabase)
CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  encrypted_password VARCHAR, -- bcrypt hashed
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_metadata JSONB,      -- Custom fields (name, avatar)
  app_metadata JSONB        -- OAuth provider data
);

-- Custom profiles table (optional)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id),
  name VARCHAR,
  avatar_url VARCHAR,
  is_subscribed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 🛡️ Data Protection & Compliance

### GDPR/CCPA Compliance

**User Rights:**
- **Right to Access**: Users can export their data
- **Right to Delete**: Complete account deletion
- **Right to Portability**: Data export in standard formats
- **Right to Rectification**: Users can update their information

**Implementation:**
```typescript
// Delete user account and all data
const deleteUserAccount = async (userId: string) => {
  // Delete from auth.users (cascades to related tables)
  await supabase.auth.admin.deleteUser(userId)
  
  // Delete any custom data
  await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)
}
```

### Data Minimization
- Only collect necessary information
- No sensitive financial data stored
- OAuth reduces stored credentials
- Regular data cleanup policies

## 🔐 Access Control

### Current Demo System
```typescript
// Basic role checking
const isAdmin = (user: User) => {
  return user.email.includes('admin') || user.email.includes('demo')
}

// View users (demo only)
const viewUsers = () => {
  if (isAdmin(currentUser)) {
    return db.getAllUsers()
  }
  throw new Error('Unauthorized')
}
```

### Supabase Role-Based Access

**Row Level Security Policies:**
```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles  
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.jwt()->>'role' = 'admin'
  );
```

**Custom Claims:**
```typescript
// Set user role (server-side)
await supabaseAdmin.auth.admin.updateUserById(userId, {
  app_metadata: { role: 'admin' }
})
```

## 📱 Monitoring & Analytics

### User Metrics Available

**Authentication Metrics:**
- Total registered users
- Daily/Monthly active users
- OAuth vs email signup ratio
- Email verification rates
- Failed login attempts

**Security Metrics:**
- Password reset requests
- Suspicious login activity
- Geographic login patterns
- Device/browser analytics

### Supabase Analytics Dashboard
- Real-time user activity
- Authentication success/failure rates
- API usage patterns
- Performance metrics

## 🚀 Production Setup Checklist

### Before Going Live

**Security Configuration:**
- [ ] Enable Supabase Authentication
- [ ] Configure Row Level Security policies
- [ ] Set up proper admin roles
- [ ] Enable email verification
- [ ] Configure password requirements

**Monitoring Setup:**
- [ ] Set up error tracking (Sentry)
- [ ] Configure analytics (Google Analytics)
- [ ] Enable Supabase monitoring
- [ ] Set up alerts for suspicious activity

**Compliance:**
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Implement data export functionality
- [ ] Set up data retention policies

## 🔧 Development Tools

### Local User Management
```typescript
// View all users in console
console.table(JSON.parse(localStorage.getItem('rental_cash_flow_users')))

// Clear all users (development)
localStorage.removeItem('rental_cash_flow_users')

// Create test users
const createTestUser = (email: string, name: string) => {
  return db.createUser(email, name, 'password123')
}
```

### Supabase CLI Tools
```bash
# Install Supabase CLI
npm install -g supabase

# Login and manage users
supabase auth users list
supabase auth users create user@example.com
supabase auth users delete <user-id>
```

## 🎯 Best Practices

### Security Best Practices
1. **Always use HTTPS** in production
2. **Validate input** on both client and server
3. **Implement rate limiting** for auth endpoints
4. **Regular security audits** and dependency updates
5. **Monitor for suspicious activity**

### User Experience Best Practices
1. **Clear error messages** for auth failures
2. **Email verification flow** that's user-friendly
3. **Password reset** that's simple and secure
4. **Social login options** for convenience
5. **Profile management** features

### Data Management Best Practices
1. **Regular backups** with point-in-time recovery
2. **Data retention policies** for compliance
3. **Encryption at rest and in transit**
4. **Access logging** for audit trails
5. **Performance monitoring** for scale

## 📞 Support & Resources

### Documentation
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [GDPR Compliance Guide](https://supabase.com/docs/guides/auth/auth-gdpr)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

---

**Remember**: The current demo system is for development only. For production use, implement Supabase Authentication for enterprise-grade security and compliance.
