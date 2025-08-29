# Resend Integration Setup Guide

## 🎯 Why Switch to Resend?

- ✅ **Built for transactional emails** (email verification, password resets)
- ✅ **Better deliverability** than Google Workspace SMTP
- ✅ **3,000 free emails/month** (perfect for startup)
- ✅ **No SMTP provider warnings** in Supabase
- ✅ **Detailed analytics** and delivery tracking
- ✅ **Easy integration** with Supabase

## 📋 Step-by-Step Setup

### Step 1: Create Resend Account

1. **Go to Resend:** https://resend.com
2. **Sign up** with your email address
3. **Verify your email** to activate account
4. **Complete account setup**

### Step 2: Add Your Domain

1. **In Resend Dashboard:**
   - Click **"Domains"** in sidebar
   - Click **"Add Domain"**
   - Enter: `myinvestimate.com`
   - Click **"Add Domain"**

2. **Verify Domain Ownership:**
   Resend will provide DNS records to add. You'll need to add these to your domain:
   
   **Typical records (exact values will be provided by Resend):**
   ```
   Type: TXT
   Name: _resend
   Value: [Verification token provided by Resend]
   ```

### Step 3: Get API Key

1. **In Resend Dashboard:**
   - Click **"API Keys"** in sidebar
   - Click **"Create API Key"**
   - Name: `Investimate Supabase Integration`
   - Permission: **"Sending access"**
   - Click **"Add"**

2. **Copy the API Key** (starts with `re_`)
   - Save it securely - you'll only see it once!

### Step 4: Configure Supabase SMTP

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/jrfnerjluqcrzfbhtvza
   - Navigate: **Authentication** → **Settings** → **SMTP Settings**

2. **Update SMTP Configuration:**
   ```
   ✅ Enable custom SMTP: ON
   ✅ SMTP Host: smtp.resend.com
   ✅ SMTP Port: 587
   ✅ SMTP User: resend
   ✅ SMTP Password: [Your Resend API Key]
   ✅ Sender email: noreply@myinvestimate.com
   ✅ Sender name: Investimate
   ```

3. **Save Configuration**

### Step 5: Add Required DNS Records for Resend

After adding your domain to Resend, you'll need to add these DNS records:

#### **Domain Verification Record** (provided by Resend)
```
Type: TXT
Name: _resend
Value: [Verification token from Resend]
```

#### **SPF Record** (update existing one)
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com include:_spf.resend.com ~all
```

#### **DKIM Records** (provided by Resend)
Resend will provide specific DKIM records like:
```
Type: CNAME
Name: [selector1]._domainkey
Value: [selector1]._domainkey.resend.com

Type: CNAME  
Name: [selector2]._domainkey
Value: [selector2]._domainkey.resend.com
```

### Step 6: Environment Variables (Optional)

If you want to use Resend API directly in your app later:

```env
# Add to .env file
VITE_RESEND_API_KEY=re_your_api_key_here
```

## 🧪 Testing the Integration

### Test 1: Domain Verification
1. **In Resend Dashboard:** Check that `myinvestimate.com` shows as "Verified"
2. **DNS Check:** Run `nslookup -type=TXT _resend.myinvestimate.com`

### Test 2: Supabase Email Test
1. **Go to Supabase:** Authentication → Users
2. **Create test user** with real email
3. **Check delivery** in Resend dashboard
4. **Monitor logs** for any errors

### Test 3: App Integration Test
1. **Run QA Diagnostic:** http://localhost:5176 → "QA Diagnostic"
2. **Test email verification:** Sign up with real email
3. **Check Resend analytics:** View delivery status

## 📊 Expected Improvements

After switching to Resend:

- ✅ **No SMTP provider warnings** in Supabase
- ✅ **Improved email deliverability** (95%+ inbox rate)
- ✅ **Real-time delivery tracking** in Resend dashboard
- ✅ **Detailed analytics** (opens, clicks, bounces)
- ✅ **Professional email infrastructure**

## 🔧 DNS Migration Plan

### Current DNS Records (Keep):
```
✅ MX: smtp.google.com (for business email)
✅ DMARC: v=DMARC1; p=quarantine
```

### Update SPF Record:
```
OLD: v=spf1 include:_spf.google.com ~all
NEW: v=spf1 include:_spf.google.com include:_spf.resend.com ~all
```

### Add New Records (from Resend):
```
+ _resend TXT record (domain verification)
+ DKIM CNAME records (email authentication)
```

## 🚀 Implementation Checklist

- [ ] **Step 1:** Create Resend account
- [ ] **Step 2:** Add domain `myinvestimate.com`
- [ ] **Step 3:** Get Resend API key
- [ ] **Step 4:** Update Supabase SMTP settings
- [ ] **Step 5:** Add DNS records provided by Resend
- [ ] **Step 6:** Test email delivery
- [ ] **Step 7:** Verify QA diagnostic results
- [ ] **Step 8:** Test app email verification end-to-end

## 🎯 Next Steps

1. **Start with Resend signup:** https://resend.com
2. **Get the exact DNS records** Resend provides for your domain
3. **Update this guide** with the specific values
4. **Test thoroughly** before going live

## 💡 Pro Tips

- **Keep Google Workspace** for business communications
- **Use Resend** exclusively for app transactional emails
- **Monitor Resend analytics** to optimize email content
- **Set up webhooks** later for advanced tracking

## 🆘 Support Resources

- **Resend Docs:** https://resend.com/docs
- **Supabase SMTP Guide:** https://supabase.com/docs/guides/auth/auth-smtp
- **DNS Help:** Contact your domain provider if needed

Ready to proceed? Start with creating your Resend account!
