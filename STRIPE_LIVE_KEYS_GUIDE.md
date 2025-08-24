# 🔑 How to Get Live Stripe Keys from Stripe Dashboard

## Step-by-Step Guide to Switch from Test to Live Mode

### Step 1: Access Your Stripe Dashboard
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Log in with your Stripe account credentials
3. You should see your dashboard with test data

### Step 2: Switch to Live Mode
1. **Look at the top-left corner** of your dashboard
2. You'll see a toggle that says **"Test mode"** with a switch
3. **Click the toggle** to switch from "Test mode" to **"Live mode"**
4. The interface will change to show live/production data

### Step 3: Get Your Live API Keys
1. Once in **Live mode**, click on **"Developers"** in the left sidebar
2. Click on **"API keys"** 
3. You'll now see your **Live API keys** (not test keys)

### Step 4: Copy Your Live Keys

#### Publishable Key (Safe to expose):
```
pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- This starts with `pk_live_`
- Copy this key - it's safe to use in your frontend code

#### Secret Key (Keep this private!):
```
sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
- This starts with `sk_live_`
- **NEVER expose this key publicly**
- This goes in your server environment variables only

### Step 5: Update Your Environment Variables

#### For Local Development (.env file):
```bash
# Replace these test keys with your live keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_live_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_actual_live_secret_key_here
```

#### For Netlify Production:
1. Go to your Netlify site dashboard
2. Go to **Site settings** → **Environment variables**
3. Update these variables:
   - `VITE_STRIPE_PUBLISHABLE_KEY` = your live publishable key
   - `STRIPE_SECRET_KEY` = your live secret key

### Step 6: Remove Test Mode Warning
Once you switch to live keys, update your SubscriptionPage to remove the test card warning:

```tsx
// Remove this alert from your payment dialog:
<Alert severity="warning" sx={{ mb: 2 }}>
  <Typography variant="body2">
    <strong>Test Mode:</strong> Use test card <strong>4242424242424242</strong>...
  </Typography>
</Alert>
```

## Important Security Notes

### 🔒 Secret Key Security:
- **NEVER** commit secret keys to Git
- **NEVER** expose secret keys in frontend code
- Only use secret keys in server-side code (Netlify functions)
- Consider using environment variable management tools

### 🧪 Testing Before Going Live:
1. **Test with small amounts first** (like $0.50)
2. **Use your own real card** for initial testing
3. **Verify webhooks work** in live mode
4. **Check your Stripe Dashboard** for successful payments

### 💳 Live Payment Differences:
- **Real money will be charged** 
- **Real credit cards required**
- **Stripe fees apply** (usually 2.9% + 30¢ per transaction)
- **Customer disputes possible**
- **PCI compliance required**

## Visual Guide

### Test Mode vs Live Mode Toggle:
```
┌─────────────────────────────────────┐
│ 🏠 Dashboard                        │
│                                     │
│ [ Test mode  ○ ] ← Click this!     │
│                                     │
│ After clicking:                     │
│ [ Live mode  ● ] ← Now in live!    │
└─────────────────────────────────────┘
```

### Key Differences:
| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| Keys start with | `pk_test_` / `sk_test_` | `pk_live_` / `sk_live_` |
| Money charged | **No** (fake transactions) | **Yes** (real money) |
| Cards accepted | Test cards only | Real cards only |
| Fees | None | 2.9% + 30¢ |
| Dashboard color | **Orange** header | **Blue** header |

## Verification Checklist

Before going live, ensure:
- [ ] Live keys obtained from Stripe Dashboard
- [ ] Environment variables updated (local and Netlify)
- [ ] Test mode warnings removed from UI
- [ ] Small test payment completed successfully
- [ ] Webhook endpoints updated for live mode
- [ ] Customer support process ready
- [ ] Refund/cancellation process documented

## Troubleshooting

### Common Issues:
1. **"Invalid API key"** → Make sure you copied the full key
2. **"This key cannot be used in live mode"** → You're still using test keys
3. **"Payment declined"** → Real card issues (insufficient funds, etc.)
4. **Webhook not working** → Update webhook URLs in Stripe for live mode

### Support Resources:
- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [API Reference](https://stripe.com/docs/api)

---

**⚠️ Remember**: Once you switch to live keys, **real money will be charged**. Test thoroughly before releasing to users!

**Next Steps**: 
1. Get your live keys from the dashboard
2. Update environment variables
3. Test with your own card first
4. Remove test mode warnings
5. Deploy to production
