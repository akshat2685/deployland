/**
 * DeployLand Payment & UPI Configuration
 */
export const PAYMENT_CONFIG = {
  // UPI ID for direct QR scanner & payment transfers:
  upiId: import.meta.env.VITE_UPI_ID || 'i.jain.akshat@okhdfcbank',
  merchantName: 'Akshat Jain - DeployLand',
  
  // Custom payment or Topmate URL (optional fallback):
  directPaymentLink: import.meta.env.VITE_PAYMENT_URL || 'https://topmate.io/akshat_jain144',
  
  courseId: 'cicd',
  currency: 'INR',
  priceAmount: 499,
  courseTitle: 'CI VALLEY — LIFETIME CAMPAIGN ACCESS'
};


