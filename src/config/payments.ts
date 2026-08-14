/**
 * DeployLand Payment & Checkout Configuration
 * 
 * You can set your direct payment link here or via VITE_PAYMENT_URL environment variable.
 */
export const PAYMENT_CONFIG = {
  // Replace this with your custom Stripe Payment Link or Checkout URL:
  directPaymentLink: import.meta.env.VITE_PAYMENT_URL || 'https://buy.stripe.com/test_deployland_lifetime',
  courseId: 'cicd',
  currency: 'INR',
  priceAmount: 499,
  courseTitle: 'CI VALLEY — LIFETIME ACCESS'
};
