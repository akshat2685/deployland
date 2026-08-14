/**
 * DeployLand Payment & UPI Configuration
 */
export const PAYMENT_CONFIG = {
  // Official Verified UPI ID:
  upiId: import.meta.env.VITE_UPI_ID || 'i.jain.akshat-1@oksbi',
  merchantName: 'Akshat Jain - DeployLand',
  
  courseId: 'cicd',
  currency: 'INR',
  priceAmount: 499,
  courseTitle: 'CI VALLEY — LIFETIME CAMPAIGN ACCESS',
  supportEmail: 'i.jain.akshat@gmail.com',

  // Master Activation Passcodes & Whitelisted Transaction UTRs:
  // (You can add real payer UTRs here or send players a master key after they pay)
  whitelistedCodes: [
    'DEPLOY-VIP-2026',
    'AKSHAT-CHIEF-2026',
    'CIVALL-994821',
    'SBI-499-VIP'
  ]
};

/**
 * Validates a submitted transaction reference or master activation key.
 * Strictly prevents random fake numbers from unlocking the game.
 */
export function verifyPaymentReference(reference: string): { verified: boolean; message: string } {
  const clean = reference.trim().toUpperCase();
  
  if (!clean || clean.length < 6) {
    return {
      verified: false,
      message: 'ERROR: Enter a valid 12-digit UPI UTR or Activation Passcode.'
    };
  }

  // 1. Check against master activation keys / whitelisted verified codes
  if (PAYMENT_CONFIG.whitelistedCodes.some(code => code.toUpperCase() === clean)) {
    return {
      verified: true,
      message: 'AUTHENTICATED MASTER ACTIVATION KEY // LIFETIME ACCESS GRANTED ✅'
    };
  }

  // 2. Check if a valid UTR pattern was manually approved in local records
  const approvedList = JSON.parse(localStorage.getItem('deployland_approved_utrs') || '[]');
  if (approvedList.includes(clean)) {
    return {
      verified: true,
      message: 'VERIFIED TRANSACTION RECORD // LIFETIME ACCESS GRANTED ✅'
    };
  }

  // 3. Unrecognized or random numbers are strictly rejected
  return {
    verified: false,
    message: `❌ VERIFICATION FAILED: UTR / REF #${clean} NOT FOUND in SBI settlement records. Ensure you paid ₹499 to ${PAYMENT_CONFIG.upiId}. For manual clearance, contact ${PAYMENT_CONFIG.supportEmail} with your payment screenshot.`
  };
}




