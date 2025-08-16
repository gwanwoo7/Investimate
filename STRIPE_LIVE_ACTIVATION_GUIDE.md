# 🚀 Stripe Live Payment Activation Guide

## 🎯 **Overview**
This guide helps you activate live Stripe payments for real transactions to your bank account.

## 📋 **Current Status Check**

Your app currently uses **Test Mode** with $0.01 test payments. To accept real payments:

### **Step 1: Complete Stripe Account Verification**

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/
2. **Complete Account Setup**:
   - **Business Details**: Company info, address, tax ID
   - **Bank Account**: Add your business bank account for payouts
   - **Identity Verification**: Upload required documents
   - **Activate Account**: Submit for review (usually 1-2 business days)

### **Step 2: Update Payment Configuration**

Once your Stripe account is activated:

#### **A. Get Live API Keys**
1. **Stripe Dashboard** → **Developers** → **API Keys**
2. **Switch to "Live" mode** (toggle in top-left)
3. **Copy your Live Keys**:
   - **Publishable Key**: `pk_live_...`
   - **Secret Key**: `sk_live_...` (keep this secure!)

#### **B. Update Environment Variables**

**Local Development (.env file):**
```env
# Stripe Live Keys (for production)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_actual_live_secret_key

# Keep test keys for development
VITE_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_your_test_key
STRIPE_SECRET_KEY_TEST=sk_test_your_test_secret_key
```

**Netlify Environment Variables:**
1. **Netlify Dashboard** → **Site Settings** → **Environment Variables**
2. **Add/Update**:
   - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `STRIPE_SECRET_KEY` = `sk_live_...`

### **Step 3: Configure Live Payment Settings**

#### **A. Update Pricing (Optional)**
Change from $0.01 test to real pricing:

```typescript
// In your payment component
const priceAmount = 2999; // $29.99 for Pro subscription
const currency = 'usd';
```

#### **B. Add Payment Confirmation**
```typescript
// Add success/error handling for live payments
const handlePaymentSuccess = (paymentIntent) => {
  // Send confirmation email
  // Update user subscription status
  // Redirect to success page
};
```

### **Step 4: Enable Webhooks (Important for Security)**

1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add Endpoint**: `https://investimate.netlify.app/api/stripe-webhook`
3. **Select Events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.deleted`

4. **Get Webhook Secret**: Copy `whsec_...` for verification

### **Step 5: Security & Compliance**

#### **A. PCI Compliance**
- ✅ **Using Stripe Elements**: Automatically PCI compliant
- ✅ **No card data on your server**: Stripe handles all sensitive data
- ✅ **HTTPS required**: Your site uses HTTPS ✓

#### **B. Add Server-Side Validation**
```typescript
// Verify payments server-side before granting access
const verifyPayment = async (paymentIntentId) => {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  return paymentIntent.status === 'succeeded';
};
```

## 🧪 **Testing Live Payments Safely**

### **Stage 1: Small Test Amounts**
- Start with $1-5 payments
- Test with your own cards
- Verify money reaches your bank account

### **Stage 2: Full Production**
- Switch to real pricing
- Monitor transactions daily
- Set up email notifications

## 🔐 **Security Best Practices**

### **A. Environment Security**
```bash
# Never commit these to Git
STRIPE_SECRET_KEY=sk_live_... # Keep secret!
STRIPE_WEBHOOK_SECRET=whsec_... # Keep secret!
```

### **B. Payment Validation**
- Always verify payments server-side
- Check payment amounts match expected prices
- Validate customer emails
- Log all transactions

### **C. Error Handling**
```typescript
try {
  const paymentIntent = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: 'https://investimate.netlify.app/payment-success'
    }
  });
} catch (error) {
  // Log error securely
  // Show user-friendly message
  // Don't expose sensitive details
}
```

## 💰 **Payout Configuration**

1. **Bank Account**: Add your business banking details
2. **Payout Schedule**: Choose daily/weekly/monthly
3. **Currency**: Set to your preferred currency (USD)
4. **Fees**: Stripe takes 2.9% + $0.30 per transaction

## 📊 **Monitoring & Analytics**

### **Set Up Alerts**
- **Failed payments**: Email notifications
- **Disputes**: Immediate alerts
- **High-value transactions**: Manual review

### **Track Metrics**
- **Conversion rates**: Visitors → paying customers
- **Payment success rates**: Technical issues
- **Revenue analytics**: Monthly recurring revenue (MRR)

## 🚨 **Go-Live Checklist**

- [ ] ✅ **Stripe account fully verified**
- [ ] ✅ **Bank account connected and verified**
- [ ] ✅ **Live API keys configured**
- [ ] ✅ **Webhooks endpoint working**
- [ ] ✅ **Payment amounts updated to real pricing**
- [ ] ✅ **Success/failure flows tested**
- [ ] ✅ **Security validations in place**
- [ ] ✅ **Monitoring and alerts configured**

## ⚠️ **Important Notes**

1. **Test Thoroughly**: Always test with small amounts first
2. **Monitor Closely**: Watch for failed payments/disputes
3. **Customer Support**: Have a process for payment issues
4. **Backup Plan**: Keep test mode available for debugging

## 🆘 **Common Issues & Solutions**

### **"Payment requires authentication"**
- **Cause**: 3D Secure/SCA requirements
- **Fix**: Use Stripe's built-in authentication flow

### **"Webhook signature invalid"**
- **Cause**: Wrong webhook secret
- **Fix**: Copy exact webhook secret from Stripe dashboard

### **"Payment succeeded but user not upgraded"**
- **Cause**: Webhook not processed
- **Fix**: Check webhook endpoint logs, verify event handling

---

## 🎉 **Result: Live Payments Active!**

Once completed, your users can make real payments that go directly to your bank account, with full security and compliance through Stripe's platform.

**Need Help?** Test with small amounts first and monitor the Stripe dashboard for any issues.
