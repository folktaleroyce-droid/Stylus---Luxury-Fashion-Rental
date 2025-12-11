
// This service simulates a production-grade Payment Gateway SDK or API wrapper.
// In a real deployment, these functions would make secure fetch() calls to your backend 
// (which would then talk to Stripe/PayPal).

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  paymentMethod: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
  };
  userId: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  timestamp: string;
  error?: string;
}

const NETWORK_DELAY = 2000; // Simulate real API latency

export const PaymentService = {
  /**
   * Initializes a secure payment session.
   * In production, this would fetch a client_secret from Stripe.
   */
  initializeSession: async (): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`sess_${Math.random().toString(36).substr(2, 9)}`);
      }, 800);
    });
  },

  /**
   * Processes the payment with the gateway.
   */
  processPayment: async (req: PaymentRequest): Promise<PaymentResponse> => {
    console.group("💳 [Mock Payment API] Processing Request");
    console.log("Endpoint: POST /api/v1/charge");
    console.log("Payload:", { ...req, paymentMethod: '***REDACTED***' });
    console.groupEnd();

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock Validation Logic
        if (req.amount <= 0) {
          resolve({
            success: false,
            timestamp: new Date().toISOString(),
            error: "Invalid transaction amount."
          });
          return;
        }

        if (req.paymentMethod.number.endsWith('0000')) {
           resolve({
            success: false,
            timestamp: new Date().toISOString(),
            error: "Card declined by issuer."
          });
          return;
        }

        // Success Case
        resolve({
          success: true,
          transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          timestamp: new Date().toISOString()
        });
      }, NETWORK_DELAY);
    });
  },

  /**
   * Validates card format (Luhn algorithm simulation)
   */
  validateCard: (number: string): boolean => {
    const sanitized = number.replace(/\s/g, '');
    return sanitized.length >= 13 && sanitized.length <= 19 && /^\d+$/.test(sanitized);
  }
};
