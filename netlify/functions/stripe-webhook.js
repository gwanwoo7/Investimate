// Netlify serverless function for handling Stripe webhooks
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Helper function to update user subscription in localStorage-based database
// In production, this would connect to your real database
const updateUserSubscriptionStatus = async (customerEmail, isActive) => {
  try {
    console.log(`📧 Updating subscription for customer: ${customerEmail} to ${isActive ? 'active' : 'inactive'}`);
    
    // For localStorage-based system, we can't directly update from server
    // Instead, log the action and rely on client-side sync
    console.log(`✅ Subscription update logged for ${customerEmail}`);
    
    // In a real production environment, you would:
    // 1. Query your database for user by email
    // 2. Update their subscription status
    // 3. Send confirmation email
    
    return true;
  } catch (error) {
    console.error('❌ Failed to update user subscription:', error);
    return false;
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Webhook signature verification failed' }),
    };
  }

  // Handle the event
  try {
    switch (stripeEvent.type) {
      case 'invoice.payment_succeeded':
        const invoice = stripeEvent.data.object;
        console.log('💳 Payment succeeded for invoice:', invoice.id);
        
        // Get customer details to find email
        const customer = await stripe.customers.retrieve(invoice.customer);
        if (customer && customer.email) {
          await updateUserSubscriptionStatus(customer.email, true);
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = stripeEvent.data.object;
        console.log('❌ Payment failed for invoice:', failedInvoice.id);
        
        const failedCustomer = await stripe.customers.retrieve(failedInvoice.customer);
        if (failedCustomer && failedCustomer.email) {
          await updateUserSubscriptionStatus(failedCustomer.email, false);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = stripeEvent.data.object;
        console.log('🗑️ Subscription deleted:', deletedSubscription.id);
        
        const deletedCustomer = await stripe.customers.retrieve(deletedSubscription.customer);
        if (deletedCustomer && deletedCustomer.email) {
          await updateUserSubscriptionStatus(deletedCustomer.email, false);
        }
        break;

      case 'customer.subscription.created':
        const newSubscription = stripeEvent.data.object;
        console.log('✨ New subscription created:', newSubscription.id);
        
        const newCustomer = await stripe.customers.retrieve(newSubscription.customer);
        if (newCustomer && newCustomer.email) {
          await updateUserSubscriptionStatus(newCustomer.email, true);
        }
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = stripeEvent.data.object;
        console.log('🔄 Subscription updated:', updatedSubscription.id, 'Status:', updatedSubscription.status);
        
        const updatedCustomer = await stripe.customers.retrieve(updatedSubscription.customer);
        if (updatedCustomer && updatedCustomer.email) {
          const isActive = ['active', 'trialing'].includes(updatedSubscription.status);
          await updateUserSubscriptionStatus(updatedCustomer.email, isActive);
        }
        break;

      default:
        console.log(`ℹ️ Unhandled event type ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        received: true,
        eventType: stripeEvent.type,
        timestamp: new Date().toISOString()
      }),
    };

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Webhook processing failed',
        details: error.message
      }),
    };
  }
};
