# 🧪 Database & Email Test Suite - User Guide

## 🎯 Purpose
This comprehensive test suite diagnoses signup, email delivery, and membership persistence issues by testing all critical system components.

## 🔗 How to Access
1. **Visit your app**: http://localhost:5174
2. **Scroll to footer**: Look for the "🧪 Test Suite" button
3. **Click to launch**: Opens the comprehensive diagnostic tool

## 🧪 Test Components

### 1. Environment Variables Test
- **Checks**: Resend API key, Supabase configuration
- **Purpose**: Verifies all required environment variables are set
- **Expected Result**: ✅ All API keys configured correctly

### 2. Email Service Test
- **Tests**: Welcome email, verification email delivery
- **Input**: Your real email address for testing
- **Purpose**: Validates Resend API integration and email templates
- **Expected Result**: ✅ Both emails sent successfully with message IDs

### 3. Database Service Test
- **Tests**: User creation, retrieval, subscription updates
- **Purpose**: Validates LocalStorage database operations
- **Expected Result**: ✅ All database operations succeed

### 4. Supabase Service Test
- **Tests**: Connection, subscription status, feature access
- **Purpose**: Validates remote database and membership system
- **Expected Result**: ✅ Supabase operations work (may show warnings if not logged in)

## 🔍 Diagnostic Process

### Step 1: Configure Test Data
```
Test Email: your-email@example.com  (use your real email!)
Test Name: Your Name
```

### Step 2: Run Full Test Suite
Click **"Run Full Test Suite"** and wait for all tests to complete.

### Step 3: Analyze Results
- ✅ **Green (Success)**: Component working correctly
- ❌ **Red (Error)**: Critical issue found
- ⚠️ **Orange (Warning)**: Minor issue or expected behavior
- ℹ️ **Blue (Info)**: Informational message

## 🐛 Common Issues & Solutions

### Issue: "VITE_RESEND_API_KEY not configured"
**Solution**: Check your `.env` file contains:
```
VITE_RESEND_API_KEY=re_3pr5WXq7_KhHRaDYULJB5HLm43j44Cm2q
```

### Issue: "Failed to send verification email"
**Diagnosis Steps**:
1. Check Environment Variables test ✅
2. Check Email Service test results
3. Look for specific error messages in test details
4. Verify Resend API key is valid

### Issue: "Subscription status check failed"
**Diagnosis Steps**:
1. Check if you're logged in to the app
2. Check Supabase connection test
3. Try logging in and running test again

### Issue: "Database user creation failed"
**Diagnosis Steps**:
1. Check browser localStorage permissions
2. Look for detailed error in test results
3. Try clearing localStorage and running again

## 📧 Email Delivery Testing

### What to Expect
When you run email tests with your real email:

1. **Welcome Email**: 
   - Subject: "Welcome to Investimate! 🏠"
   - Professional HTML template
   - Should arrive within 1-2 minutes

2. **Verification Email**:
   - Subject: "Verify your email address - Investimate"
   - Contains verification link
   - Should arrive within 1-2 minutes

### Troubleshooting Email Issues
- Check spam/junk folder
- Verify email address is typed correctly
- Look at test results for specific error messages
- Message IDs in test results confirm delivery to Resend

## 🔄 Testing Signup Flow

### Complete Signup Test Process
1. **Run Test Suite**: Ensure all systems are working
2. **Try Actual Signup**: Use the real signup form
3. **Monitor Console**: Check browser console for errors
4. **Check Email**: Look for both welcome and verification emails
5. **Verify Database**: Run test suite again to check user creation

### Expected Signup Flow
```
User fills signup form
    ↓
Supabase creates user account
    ↓
Send welcome email via Resend ✅
    ↓
Send verification email via Resend ✅
    ↓
Save user to local database ✅
    ↓
Show verification modal to user
```

## 📊 Test Results Interpretation

### All Green Results ✅
- System is working correctly
- Signup should work normally
- Email delivery is functional

### Mixed Results ⚠️
- Some components working, others need attention
- Focus on red/error items first
- May still work with warnings

### Many Red Results ❌
- Critical configuration issues
- Check environment variables
- Verify API keys and services

## 🚀 After Running Tests

### If All Tests Pass ✅
- Try actual signup with your email
- Should receive both welcome and verification emails
- Membership state should persist after page refresh

### If Tests Fail ❌
- Copy the detailed error information
- Check specific error messages in test details
- Focus on fixing environment variables first
- Retry after making configuration changes

## 🔧 Advanced Debugging

### Browser Console Logs
Open DevTools → Console while running tests to see:
- Detailed API requests/responses
- Authentication status
- Database operations
- Email delivery confirmations

### Test Result Details
Each test shows detailed information including:
- API responses
- Error stack traces  
- Configuration status
- Database query results

## 📞 Need Help?
If tests show issues you can't resolve:
1. Copy the full test results (use the details sections)
2. Include your environment configuration (without API keys)
3. Describe what specific signup error you're seeing

---

**Quick Start**: Just click "🧪 Test Suite" in the footer → enter your email → click "Run Full Test Suite" → analyze results! 🎯
