# SMTP Configuration Verification Guide

## QA Diagnostic Results

The diagnostic tool found that SMTP settings cannot be verified from the client-side. This is expected behavior for security reasons.

### Expected SMTP Configuration
```json
{
  "host": "smtp.gmail.com",
  "port": "587", 
  "sender": "noreply@myinvestimate.com",
  "domain": "myinvestimate.com"
}
```

## Manual Verification Steps

### 1. Check Supabase SMTP Settings

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Navigate to your project: `jrfnerjluqcrzfbhtvza`

2. **Access Authentication Settings:**
   - Click **Authentication** in sidebar
   - Go to **Settings** tab
   - Scroll to **SMTP Settings** section

3. **Verify Configuration:**
   ```
   ✅ Enable custom SMTP: Should be ON
   ✅ SMTP Host: smtp.gmail.com
   ✅ SMTP Port: 587
   ✅ SMTP User: your-google-workspace-email@myinvestimate.com
   ✅ SMTP Password: App password from Google Workspace
   ✅ Sender email: noreply@myinvestimate.com
   ✅ Sender name: Investimate
   ```

### 2. Google Workspace App Password Setup

If not already configured:

1. **Go to Google Admin Console:**
   - Visit: https://admin.google.com
   - Sign in with your Google Workspace admin account

2. **Enable 2-Step Verification:**
   - Go to Security > 2-Step Verification
   - Enable for the email account used for SMTP

3. **Generate App Password:**
   - Go to Security > App passwords
   - Select app: "Mail"
   - Select device: "Other (custom name)"
   - Enter: "Supabase SMTP"
   - Copy the generated 16-character password

4. **Update Supabase:**
   - Use this app password in Supabase SMTP settings

### 3. DNS Records Verification

**Current Status:**
- ✅ MX record: `smtp.gmail.com` (configured)
- ❌ SPF record: Missing
- ❌ DKIM record: Missing  
- ❌ DMARC record: Missing

**Required DNS Records:**

1. **SPF Record:**
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.google.com ~all
   ```

2. **DKIM Record:**
   - Generate in Google Admin Console
   - Go to Apps > Google Workspace > Gmail > Authenticate email
   - Follow DKIM setup wizard

3. **DMARC Record:**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=quarantine; rua=mailto:admin@myinvestimate.com
   ```

## Testing Email Delivery

### Method 1: Supabase Auth Logs
1. Go to Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Try creating a test user
4. Check **Logs** section for email delivery status

### Method 2: QA Diagnostic Tool
1. Use the app's QA Diagnostic (footer button)
2. Run "Test Email Sending" 
3. Check console for detailed error messages

### Method 3: Manual Test
1. Sign up with a real email address
2. Check inbox and spam folder
3. Monitor Supabase logs for delivery confirmation

## Common Issues & Solutions

### Issue: "SMTP Authentication Failed"
**Solution:** Verify Google Workspace app password is correct

### Issue: "550 5.7.1 Authentication Required"
**Solution:** Add SPF record to DNS

### Issue: "Email sent but not received"
**Solutions:**
1. Check spam/junk folder
2. Verify DNS SPF record
3. Add DKIM and DMARC records
4. Check Google Workspace email limits

### Issue: "Connection timeout"
**Solutions:**
1. Verify SMTP host: `smtp.gmail.com`
2. Verify SMTP port: `587`
3. Check if TLS/STARTTLS is enabled

## Environment Variables Fixed

✅ **VITE_GOOGLE_MAPS_API_KEY** - Removed quotes, should now be detected correctly

## Next Actions

1. **Immediate:** Verify Supabase SMTP settings manually
2. **Critical:** Add DNS SPF record for email authentication
3. **Important:** Set up DKIM in Google Workspace
4. **Optional:** Add DMARC policy for enhanced security
5. **Test:** Use QA diagnostic after fixes to verify improvements

## Contact Support

If issues persist:
- **Supabase Support:** For SMTP configuration issues
- **Google Workspace Admin:** For email authentication setup
- **Domain Provider:** For DNS record management
