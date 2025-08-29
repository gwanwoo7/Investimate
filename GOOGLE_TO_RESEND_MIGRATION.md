# Complete Google Workspace → Resend Migration Guide

## 🎯 Migration Overview

**Replacing:** Google Workspace SMTP completely  
**With:** Resend transactional email service  
**Goal:** Better deliverability, no SMTP warnings, professional setup

## 📋 Step-by-Step Migration Process

### Step 1: Create Resend Account & Setup

1. **Go to Resend:** https://resend.com
2. **Sign up** with your email
3. **Verify email** and complete account setup

### Step 2: Add Domain to Resend

1. **In Resend Dashboard:**
   - Click **"Domains"** → **"Add Domain"**
   - Enter: `myinvestimate.com`
   - Click **"Add Domain"**

2. **Resend will provide verification records** - note them down

### Step 3: Create Resend API Key

1. **In Resend Dashboard:**
   - Click **"API Keys"** → **"Create API Key"**
   - Name: `Investimate Email Service`
   - Permission: **"Sending access"**
   - **Copy the API key** (starts with `re_`)

### Step 4: Update Environment Variables

Replace your current Resend placeholder:

```env
# Replace this line in .env:
VITE_RESEND_API_KEY=your_resend_api_key_here

# With your actual API key:
VITE_RESEND_API_KEY=re_your_actual_api_key_123...
```

### Step 5: DNS Records Migration

#### **Remove/Modify Current Google Records:**

1. **Update SPF Record** (replace current one):
   ```
   OLD: v=spf1 include:_spf.google.com ~all
   NEW: v=spf1 include:_spf.resend.com ~all
   ```

2. **Keep DMARC Record** (already configured correctly):
   ```
   KEEP: v=DMARC1; p=quarantine; rua=mailto:admin@myinvestimate.com
   ```

3. **Replace MX Record** (if you want Resend for all email):
   ```
   OLD: smtp.google.com
   NEW: [Resend will provide if needed, or keep Google for business email]
   ```

#### **Add New Resend Records:**

1. **Domain Verification** (provided by Resend):
   ```
   Type: TXT
   Name: _resend
   Value: [Token from Resend dashboard]
   ```

2. **DKIM Records** (provided by Resend):
   ```
   Type: CNAME
   Name: [selector1]._domainkey
   Value: [selector1]._domainkey.resend.com

   Type: CNAME  
   Name: [selector2]._domainkey
   Value: [selector2]._domainkey.resend.com
   ```

### Step 6: Configure Supabase for Resend

**Replace Google Workspace SMTP completely:**

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/jrfnerjluqcrzfbhtvza
   - Navigate: **Authentication** → **Settings** → **SMTP Settings**

2. **Update Configuration:**
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

## 🗑️ What to Remove/Replace

### **DNS Records to Modify:**
- ❌ **Remove Google SMTP from SPF:** `include:_spf.google.com`
- ➕ **Add Resend to SPF:** `include:_spf.resend.com`
- ❌ **Remove Google DKIM:** `google._domainkey` (can keep for business email)
- ➕ **Add Resend DKIM:** Records provided by Resend

### **Supabase Configuration to Replace:**
- ❌ **Remove Google SMTP Host:** `smtp.gmail.com`
- ❌ **Remove Google SMTP User:** Your Google email
- ❌ **Remove Google App Password**
- ➕ **Add Resend SMTP:** Complete new configuration

### **Environment Variables:**
- ✅ **Keep Google OAuth:** For sign-in (not email)
- ✅ **Keep Google Maps:** For mapping features
- ➕ **Add Resend API Key:** For email service

## 🧪 Migration Testing Plan

### Test 1: Domain Verification
```bash
# After adding Resend verification record
nslookup -type=TXT _resend.myinvestimate.com
```

### Test 2: Updated SPF Record
```bash
# Should show Resend instead of Google
nslookup -type=TXT myinvestimate.com | grep resend
```

### Test 3: Supabase Email Test
1. **Create test user** in Supabase Authentication
2. **Check Resend dashboard** for delivery
3. **Verify no SMTP warnings**

### Test 4: App Integration Test
1. **Run QA Diagnostic:** http://localhost:5176
2. **Test email verification:** Sign up with real email
3. **Verify delivery:** Check inbox and Resend analytics

## 📊 Expected Results After Migration

### **Before (Google Workspace SMTP):**
- ⚠️ SMTP provider warnings
- 📧 Business email mixed with transactional
- 💰 Google Workspace subscription required
- 📊 Limited analytics

### **After (Resend):**
- ✅ No SMTP warnings
- 📧 Professional transactional email service
- 💰 3,000 free emails/month
- 📊 Detailed delivery analytics
- 🚀 95%+ inbox delivery rate
- 🔧 Built for applications

## 🎯 Exact DNS Changes Required

### **Current SPF Record:**
```
v=spf1 include:_spf.google.com ~all
```

### **New SPF Record:**
```
v=spf1 include:_spf.resend.com ~all
```

### **Additional Records (from Resend):**
```
_resend TXT [verification-token]
[selector1]._domainkey CNAME [selector1]._domainkey.resend.com
[selector2]._domainkey CNAME [selector2]._domainkey.resend.com
```

## 🚀 Migration Checklist

- [ ] **Create Resend account**
- [ ] **Add domain to Resend**
- [ ] **Get Resend API key**
- [ ] **Update .env file with API key**
- [ ] **Add Resend DNS verification record**
- [ ] **Update SPF record to use Resend**
- [ ] **Add Resend DKIM records**
- [ ] **Configure Supabase SMTP for Resend**
- [ ] **Test domain verification in Resend**
- [ ] **Test email delivery**
- [ ] **Run QA diagnostic**
- [ ] **Verify no SMTP warnings**

## ⏱️ Migration Timeline

- **Resend setup:** 10 minutes
- **DNS updates:** 5 minutes (instant effect)
- **Supabase configuration:** 3 minutes
- **Testing:** 10 minutes
- **Total:** ~30 minutes for complete migration

## 🆘 Rollback Plan (If Needed)

If issues occur, you can quickly rollback:

1. **Revert SPF record** to Google
2. **Restore Google SMTP** in Supabase
3. **Remove Resend DNS records**

But with proper testing, this shouldn't be necessary!

## 🎉 Benefits After Migration

- ✅ **Professional email infrastructure**
- ✅ **No more SMTP provider warnings**
- ✅ **Better deliverability**
- ✅ **Real-time analytics**
- ✅ **Scalable email solution**
- ✅ **Cost-effective (free tier)**

Ready to start the migration? Begin with creating your Resend account!
