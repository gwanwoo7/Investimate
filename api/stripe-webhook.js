// Netlify serverless function for handling Stripe webhooks
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
        console.log('Payment succeeded for invoice:', invoice.id);
        // Update user subscription status in your database
        // await updateUserSubscription(invoice.customer, 'active');
        break;

      case 'invoice.payment_failed':
        const failedInvoice = stripeEvent.data.object;
        console.log('Payment failed for invoice:', failedInvoice.id);
        // Handle failed payment - notify user, update subscription status
        // await updateUserSubscription(failedInvoice.customer, 'past_due');
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = stripeEvent.data.object;
        console.log('Subscription deleted:', deletedSubscription.id);
        // Update user subscription status in your database
        // await updateUserSubscription(deletedSubscription.customer, 'cancelled');
        break;

      case 'customer.subscription.created':
        const newSubscription = stripeEvent.data.object;
        console.log('New subscription created:', newSubscription.id);
        // Update user subscription status in your database
        // await updateUserSubscription(newSubscription.customer, 'active');
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = stripeEvent.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        // Handle subscription updates (plan changes, etc.)
        // await updateUserSubscription(updatedSubscription.customer, updatedSubscription.status);
        break;

      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ received: true }),
    };

  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
};
