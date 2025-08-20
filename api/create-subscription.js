// Netlify serverless function for creating Stripe subscriptions
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { paymentMethodId, email, name, priceId } = JSON.parse(event.body);

    if (!paymentMethodId || !email || !priceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Create or retrieve customer
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    let customer;
    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: name,
      });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
    });

    // Handle subscription status
    if (subscription.status === 'active') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          subscriptionId: subscription.id,
          status: subscription.status,
        }),
      };
    } else if (subscription.status === 'incomplete') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          subscriptionId: subscription.id,
          status: 'requires_action',
          clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        }),
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Subscription creation failed',
        }),
      };
    }
  } catch (error) {
    console.error('Stripe error:', error);
    
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: error.message || 'An error occurred while processing your payment',
      }),
    };
  }
};
