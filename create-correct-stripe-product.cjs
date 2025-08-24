#!/usr/bin/env node

/**
 * Create Investimate Pro Product with $4.99/month pricing
 * This script creates the product and price in your Stripe account
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createInvestimateProProduct() {
  try {
    console.log('🚀 Creating Investimate Pro product with $4.99/month pricing...\n');

    // Create the product
    const product = await stripe.products.create({
      name: 'Investimate Pro',
      description: 'Unlimited property searches, advanced analytics, and premium features for real estate investors.',
      metadata: {
        features: 'unlimited_searches,advanced_analytics,premium_support',
        tier: 'pro'
      }
    });

    console.log('✅ Product created successfully:');
    console.log(`   ID: ${product.id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Description: ${product.description}\n`);

    // Create monthly price ($4.99/month)
    const monthlyPrice = await stripe.prices.create({
      unit_amount: 499, // $4.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1
      },
      product: product.id,
      nickname: 'Investimate Pro Monthly',
      metadata: {
        billing_period: 'monthly',
        original_price: '4.99'
      }
    });

    console.log('💰 Monthly price created:');
    console.log(`   Price ID: ${monthlyPrice.id}`);
    console.log(`   Amount: $${monthlyPrice.unit_amount / 100}/month`);
    console.log(`   Currency: ${monthlyPrice.currency.toUpperCase()}\n`);

    // Create annual price ($49.99/year - 17% discount)
    const annualPrice = await stripe.prices.create({
      unit_amount: 4999, // $49.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'year',
        interval_count: 1
      },
      product: product.id,
      nickname: 'Investimate Pro Annual',
      metadata: {
        billing_period: 'annual',
        original_price: '49.99',
        discount_percentage: '17'
      }
    });

    console.log('🎯 Annual price created:');
    console.log(`   Price ID: ${annualPrice.id}`);
    console.log(`   Amount: $${annualPrice.unit_amount / 100}/year`);
    console.log(`   Currency: ${annualPrice.currency.toUpperCase()}\n`);

    console.log('🔧 NEXT STEPS:');
    console.log('1. Copy the Monthly Price ID above');
    console.log('2. Update your SubscriptionPage.tsx file:');
    console.log(`   Replace: 'price_1QVKJfGFYvLxqOWTEqgbDtD8'`);
    console.log(`   With: '${monthlyPrice.id}'`);
    console.log('\n3. Optional: Use annual price for yearly subscriptions:');
    console.log(`   Annual Price ID: ${annualPrice.id}`);
    
    console.log('\n✅ Setup complete! Your Stripe products are ready.\n');

    return {
      product,
      monthlyPrice,
      annualPrice
    };

  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    
    if (error.code === 'api_key_invalid') {
      console.error('\n🔑 Please set your Stripe secret key:');
      console.error('   export STRIPE_SECRET_KEY=sk_test_your_key_here');
    }
    
    process.exit(1);
  }
}

async function main() {
  // Check if Stripe secret key is set
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY environment variable is required');
    console.error('\n📝 To set it:');
    console.error('   export STRIPE_SECRET_KEY=sk_test_your_key_here');
    console.error('\n🔍 Get your key from: https://dashboard.stripe.com/apikeys');
    process.exit(1);
  }

  const keyType = process.env.STRIPE_SECRET_KEY.startsWith('sk_live') ? 'LIVE' : 'TEST';
  console.log(`🔑 Using Stripe ${keyType} mode\n`);

  if (keyType === 'LIVE') {
    console.log('⚠️  WARNING: You are using LIVE mode. Real money will be charged.');
    console.log('   Make sure this is intentional for production.\n');
  }

  await createInvestimateProProduct();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createInvestimateProProduct };
