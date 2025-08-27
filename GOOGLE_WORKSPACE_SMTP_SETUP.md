# 🚀 Google Workspace SMTP Setup for Supabase

## 📋 Complete Configuration Guide

Since you have Google Workspace, here's how to configure reliable email delivery for your Investimate app.

## Step 1: Generate Google App Password

1. **Go to Google Admin Console**: https://admin.google.com
2. **Or Google Account Settings**: https://myaccount.google.com/
3. **Security** → **2-Step Verification** (enable if not already)
4. **App passwords** → **Generate new app password**
5. **Select**: Mail / Other (custom name)
6. **Name**: "Supabase Email Service"
7. **Copy the 16-character password**: `abcd efgh ijkl mnop`

## Step 2: Supabase SMTP Configuration

### Go to Supabase Dashboard
1. **URL**: https://app.supabase.com
2. **Project**: jrfnerjluqcrzfbhtvza (your project)
3. **Authentication** → **Settings**

### SMTP Settings Configuration
```
✅ Enable custom SMTP: ON

Host: smtp.gmail.com
Port: 587 (recommended) or 465 (SSL)
Security: STARTTLS (for port 587) or SSL/TLS (for port 465)

Username: noreply@myinvestimate.com
Password: [Your 16-character App Password]

Sender email: noreply@myinvestimate.com
Sender name: Investimate
```

### Alternative Configuration (if you have admin@myinvestimate.com)
```
Username: admin@myinvestimate.com
Password: [App Password for admin account]
Sender email: noreply@myinvestimate.com
Sender name: Investimate Team
```

## Step 3: Test Email Configuration

### Using the Development Tools
1. **Open your Investimate app** in development mode
2. **Try to sign up** with a new email
3. **Check the console** for debugging information
4. **Use the "Test SMTP" button** if available

### Manual Testing
1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. **Click "Invite user"**
3. **Enter a test email address**
4. **Check if the invitation email is sent**

## Step 4: Email Template Customization

### Access Templates
1. **Supabase Dashboard** → **Authentication** → **Templates**
2. **Select "Confirm signup"**
3. **Use the template from SUPABASE_EMAIL_TEMPLATE.md**

### Key Template Variables
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Verification link
- `{{ .SiteURL }}` - Your app's URL
- `{{ .ProjectName }}` - Project name

## Step 5: DNS Configuration for Better Deliverability

### Required DNS Records for myinvestimate.com

**SPF Record** (Email authentication):
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

**DKIM Record** (Email signing):
```
Type: TXT
Name: google._domainkey
Value: [Provided by Google Workspace - check your admin console]
```

**DMARC Record** (Email policy):
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@myinvestimate.com
```

## 🔧 Troubleshooting

### Common Issues

**1. "Invalid credentials" error**
- ✅ Ensure 2FA is enabled on Google account
- ✅ Use App Password, not regular password
- ✅ Double-check the 16-character app password

**2. "Connection timeout" error**
- ✅ Try port 465 instead of 587
- ✅ Check if SMTP is enabled in Google Workspace admin
- ✅ Verify firewall/network restrictions

**3. "Sender not authorized" error**
- ✅ Ensure sender email matches username domain
- ✅ Check Google Workspace user permissions
- ✅ Verify domain ownership in Google Workspace

**4. Emails go to spam**
- ✅ Add SPF, DKIM, and DMARC records
- ✅ Use professional email templates
- ✅ Test with multiple email providers

### Debug Commands

**Check DNS records:**
```bash
# Check SPF
nslookup -type=TXT myinvestimate.com

# Check MX records
nslookup -type=MX myinvestimate.com

# Check DKIM
nslookup -type=TXT google._domainkey.myinvestimate.com
```

**Test SMTP connection:**
```bash
# Test connection to Gmail SMTP
telnet smtp.gmail.com 587
```

## 📊 Monitoring Email Delivery

### Google Workspace Admin Console
1. **Reports** → **Email log search**
2. **Monitor delivery rates**
3. **Check for bounces/rejections**

### Supabase Dashboard
1. **Authentication** → **Users**
2. **Monitor signup success rates**
3. **Check for email confirmation rates**

## ✅ Verification Checklist

Before going live, verify:

- [ ] **App Password generated** and copied correctly
- [ ] **SMTP settings configured** in Supabase
- [ ] **Email template customized** with your branding
- [ ] **Test emails sent successfully**
- [ ] **DNS records added** for email authentication
- [ ] **Emails not going to spam**
- [ ] **Mobile email clients tested**
- [ ] **Email verification flow tested** end-to-end

## 🎯 Expected Results

After configuration:
- ✅ **Signup emails** sent within 5 seconds
- ✅ **Professional appearance** with your branding
- ✅ **High deliverability** (inbox, not spam)
- ✅ **Mobile-friendly** email templates
- ✅ **Reliable delivery** through Google's infrastructure

## 🔄 Alternative Configurations

### If Google Workspace Admin Restrictions
Use a personal Gmail account temporarily:
```
Username: your-personal-email@gmail.com
Password: [App Password]
Sender email: noreply@myinvestimate.com
Sender name: Investimate
```

### If SMTP Issues Persist
Consider these alternatives:
1. **SendGrid** (100 free emails/day)
2. **Mailgun** (5,000 free emails/month)
3. **Amazon SES** (very low cost)

## 📞 Support Resources

- **Google Workspace Support**: https://support.google.com/a/
- **Supabase Email Docs**: https://supabase.com/docs/guides/auth/auth-smtp
- **Email Deliverability Guide**: https://postmarkapp.com/guides/email-deliverability

---

**Next Steps:**
1. Configure SMTP settings in Supabase
2. Test email sending with the debug tools
3. Add DNS records for better deliverability
4. Monitor email delivery rates
