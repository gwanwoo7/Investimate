# Stripe Payment Integration Setup Guide

## 🎯 Overview
This guide will help you set up Stripe for processing $0.01 test payments for the Pro subscription feature.

## 📋 Prerequisites
- Stripe account (free to create)
- Bank account for receiving payments
- Business information for Stripe verification

## 🚀 Step-by-Step Setup

### 1. Create Stripe Account

1. **Go to [stripe.com](https://stripe.com)**
2. **Click "Start now"** → Sign up
3. **Fill in business information**:
   - Business name: "Investimate" (or your business name)
   - Business type: Software/SaaS
   - Industry: Real Estate Technology
4. **Complete account verification**

### 2. Get Your API Keys

1. **Go to Stripe Dashboard** → Developers → API keys
2. **Copy these keys**:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 3. Configure Environment Variables

#### Local Development (.env.local):
```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

#### Netlify Production:
Add to Netlify environment variables:
- `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_test_your_publishable_key_here`
- `STRIPE_SECRET_KEY` = `sk_test_your_secret_key_here`

### 4. Set Up Bank Account

1. **Go to Stripe Dashboard** → Settings → Payouts
2. **Add bank account details**:
   - Account holder name
   - Routing number
   - Account number
3. **Verify account** (may take 1-2 business days)

### 5. Create Test Products

1. **Go to Stripe Dashboard** → Products
2. **Create product**:
   - Name: "Investimate Pro Subscription"
   - Price: $0.01 USD
   - Billing: Monthly
   - Copy the **Price ID** (starts with `price_`)

### 6. Install Stripe Dependencies

The project already includes Stripe dependencies, but if needed:
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 7. Update Subscription Code

Replace the current test implementation with real Stripe integration:

#### Update src/pages/SubscriptionPage.tsx:
```typescript
// Replace the stripePromise initialization with your key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// In CheckoutForm component, replace the simulation with real payment:
const handleSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  
  if (!stripe || !elements) return;
  
  setLoading(true);
  
  try {
    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)!,
      billing_details: { name, email },
    });
    
    if (error) {
      onError(error.message || 'Payment failed');
      return;
    }
    
    // Send to your backend to create subscription
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,
        email,
        name,
        priceId: 'price_your_price_id_here' // From step 5
      }),
    });
    
    const result = await response.json();
    
    if (result.error) {
      onError(result.error);
    } else {
      onSuccess();
    }
  } catch (err) {
    onError('Payment failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### 8. Create Backend Endpoint (Optional)

For a full implementation, you'll need a backend endpoint to handle subscriptions:

```javascript
// Example backend endpoint (Node.js/Express)
app.post('/api/create-subscription', async (req, res) => {
  const { paymentMethodId, email, name, priceId } = req.body;
  
  try {
    // Create customer
    const customer = await stripe.customers.create({
      email,
      name,
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
    
    res.json({ subscriptionId: subscription.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### 9. Test Payment Flow

#### Test Credit Cards (Stripe provides these):
- **Successful payment**: 4242424242424242
- **Declined payment**: 4000000000000002
- **Requires authentication**: 4000002500003155

#### Test Details:
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### 10. Go Live Checklist

When ready for production:

1. **Switch to live API keys**:
   - Get live keys from Stripe dashboard
   - Update environment variables
   - Change price to $4.99

2. **Complete Stripe account verification**:
   - Submit required business documents
   - Verify bank account
   - Set up tax settings

3. **Test live payments** with small amounts

4. **Set up webhooks** for subscription events

## 💰 Payment Flow

### Current Test Setup:
1. User selects Pro subscription ($0.01)
2. Enters payment details
3. Stripe processes payment
4. User gets Pro access

### Bank Account Setup:
1. **Business bank account recommended**
2. **Personal account acceptable** for testing
3. **Payments arrive in 2-7 business days**
4. **Stripe fee**: 2.9% + $0.30 per transaction

### For $0.01 Test Payments:
- **Stripe fee**: $0.30 (minimum)
- **Net received**: -$0.29 (you'll pay the fee)
- **Recommendation**: Use $1.00 minimum for testing

## 🔧 Troubleshooting

### Common Issues:

1. **"Invalid API key"**
   - Check environment variables are set correctly
   - Ensure using test keys for development

2. **"Account not verified"**
   - Complete Stripe account verification process
   - Add bank account details

3. **"Payment failed"**
   - Use test credit card numbers from Stripe docs
   - Check browser console for detailed errors

### Debug Steps:
```javascript
// Add to CheckoutForm for debugging
console.log('Stripe loaded:', !!stripe);
console.log('Elements loaded:', !!elements);
console.log('Card element:', elements?.getElement(CardElement));
```

## 📚 Additional Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Test Credit Cards](https://stripe.com/docs/testing#cards)
- [Webhook Setup](https://stripe.com/docs/webhooks)

## 🎯 Next Steps

1. **Create Stripe account**
2. **Get API keys**
3. **Add bank account**
4. **Update environment variables**
5. **Test with $0.01 payments**
6. **Monitor Stripe dashboard for transactions**

---

**Need help?** Check the Stripe dashboard logs for detailed payment information and error messages.
