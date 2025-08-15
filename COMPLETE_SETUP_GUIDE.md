# 📋 Complete Setup Guide for Investimate

## 🚀 Overview

This guide will help you set up the complete Investimate application with all features:
- ✅ Separate Admin Panel with user management
- ✅ About Us page with company story  
- ✅ Contact page with email functionality
- ✅ Secure Stripe payment integration for Pro subscriptions ($4.99/month)
- ✅ Supabase authentication with email verification

## 🏗️ Step 1: Environment Setup

### Copy Environment Template
```bash
cp .env.example .env.local
```

### Configure Required Variables

Edit `.env.local` with your actual values:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration (REQUIRED for payments)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Google OAuth (OPTIONAL)
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Real Estate APIs (OPTIONAL)
VITE_RAPID_API_KEY=your_rapid_api_key
```

## 🔐 Step 2: Supabase Setup

Follow the detailed [Supabase Configuration Guide](./SUPABASE_CONFIGURATION_GUIDE.md)

### Quick Setup Summary:
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Get your Project URL and API Key
3. Configure authentication settings
4. Set up OAuth providers (optional)

## 💳 Step 3: Stripe Payment Setup

### Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Get your publishable key from Dashboard

### Test Mode Setup
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

### Production Setup
1. Activate your Stripe account
2. Get live keys
3. Update environment variables
4. Configure webhooks for subscription management

## 📧 Step 4: Email Configuration

### Option 1: Use Supabase Email (Recommended for development)
- Supabase provides email out of the box
- Good for development and small-scale production

### Option 2: Custom SMTP (Production recommended)
Configure in Supabase Dashboard > Settings > Auth:
```
SMTP Host: smtp.your-provider.com
SMTP Port: 587
SMTP User: your-email@domain.com
SMTP Password: your-app-password
```

Popular providers:
- **SendGrid**: 100 emails/day free
- **Mailgun**: 5,000 emails/month free
- **AWS SES**: Pay-as-you-go pricing

## 🎨 Step 5: Application Structure

### New Pages Available:

1. **Separate Admin Panel** (`/admin`)
   - User management (view, add, edit, delete)
   - User statistics and analytics
   - Subscription status management
   - Accessible via Admin tab

2. **About Us Page** (`/about`)
   - Company story and mission
   - Journey timeline
   - Core values
   - Professional design

3. **Contact Page** (`/contact`)
   - Contact form with email integration
   - Company contact information
   - Response time information
   - Professional layout

4. **Subscription Page** (`/subscription`)
   - Free vs Pro plan comparison
   - Secure Stripe payment integration
   - Feature comparison
   - $4.99/month Pro subscription

### Navigation Structure:
```
Main App:
├── Home (Tab 0)
├── Calculator (Tab 1) 
├── Community (Tab 2)
└── Admin (Tab 3) → Redirects to separate admin panel

Top Navigation:
├── About → About Us page
├── Contact → Contact page
├── Pro → Subscription page
└── Login/Signup → Authentication
```

## 🔧 Step 6: Development Commands

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Access at: `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🌐 Step 7: Deployment

### Netlify Deployment

1. **Build Settings**
   ```
   Build Command: npm run build
   Publish Directory: dist
   ```

2. **Environment Variables**
   Add in Netlify Dashboard > Site Settings > Environment Variables:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   ```

3. **Update Supabase Redirect URLs**
   Add your production URL:
   ```
   https://your-domain.netlify.app/auth/callback
   ```

### Vercel Deployment

1. **Connect GitHub Repository**
2. **Configure Environment Variables**
3. **Deploy**

## 🧪 Step 8: Testing

### Test Authentication
1. ✅ Email signup with verification
2. ✅ Email login
3. ✅ Google OAuth (if configured)
4. ✅ Password reset

### Test Admin Panel
1. ✅ Access admin panel via Admin tab
2. ✅ View user list and statistics
3. ✅ Add new user
4. ✅ Edit user details
5. ✅ User search functionality

### Test Payment Flow
1. ✅ Access subscription page
2. ✅ Compare Free vs Pro plans
3. ✅ Test payment with Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`

### Test Email Integration
1. ✅ Contact form submission
2. ✅ Email verification flow
3. ✅ Password reset emails

## 🔒 Security Features

### Authentication Security
- ✅ Email verification required
- ✅ Secure password requirements
- ✅ JWT token management
- ✅ OAuth integration
- ✅ Session handling

### Payment Security
- ✅ PCI DSS compliant (Stripe)
- ✅ No card data stored locally
- ✅ Secure payment processing
- ✅ Fraud protection

### Data Protection
- ✅ Row Level Security (RLS) in Supabase
- ✅ Encrypted data storage
- ✅ HTTPS enforcement
- ✅ Environment variable protection

## 🎯 Features Summary

### Free Plan Features
- ✅ Up to 5 property searches per day
- ✅ Basic ROI calculations
- ✅ Property details view
- ✅ Community access

### Pro Plan Features ($4.99/month)
- ✅ Unlimited property searches
- ✅ Advanced ROI calculations
- ✅ Market trend analysis
- ✅ Comparative market analysis (CMA)
- ✅ Investment recommendations
- ✅ Portfolio tracking
- ✅ Email alerts for opportunities
- ✅ Priority customer support
- ✅ Export reports to PDF
- ✅ API access for developers

## 🆘 Troubleshooting

### Common Issues

1. **"Supabase Auth: ⚠️ Not configured"**
   - Check environment variables are set correctly
   - Restart development server
   - Verify Supabase project is active

2. **Stripe payment not working**
   - Check publishable key is correct
   - Verify you're using test keys in development
   - Check browser console for errors

3. **Admin panel not accessible**
   - Verify user is logged in
   - Check user permissions
   - Clear browser cache

4. **Email not sending**
   - Check Supabase email configuration
   - Verify SMTP settings (if using custom)
   - Check spam folder

### Debug Commands
```bash
# Check environment variables
npm run dev
# Open browser console and check for errors

# Verify Supabase connection
# Check Network tab in browser dev tools

# Test Stripe in browser console
# Should see Stripe object if loaded correctly
```

## 📞 Support

For additional help:
- 📧 Email: admin@investimate.com
- 📚 Documentation: Check individual component files
- 🐛 Issues: Create GitHub issue
- 💬 Contact: Use the contact form in the app

## ✅ Deployment Checklist

### Pre-Production
- [ ] All environment variables configured
- [ ] Supabase authentication working
- [ ] Stripe payments tested
- [ ] Admin panel functional
- [ ] All pages accessible
- [ ] Email system working
- [ ] Error handling implemented

### Production Deployment
- [ ] Production environment variables set
- [ ] Stripe live keys configured
- [ ] Supabase production settings
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Performance testing completed
- [ ] Security audit passed

🎉 **Your Investimate application is now fully configured and ready for production!** 🎉
