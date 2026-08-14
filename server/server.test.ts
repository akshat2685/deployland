import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './server';

// Mock dependencies
vi.mock('stripe', () => {
  return {
    default: class {
      checkout = {
        sessions: {
          create: vi.fn().mockResolvedValue({ url: 'http://mock-checkout.com/pay', id: 'cs_test_123', payment_intent: 'pi_test_123', amount_total: 49900, currency: 'inr' })
        }
      };
      webhooks = {
        constructEvent: vi.fn((body, sig, secret) => {
          if (sig === 'invalid') throw new Error('Invalid signature');
          return JSON.parse(body.toString());
        })
      };
    }
  };
});

// Mock Supabase
const mockInsert = vi.fn();
const mockUpsert = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table === 'purchases') {
        return {
          insert: (data: any) => {
            if (data.id === 'stripe_cs_test_duplicate') {
              return { error: { code: '23505' } };
            }
            mockInsert(data);
            return { error: null };
          }
        };
      }
      if (table === 'entitlements') {
        return {
          upsert: (data: any) => {
            mockUpsert(data);
            return { error: null };
          }
        };
      }
      return {};
    }
  })
}));

describe('Server API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/checkout', () => {
    it('creates a checkout session successfully', async () => {
      const res = await request(app)
        .post('/api/checkout')
        .send({ userId: 'u1', courseId: 'cicd', productId: 'cicd_full' });
      
      expect(res.status).toBe(200);
      expect(res.body.url).toBe('http://mock-checkout.com/pay');
    });

    it('fails if fields are missing', async () => {
      const res = await request(app).post('/api/checkout').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/webhook', () => {
    const payload = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          payment_intent: 'pi_123',
          amount_total: 49900,
          currency: 'inr',
          metadata: { userId: 'u1', courseId: 'cicd', productId: 'cicd_full' }
        }
      }
    };

    it('handles valid webhook and creates purchase + entitlement', async () => {
      const res = await request(app)
        .post('/api/webhook')
        .set('stripe-signature', 'valid_sig')
        .send(payload);

      expect(res.status).toBe(200);
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        id: 'stripe_cs_test_123',
        userId: 'u1',
        productId: 'cicd_full',
        provider: 'stripe',
        status: 'successful'
      }));
      expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({
        id: 'u1_cicd_full',
        userId: 'u1',
        courseId: 'cicd',
        type: 'lifetime'
      }));
    });

    it('rejects invalid signature', async () => {
      const res = await request(app)
        .post('/api/webhook')
        .set('stripe-signature', 'invalid')
        .send(payload);

      expect(res.status).toBe(400);
      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('handles duplicate webhook calls gracefully (idempotency)', async () => {
      const dupPayload = {
        ...payload,
        data: {
          object: {
            ...payload.data.object,
            id: 'cs_test_duplicate'
          }
        }
      };

      const res = await request(app)
        .post('/api/webhook')
        .set('stripe-signature', 'valid_sig')
        .send(dupPayload);

      // Insert fails but it proceeds to ensure entitlement
      expect(res.status).toBe(200);
      expect(mockUpsert).toHaveBeenCalled(); // Entitlement still checked/granted
    });
  });
});
