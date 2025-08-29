// Quick script to list all products in your Stripe account
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function listProducts() {
  try {
    const products = await stripe.products.list({
      active: true,
      limit: 20,
    });

    console.log('\n🛍️  All Active Products in your Stripe Account:');
    console.log('=' .repeat(50));
    
    if (products.data.length === 0) {
      console.log('❌ No products found in your Stripe account.');
      console.log('\n💡 You need to create a product:');
      console.log('   1. Go to https://dashboard.stripe.com/products');
      console.log('   2. Click "Add Product"');
      console.log('   3. Create "Investimate Pro" with $4.99/month pricing');
      return;
    }

    products.data.forEach((product, index) => {
      console.log(`\n${index + 1}. 📦 ${product.name}`);
      console.log(`   🆔 Product ID: ${product.id}`);
      console.log(`   📝 Description: ${product.description || 'No description'}`);
      console.log(`   📅 Created: ${new Date(product.created * 1000).toLocaleDateString()}`);
    });

    console.log('\n🎯 Next Step: Get prices for a specific product');
    console.log('Update get-price-id.js with the correct Product ID from above.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listProducts();
