// Quick script to get the Price ID from your Product ID
// Run this with: node get-price-id.js

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getPriceId() {
  try {
    const productId = 'prod_SttLdukjZSxFFc'; // Investimate Pro
    
    // Get all prices for this product
    const prices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    console.log('\n🎯 Product:', productId);
    console.log('📋 Found', prices.data.length, 'active prices:');
    
    prices.data.forEach((price, index) => {
      console.log(`\n${index + 1}. Price ID: ${price.id}`);
      console.log(`   Amount: $${(price.unit_amount / 100).toFixed(2)}`);
      console.log(`   Currency: ${price.currency.toUpperCase()}`);
      console.log(`   Interval: ${price.recurring?.interval || 'one-time'}`);
      console.log(`   Created: ${new Date(price.created * 1000).toLocaleDateString()}`);
    });

    if (prices.data.length > 0) {
      const priceId = prices.data[0].id;
      console.log(`\n✅ Use this Price ID in your code: ${priceId}`);
      return priceId;
    } else {
      console.log('\n❌ No active prices found for this product.');
      console.log('💡 You need to create a price in your Stripe Dashboard:');
      console.log('   1. Go to https://dashboard.stripe.com/products');
      console.log(`   2. Click on product ${productId}`);
      console.log('   3. Add a new price: $4.99/month recurring');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'resource_missing') {
      console.log('\n💡 Product not found. Please check:');
      console.log('   1. Product ID is correct: prod_Sts092Vx8bnEGz');
      console.log('   2. You\'re using the right Stripe account');
      console.log('   3. Product exists in your dashboard');
    }
  }
}

getPriceId();
