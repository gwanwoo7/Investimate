// Script to create the Investimate Pro product and price in Stripe
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createInvestimateProduct() {
  try {
    console.log('🚀 Creating Investimate Pro product...');
    
    // Create the product
    const product = await stripe.products.create({
      name: 'Investimate Pro',
      description: 'Premium real estate investment analysis with unlimited property searches, advanced analytics, and exclusive features.',
      images: [], // Add product images if you have them
      metadata: {
        type: 'subscription',
        category: 'real-estate-tools'
      }
    });

    console.log(`✅ Product created: ${product.id}`);
    console.log(`📦 Product name: ${product.name}`);

    // Create the price (subscription)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 499, // $4.99 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      nickname: 'Investimate Pro Monthly',
    });

    console.log(`✅ Price created: ${price.id}`);
    console.log(`💰 Price: $${price.unit_amount / 100}/month`);

    console.log('\n🎯 UPDATE YOUR CODE:');
    console.log('=' .repeat(50));
    console.log(`Product ID: ${product.id}`);
    console.log(`Price ID: ${price.id}`);
    console.log('\nReplace in SubscriptionPage.tsx:');
    console.log(`priceId: '${price.id}'`);

    return { product, price };

  } catch (error) {
    console.error('❌ Error creating product:', error.message);
    
    if (error.code === 'api_key_invalid') {
      console.log('\n💡 API Key Issue:');
      console.log('   1. Check your STRIPE_SECRET_KEY in .env.local');
      console.log('   2. Make sure it starts with sk_test_ or sk_live_');
      console.log('   3. Verify the key is from the correct Stripe account');
    }
  }
}

createInvestimateProduct();
