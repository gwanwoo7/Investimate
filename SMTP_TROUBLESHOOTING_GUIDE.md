# 🚨 SMTP Email Not Working - Troubleshooting Guide

## 🎯 You've configured SMTP but emails aren't being sent

Since you've configured the SMTP settings in Supabase but still aren't receiving emails, let's systematically troubleshoot this issue.

## 🔍 Step 1: Verify Supabase SMTP Configuration

### Check Your Current Settings
Go to **Supabase Dashboard** → **Authentication** → **Settings** and verify:

```
✅ Enable custom SMTP: Must be ON
✅ Host: smtp.gmail.com
✅ Port: 587 (recommended) or 465
✅ Username: your-email@myinvestimate.com
✅ Password: 16-character App Password (not regular password)
✅ Sender email: noreply@myinvestimate.com
✅ Sender name: Investimate
```

### Most Common Issues:

**1. Email Confirmations Disabled**
- Go to **Authentication** → **Settings**
- **Enable email confirmations** must be ✅ CHECKED
- This is the #1 reason emails don't send

**2. Wrong Password Type**
- Must use **App Password** (16 characters: `abcd efgh ijkl mnop`)
- NOT your regular Google account password
- Generate at: https://myaccount.google.com → Security → App passwords

**3. Sender Email Mismatch**
- Sender email must be from your verified domain
- Use: `noreply@myinvestimate.com` (not Gmail addresses)

## 🧪 Step 2: Use the Diagnostic Tool

I've added an **SMTP Diagnostic Tool** to your app:

1. **Open your app** in development mode
2. **Look for "SMTP Email Diagnostic Tool"** at the top of the page
3. **Click "Run Full Diagnostics"**
4. **Enter a test email** and click "Test Email Sending"
5. **Check the results** for specific error messages

## 🔧 Step 3: Manual Testing Methods

### Method A: Supabase Dashboard Test
1. **Supabase Dashboard** → **Authentication** → **Users**
2. **Click "Invite user"**
3. **Enter your email address**
4. **Check if invitation email is sent**
5. **Look for error messages** in the dashboard

### Method B: Application Signup Test
1. **Open browser console** (F12)
2. **Try signing up** with a new email
3. **Watch for error messages** in console
4. **Check Network tab** for failed requests

### Method C: Email Provider Test
Try multiple email providers:
- Gmail (personal account)
- Yahoo Mail
- Outlook/Hotmail
- ProtonMail

## 📧 Step 4: Check Email Delivery

### Immediate Checks (0-5 minutes)
- **Inbox** - Check main inbox
- **Spam/Junk folder** - Very important!
- **Promotions tab** (Gmail)
- **Browser console** for error messages

### Delayed Checks (5-30 minutes)
- Some SMTP configurations have delays
- Check spam folders again
- Try different email providers

## 🔍 Step 5: Common Error Messages & Solutions

### "Invalid credentials"
```
Solution: 
1. Regenerate Google App Password
2. Copy/paste carefully (no spaces)
3. Use the email account that generated the password
```

### "Authentication failed"
```
Solution:
1. Enable 2FA on Google account
2. Use App Password, not account password
3. Check username matches password account
```

### "Connection timeout"
```
Solution:
1. Try port 465 instead of 587
2. Check firewall/network settings
3. Try different SMTP security settings
```

### "Sender not authorized"
```
Solution:
1. Use sender email from your domain: noreply@myinvestimate.com
2. Don't use Gmail addresses as sender
3. Verify domain ownership in Google Workspace
```

### No error but no email
```
Solution:
1. Email confirmations might be disabled
2. Check Supabase logs
3. Verify SMTP settings are saved
4. Check spam folders thoroughly
```

## 🚀 Step 6: Alternative Quick Fixes

### Option A: Temporary Disable Email Verification
For immediate testing:
1. **Supabase Dashboard** → **Authentication** → **Settings**
2. **Disable "Enable email confirmations"**
3. Users can sign up without verification
4. **Re-enable after fixing SMTP**

### Option B: Try Different SMTP Provider
If Google Workspace continues to fail:
1. **SendGrid** (100 free emails/day)
2. **Mailgun** (5,000 free emails/month)
3. **Amazon SES** (very low cost)

## 🔬 Step 7: Advanced Debugging

### Check Supabase Logs
1. **Supabase Dashboard** → **Logs**
2. **Filter by "auth"**
3. **Look for SMTP errors**
4. **Check timestamps** when you tested

### Test SMTP Connection Manually
```bash
# Test connection to Gmail SMTP
telnet smtp.gmail.com 587

# Should show:
# 220 smtp.gmail.com ESMTP
```

### Verify DNS Records
```bash
# Your domain should have proper MX records
nslookup -type=MX myinvestimate.com

# Should show:
# myinvestimate.com mail exchanger = 1 smtp.google.com.
```

## ✅ Step 8: Verification Checklist

Go through this checklist systematically:

- [ ] **Supabase email confirmations ENABLED**
- [ ] **SMTP custom settings ENABLED**  
- [ ] **Google App Password generated** (16 characters)
- [ ] **Sender email uses your domain** (@myinvestimate.com)
- [ ] **Port 587 with STARTTLS** (or 465 with SSL)
- [ ] **Email templates configured** in Supabase
- [ ] **Test sent from Supabase dashboard**
- [ ] **Checked spam folders thoroughly**
- [ ] **Tried multiple email providers**
- [ ] **Checked browser console for errors**

## 📱 Step 9: Contact Points

If still not working after all tests:

### Supabase Support
- **Discord**: https://discord.supabase.com
- **GitHub Issues**: https://github.com/supabase/supabase/issues
- **Documentation**: https://supabase.com/docs/guides/auth/auth-smtp

### Google Workspace Support
- **Admin Console Help**: https://support.google.com/a/
- **App Password Issues**: Check 2FA and account permissions

## 🎯 Most Likely Solutions

Based on common issues, try these in order:

1. **Enable email confirmations** in Supabase Auth settings
2. **Regenerate Google App Password** and update SMTP config
3. **Check spam folders** in test email accounts
4. **Use the diagnostic tool** in your app for specific errors
5. **Test from Supabase dashboard** user invitation feature

The diagnostic tool I added will help identify the exact issue. Run it and check the console output for detailed error messages!
