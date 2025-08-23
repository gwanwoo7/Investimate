import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// This would run on your backend (Netlify Functions, Vercel, etc.)
// File: netlify/functions/stripe-webhook.ts

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin access
);

export const handler = async (event: any) => {
  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let stripeEvent: Stripe.Event;

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Webhook signature verification failed' }),
    };
  }

  console.log(`Processing webhook event: ${stripeEvent.type}`);

  try {
    switch (stripeEvent.type) {
      // ====================================
      // CUSTOMER EVENTS
      // ====================================
      case 'customer.created':
        await handleCustomerCreated(stripeEvent.data.object as Stripe.Customer);
        break;

      case 'customer.updated':
        await handleCustomerUpdated(stripeEvent.data.object as Stripe.Customer);
        break;

      // ====================================
      // SUBSCRIPTION EVENTS
      // ====================================
      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(stripeEvent.data.object as Stripe.Subscription);
        break;

      // ====================================
      // INVOICE EVENTS
      // ====================================
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(stripeEvent.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(stripeEvent.data.object as Stripe.Invoice);
        break;

      case 'invoice.upcoming':
        await handleInvoiceUpcoming(stripeEvent.data.object as Stripe.Invoice);
        break;

      // ====================================
      // PAYMENT EVENTS
      // ====================================
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object as Stripe.PaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// ====================================
// CUSTOMER HANDLERS
// ====================================

async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('Customer created:', customer.id);

  if (!customer.email) {
    console.error('Customer has no email');
    return;
  }

  // Find user by email and update their Stripe customer ID
  const { error } = await supabase
    .from('users')
    .update({ stripe_customer_id: customer.id })
    .eq('email', customer.email);

  if (error) {
    console.error('Error updating user with customer ID:', error);
  }

  await logAuditEvent(null, 'customer_created', 'customer', customer.id, {
    email: customer.email,
    stripe_data: customer
  });
}

async function handleCustomerUpdated(customer: Stripe.Customer) {
  console.log('Customer updated:', customer.id);

  const { error } = await supabase
    .from('users')
    .update({
      full_name: customer.name || undefined,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customer.id);

  if (error) {
    console.error('Error updating customer:', error);
  }
}

// ====================================
// SUBSCRIPTION HANDLERS
// ====================================

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);

  const userId = await getUserIdFromCustomer(subscription.customer as string);
  if (!userId) {
    console.error('Could not find user for subscription');
    return;
  }

  // Determine subscription tier from price ID
  const tier = getSubscriptionTier(subscription);
  const planName = getSubscriptionPlanName(subscription);

  // Insert subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      id: subscription.id,
      user_id: userId,
      status: subscription.status,
      plan_id: subscription.items.data[0]?.price?.id || '',
      plan_name: planName,
      unit_amount: subscription.items.data[0]?.price?.unit_amount || 0,
      currency: subscription.currency,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      trial_start: (subscription as any).trial_start ? new Date((subscription as any).trial_start * 1000).toISOString() : null,
      trial_end: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      stripe_data: subscription
    });

  if (subError) {
    console.error('Error inserting subscription:', subError);
    return;
  }

  // Update user record
  const updates: any = {
    subscription_status: subscription.status,
    subscription_tier: tier,
    stripe_subscription_id: subscription.id,
    subscription_starts_at: new Date((subscription as any).current_period_start * 1000).toISOString(),
    subscription_ends_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };

  // Handle trial period
  if ((subscription as any).trial_end) {
    updates.trial_starts_at = (subscription as any).trial_start ? 
      new Date((subscription as any).trial_start * 1000).toISOString() : 
      new Date().toISOString();
    updates.trial_ends_at = new Date((subscription as any).trial_end * 1000).toISOString();
  }

  const { error: userError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (userError) {
    console.error('Error updating user subscription:', userError);
  }

  await logAuditEvent(userId, 'subscription_created', 'subscription', subscription.id, {
    tier,
    plan_name: planName,
    trial_end: (subscription as any).trial_end
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  const userId = await getUserIdFromSubscription(subscription.id);
  if (!userId) {
    console.error('Could not find user for subscription');
    return;
  }

  const tier = getSubscriptionTier(subscription);
  const planName = getSubscriptionPlanName(subscription);

  // Update subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      plan_id: subscription.items.data[0]?.price?.id || '',
      plan_name: planName,
      unit_amount: subscription.items.data[0]?.price?.unit_amount || 0,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      trial_start: (subscription as any).trial_start ? new Date((subscription as any).trial_start * 1000).toISOString() : null,
      trial_end: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000).toISOString() : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: (subscription as any).canceled_at ? new Date((subscription as any).canceled_at * 1000).toISOString() : null,
      stripe_data: subscription,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscription.id);

  if (subError) {
    console.error('Error updating subscription:', subError);
    return;
  }

  // Update user record
  const updates: any = {
    subscription_status: subscription.status,
    subscription_tier: tier,
    subscription_ends_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString()
  };

  // Handle cancellation
  if ((subscription as any).canceled_at || subscription.status === 'canceled') {
    updates.subscription_status = 'canceled';
    updates.subscription_tier = 'free';
  }

  const { error: userError } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (userError) {
    console.error('Error updating user subscription:', userError);
  }

  await logAuditEvent(userId, 'subscription_updated', 'subscription', subscription.id, {
    status: subscription.status,
    tier,
    canceled: subscription.canceled_at !== null
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  const userId = await getUserIdFromSubscription(subscription.id);
  if (!userId) {
    console.error('Could not find user for subscription');
    return;
  }

  // Update subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', subscription.id);

  if (subError) {
    console.error('Error updating deleted subscription:', subError);
  }

  // Downgrade user to free tier
  const { error: userError } = await supabase
    .from('users')
    .update({
      subscription_status: 'canceled',
      subscription_tier: 'free',
      stripe_subscription_id: null,
      subscription_ends_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (userError) {
    console.error('Error downgrading user:', userError);
  }

  await logAuditEvent(userId, 'subscription_canceled', 'subscription', subscription.id, {
    reason: 'subscription_deleted'
  });
}

async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log('Trial will end:', subscription.id);

  const userId = await getUserIdFromSubscription(subscription.id);
  if (!userId) return;

  await logAuditEvent(userId, 'trial_ending', 'subscription', subscription.id, {
    trial_end: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000).toISOString() : null
  });

  // Here you could send an email notification to the user
  // about their trial ending soon
}

// ====================================
// PAYMENT HANDLERS
// ====================================

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id);

  if (!(invoice as any).subscription) return;

  const userId = await getUserIdFromSubscription((invoice as any).subscription as string);
  if (!userId) return;

  // Record payment
  const { error } = await supabase
    .from('payments')
    .insert({
      id: (invoice as any).payment_intent as string || `invoice_${invoice.id}`,
      user_id: userId,
      subscription_id: (invoice as any).subscription as string,
      amount: invoice.amount_paid || 0,
      currency: invoice.currency || 'usd',
      status: 'succeeded',
      stripe_invoice_id: invoice.id || '',
      billing_reason: (invoice as any).billing_reason || 'subscription_cycle',
      stripe_data: invoice,
      processed_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error recording payment:', error);
  }

  // Update user's last payment date
  await supabase
    .from('users')
    .update({
      last_payment_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  await logAuditEvent(userId, 'payment_succeeded', 'payment', invoice.id || '', {
    amount: invoice.amount_paid,
    currency: invoice.currency
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);

  if (!(invoice as any).subscription) return;

  const userId = await getUserIdFromSubscription((invoice as any).subscription as string);
  if (!userId) return;

  // Record failed payment
  const { error } = await supabase
    .from('payments')
    .insert({
      id: (invoice as any).payment_intent as string || `failed_${invoice.id}`,
      user_id: userId,
      subscription_id: (invoice as any).subscription as string,
      amount: invoice.amount_due || 0,
      currency: invoice.currency || 'usd',
      status: 'failed',
      stripe_invoice_id: invoice.id || '',
      billing_reason: (invoice as any).billing_reason || 'subscription_cycle',
      stripe_data: invoice,
      processed_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error recording failed payment:', error);
  }

  await logAuditEvent(userId, 'payment_failed', 'payment', invoice.id || '', {
    amount: invoice.amount_due,
    currency: invoice.currency,
    attempt_count: (invoice as any).attempt_count
  });
}

async function handleInvoiceUpcoming(invoice: Stripe.Invoice) {
  console.log('Upcoming invoice:', invoice.id);

  if (!(invoice as any).subscription) return;

  const userId = await getUserIdFromSubscription((invoice as any).subscription as string);
  if (!userId) return;

  // Update next billing date
  await supabase
    .from('users')
    .update({
      next_billing_date: new Date((invoice as any).period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  await logAuditEvent(userId, 'invoice_upcoming', 'invoice', invoice.id || '', {
    amount: invoice.amount_due,
    period_end: new Date((invoice as any).period_end * 1000).toISOString()
  });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  // Additional payment processing if needed
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  // Additional failed payment handling if needed
}

// ====================================
// HELPER FUNCTIONS
// ====================================

async function getUserIdFromCustomer(customerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error || !data) {
    console.error('Error finding user by customer ID:', error);
    return null;
  }

  return data.id;
}

async function getUserIdFromSubscription(subscriptionId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('id', subscriptionId)
    .single();

  if (error || !data) {
    console.error('Error finding user by subscription ID:', error);
    return null;
  }

  return data.user_id;
}

function getSubscriptionTier(subscription: Stripe.Subscription): string {
  const priceId = subscription.items.data[0]?.price?.id;
  
  // Map your Stripe price IDs to tiers
  if (priceId?.includes('pro') || priceId?.includes('premium')) {
    return 'pro';
  }
  if (priceId?.includes('enterprise')) {
    return 'enterprise';
  }
  
  return 'free';
}

function getSubscriptionPlanName(subscription: Stripe.Subscription): string {
  const price = subscription.items.data[0]?.price;
  
  if (!price) return 'Unknown Plan';
  
  const tier = getSubscriptionTier(subscription);
  const interval = price.recurring?.interval || 'month';
  
  return `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${interval}ly`;
}

async function logAuditEvent(
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: any
): Promise<void> {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata: metadata ? JSON.stringify(metadata) : null,
        success: true
      });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}
