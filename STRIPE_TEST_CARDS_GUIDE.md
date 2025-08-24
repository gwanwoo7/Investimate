# 💳 Stripe Test Cards Guide

## Current Mode: TEST MODE ✅
Your application is currently configured for **test payments only**. No real money will be charged.

## Test Card Numbers

### ✅ Successful Test Cards
Use these card numbers for successful test payments:

| Card Type | Number | Expiry | CVC | ZIP |
|-----------|--------|---------|-----|-----|
| **Visa** | `4242424242424242` | `12/25` | `123` | `12345` |
| **Mastercard** | `5555555555554444` | `12/25` | `123` | `12345` |
| **American Express** | `378282246310005` | `12/25` | `1234` | `12345` |

### ❌ Test Failure Cards
Use these to test error scenarios:

| Scenario | Card Number | Result |
|----------|-------------|---------|
| **Declined** | `4000000000000002` | Generic decline |
| **Insufficient Funds** | `4000000000000009` | Insufficient funds |
| **Expired Card** | `4000000000000069` | Expired card |
| **Incorrect CVC** | `4000000000000127` | Incorrect CVC |

### 🔐 3D Secure Test Cards
For testing authentication flows:

| Card Number | 3D Secure Behavior |
|-------------|-------------------|
| `4000002500003155` | Requires authentication |
| `4000002760003184` | Authentication fails |

## How to Test Payment

### Step 1: Navigate to Subscription
1. Go to your application
2. Click "Start Pro Subscription" 
3. Payment dialog opens

### Step 2: Enter Test Card Details
```
Card Number: 4242424242424242
Expiry: 12/25
CVC: 123
ZIP: 12345
Name: Test User
Email: test@example.com
```

### Step 3: Submit Payment
- Click "Subscribe Now - $4.99/month"
- Payment should process successfully
- You should see: "Welcome to Investimate Pro! 🎉"

## Important Notes

### ⚠️ Test Mode Only
- **NO REAL MONEY** will be charged
- Only Stripe test card numbers work
- Real credit cards will be declined
- Perfect for development and testing

### 🚀 Going Live
When ready for production:
1. Replace test keys with live keys in environment variables
2. Update `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY`
3. Test with real cards in live mode
4. Enable live payments in Stripe Dashboard

### 🔍 Monitoring Test Payments
- View test payments in [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
- Check logs for payment processing
- Monitor subscription creation in test environment

## Troubleshooting

### Common Issues:
1. **Real card declined**: Use test card numbers instead
2. **"Invalid card"**: Ensure using exact test card format
3. **Payment fails**: Check console for detailed error messages
4. **Subscription not created**: Verify price ID is correct

### Support:
- Test payments should work immediately with provided card numbers
- Check browser console for detailed error messages
- Verify Stripe keys are properly configured

---

**Status**: Ready for testing with Stripe test cards  
**Next Step**: Use card `4242424242424242` to test Pro subscription
