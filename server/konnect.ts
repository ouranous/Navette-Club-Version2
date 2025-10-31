import axios from 'axios';
import { getAppDomain } from './replitAuth';

if (!process.env.KONNECT_API_KEY) {
  throw new Error("KONNECT_API_KEY environment variable is required");
}

if (!process.env.KONNECT_RECEIVER_WALLET) {
  throw new Error("KONNECT_RECEIVER_WALLET environment variable is required");
}

const KONNECT_API_BASE_URL = 'https://api.konnect.network/api/v2';

const KONNECT_API_KEY = process.env.KONNECT_API_KEY;
const RECEIVER_WALLET_ID = process.env.KONNECT_RECEIVER_WALLET;

export interface KonnectPaymentRequest {
  amount: number; // Amount in TND (will be converted to millimes)
  orderId: string;
  bookingType: 'transfer' | 'disposal' | 'tour';
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  description: string;
}

export interface KonnectPaymentResponse {
  payUrl: string;
  paymentRef: string;
}

export interface KonnectPaymentDetails {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  amount: number;
  amountDue: number;
  reachedAmount: number;
  token: string;
  orderId: string;
  expirationDate?: string;
  transactions?: any[];
}

/**
 * Initialize a payment with Konnect
 */
export async function initKonnectPayment(
  paymentRequest: KonnectPaymentRequest
): Promise<KonnectPaymentResponse> {
  try {
    const baseUrl = getAppDomain();
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const fullBaseUrl = `${protocol}://${baseUrl}`;

    // Convert amount to millimes (1 TND = 1000 millimes)
    const amountInMillimes = Math.round(paymentRequest.amount * 1000);

    const payload = {
      receiverWalletId: RECEIVER_WALLET_ID,
      token: "TND",
      amount: amountInMillimes,
      type: "immediate",
      description: paymentRequest.description,
      acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
      lifespan: 30, // 30 minutes
      checkoutForm: false, // Don't show Konnect's checkout form (we collect data ourselves)
      addPaymentFeesToAmount: true, // Pass fees to customer
      firstName: paymentRequest.customerFirstName || '',
      lastName: paymentRequest.customerLastName || '',
      phoneNumber: paymentRequest.customerPhone || '',
      email: paymentRequest.customerEmail,
      orderId: paymentRequest.orderId,
      webhook: `${fullBaseUrl}/api/konnect/webhook`,
      silentWebhook: false,
      successUrl: `${fullBaseUrl}/payment/success?payment_ref=PAYMENT_REF`,
      failUrl: `${fullBaseUrl}/payment/failure?payment_ref=PAYMENT_REF`,
    };

    const response = await axios.post(
      `${KONNECT_API_BASE_URL}/payments/init-payment`,
      payload,
      {
        headers: {
          'x-api-key': KONNECT_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      payUrl: response.data.payUrl,
      paymentRef: response.data.paymentRef,
    };
  } catch (error: any) {
    console.error('Konnect payment initialization error:', error.response?.data || error.message);
    throw new Error(`Failed to initialize Konnect payment: ${error.response?.data?.message || error.message}`);
  }
}

/**
 * Get payment details from Konnect
 */
export async function getKonnectPaymentDetails(
  paymentRef: string
): Promise<KonnectPaymentDetails> {
  try {
    const response = await axios.get(
      `${KONNECT_API_BASE_URL}/payments/${paymentRef}`,
      {
        headers: {
          'x-api-key': KONNECT_API_KEY,
        },
      }
    );

    const payment = response.data.payment;

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount / 1000, // Convert from millimes to TND
      amountDue: payment.amountDue / 1000,
      reachedAmount: payment.reachedAmount / 1000,
      token: payment.token,
      orderId: payment.orderId,
      expirationDate: payment.expirationDate,
      transactions: payment.transactions,
    };
  } catch (error: any) {
    console.error('Konnect payment details error:', error.response?.data || error.message);
    throw new Error(`Failed to get Konnect payment details: ${error.response?.data?.message || error.message}`);
  }
}
