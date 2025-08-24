# 🔧 Fix Stripe Price ID Error - Quick Setup Guide

## ❌ Current Error
```
No such price: 'price_1QVKJfGFYvLxqOWTEqgbDtD8'
```

This error means the price ID in your code doesn't exist in your Stripe account. Here's how to fix it:

## 🚀 STEP 1: Create Product in Stripe Dashboard

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Navigate to**: Products → Product catalog
3. **Click**: "Add product"
4. **Fill in details**:
   - **Name**: `Investimate Pro`
   - **Description**: `Unlimited property searches, advanced analytics, and premium features for real estate investors`

## 💰 STEP 2: Add Pricing

5. **Pricing Model**: Select "Standard pricing"
6. **Price**: Enter `4.99`
7. **Currency**: USD
8. **Billing Period**: Monthly
9. **Click**: "Save product"

## 🔑 STEP 3: Get the Price ID

10. **After saving**, you'll see the product page
11. **Copy the Price ID** (starts with `price_`) - it will look like:
    ```
    price_1AbC2dEfGhIjKlMn
    ```

## 🔧 STEP 4: Update Your Code

12. **Open**: `src/pages/SubscriptionPage.tsx`
13. **Find line 117** (approximately):
    ```typescript
    priceId: 'price_1QVKJfGFYvLxqOWTEqgbDtD8', // Pro monthly price
    ```
14. **Replace** with your new Price ID:
    ```typescript
    priceId: 'price_YOUR_NEW_PRICE_ID_HERE', // Pro monthly price
    ```

## ✅ STEP 5: Test the Fix

15. **Save the file**
16. **Test the upgrade flow** in your app
17. **Should now work without the error**

---

## 🎯 Alternative: Use Environment Variable

For better security, you can also set the price ID as an environment variable:

### In your `.env` file:
```env
VITE_STRIPE_PRICE_ID_MONTHLY=price_your_new_price_id_here
```

### In `SubscriptionPage.tsx`:
```typescript
priceId: import.meta.env.VITE_STRIPE_PRICE_ID_MONTHLY,
```

---

## 🔍 Quick Check: Are you in Test or Live mode?

- **Test mode**: Price IDs start with `price_` and work with test cards (4242...)
- **Live mode**: Price IDs start with `price_` and charge real money

Make sure you create the product in the same mode (test/live) that your app is using!

## 🆘 Still Having Issues?

If you continue to get the error:
1. **Double-check** the Price ID was copied correctly (no extra spaces)
2. **Verify** you're in the correct Stripe mode (test vs live)
3. **Confirm** the product was created successfully in your Stripe dashboard

Your upgrade flow should work perfectly after following these steps! 🚀
