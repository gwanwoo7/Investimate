# DNS Setup Guide for Email Delivery

## Current Issue
Email verification is not working because your domain `myinvestimate.com` is missing essential DNS records for email authentication.

## Required DNS Records

### 1. SPF Record (Sender Policy Framework)
**Type:** TXT  
**Name:** @ (root domain)  
**Value:** `v=spf1 include:_spf.google.com ~all`

This tells email servers that Google is authorized to send emails on behalf of your domain.

### 2. DKIM Records (DomainKeys Identified Mail)
1. Go to Google Admin Console (admin.google.com)
2. Navigate to **Apps > Google Workspace > Gmail > Authenticate email**
3. Click **Start authentication**
4. Select your domain: `myinvestimate.com`
5. Choose **Generate new record**
6. Copy the generated DKIM record and add it to your DNS:

**Type:** TXT  
**Name:** `[selector]._domainkey` (Google will provide the exact name)  
**Value:** `[DKIM key]` (Google will provide the full value)

### 3. DMARC Record (Domain-based Message Authentication)
**Type:** TXT  
**Name:** `_dmarc`  
**Value:** `v=DMARC1; p=quarantine; rua=mailto:admin@myinvestimate.com`

## How to Add DNS Records

### If using Netlify DNS:
1. Go to Netlify dashboard
2. Select your site
3. Go to **Domain settings > DNS records**
4. Click **Add new record**
5. Add each record above

### If using external DNS provider:
1. Log into your domain registrar or DNS provider
2. Find DNS management section
3. Add TXT records as specified above

## Verification Steps

After adding records, wait 24-48 hours for propagation, then verify:

```bash
# Check SPF record
nslookup -type=TXT myinvestimate.com

# Check DKIM record (replace [selector] with actual selector from Google)
nslookup -type=TXT [selector]._domainkey.myinvestimate.com

# Check DMARC record
nslookup -type=TXT _dmarc.myinvestimate.com
```

## Current Status
✅ MX record: `smtp.google.com` (correctly configured)  
✅ SPF record: `v=spf1 include:_spf.google.com ~all` (ADDED!)  
✅ DKIM record: Google DKIM configured (ADDED!)  
✅ DMARC record: `v=DMARC1; p=quarantine` (ADDED!)  

**🎉 All DNS records are now properly configured!**  

## Testing Email Delivery

Once DNS records are added:
1. Use the QA Diagnostic tool in the app
2. Test email verification signup
3. Check Google Workspace logs for delivery status

## Troubleshooting

If emails still don't work after DNS setup:
1. Verify Supabase SMTP configuration
2. Check Google Workspace settings
3. Review email quotas and limits
4. Test with different email providers

## Contact
If you need help with DNS setup, contact your domain provider or Netlify support.
