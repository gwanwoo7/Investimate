# Quick Supabase SMTP Configuration for Resend

## 🔧 Exact Settings for Supabase Dashboard

Once you have your Resend API key, update these settings in Supabase:

**Location:** https://supabase.com/dashboard/project/jrfnerjluqcrzfbhtvza  
**Path:** Authentication → Settings → SMTP Settings

```
Enable custom SMTP: ✅ ON

SMTP Host: smtp.resend.com
SMTP Port: 587  
SMTP User: resend
SMTP Password: [YOUR_RESEND_API_KEY]

Sender email: noreply@myinvestimate.com
Sender name: Investimate
```

## 🔑 API Key Format

Your Resend API key will look like:
```
re_ABC123DEF456_789xyz...
```

## ⚠️ Important Notes

1. **Use the full API key** as the SMTP password
2. **SMTP User must be exactly:** `resend`
3. **Sender email must match your verified domain:** `myinvestimate.com`
4. **Save settings** and test immediately

## 🧪 Test After Configuration

1. **Create test user** in Supabase Auth
2. **Check Resend dashboard** for delivery status  
3. **Run QA diagnostic** in your app
4. **Verify email arrives** in inbox (not spam)

## 🎯 Expected Result

- ✅ No SMTP provider warnings
- ✅ Emails delivered to inbox
- ✅ Real-time delivery tracking in Resend
- ✅ Professional email infrastructure
