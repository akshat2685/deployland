import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_123');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'http://localhost:54321', 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy'
);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_123';

export const app = express();
app.use(cors());

app.post('/api/checkout', express.json(), async (req, res) => {
  try {
    const { userId, courseId, productId } = req.body;
    
    if (!userId || !courseId || !productId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: { name: `${courseId.toUpperCase()} Full Access` },
          unit_amount: 49900, // 499 INR in paise
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `http://localhost:5173/?success=true`,
      cancel_url: `http://localhost:5173/?canceled=true`,
      metadata: {
        userId,
        courseId,
        productId,
      },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig as string, endpointSecret);
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, courseId, productId } = session.metadata || {};

    if (userId && courseId && productId) {
      const purchaseId = `stripe_${session.id}`;

      // Insert purchase idempotently
      const { error: purchaseError } = await supabase.from('purchases').insert({
        id: purchaseId,
        userId,
        productId,
        provider: 'stripe',
        providerOrderId: session.id,
        providerPaymentId: session.payment_intent as string,
        amount: session.amount_total,
        currency: session.currency,
        status: 'successful',
        createdAt: Date.now(),
        completedAt: Date.now()
      });

      // If it fails with duplicate key error (23505), it's already processed, which is fine (idempotent).
      // We still try to ensure entitlement exists.

      const entitlementId = `${userId}_${productId}`;
      await supabase.from('entitlements').upsert({
        id: entitlementId,
        userId,
        courseId,
        productId,
        type: 'lifetime',
        status: 'active',
        grantedAt: Date.now()
      });
    }
  }
  res.json({ received: true });
});

if (require.main === module) {
  app.listen(3000, () => console.log('Server running on port 3000'));
}
