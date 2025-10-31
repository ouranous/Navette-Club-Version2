import axios from 'axios';
import { getAppDomain } from './replitAuth';

if (!process.env.KONNECT_API_KEY) {
  throw new Error("KONNECT_API_KEY environment variable is required");
}

if (!process.env.KONNECT_RECEIVER_WALLET) {
  throw new Error("KONNECT_RECEIVER_WALLET environment variable is required");
}

// Use Sandbox URL for testing, Production URL for live payments
// KONNECT_ENV can be 'sandbox' or 'production' (defaults to sandbox for safety)
const KONNECT_ENV = process.env.KONNECT_ENV || 'sandbox';
const KONNECT_API_BASE_URL = KONNECT_ENV === 'production' 
  ? 'https://api.konnect.network/api/v2'
  : 'https://api.preprod.konnect.network/api/v2';

// EUR to TND exchange rate (configurable via environment variable)
// Default: 1 EUR = 3.5 TND
const EUR_TO_TND_RATE = parseFloat(process.env.EUR_TO_TND_RATE || '3.5');

console.log(`🌍 Konnect Environment: ${KONNECT_ENV.toUpperCase()}`);
console.log(`🔗 Konnect API URL: ${KONNECT_API_BASE_URL}`);
console.log(`💱 EUR to TND Rate: 1 EUR = ${EUR_TO_TND_RATE} TND`);

const KONNECT_API_KEY = process.env.KONNECT_API_KEY;
const RECEIVER_WALLET_ID = process.env.KONNECT_RECEIVER_WALLET;

export interface KonnectPaymentRequest {
  amount: number; // Amount in EUR or TND (will be converted to TND if EUR, then to millimes)
  currency?: 'EUR' | 'TND'; // Currency of the amount (default: EUR)
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

    console.log('🔑 Konnect API Key loaded:', KONNECT_API_KEY ? `${KONNECT_API_KEY.substring(0, 30)}...` : 'NOT SET');
    console.log('🔑 API Key has colon?', KONNECT_API_KEY ? (KONNECT_API_KEY.includes(':') ? '✅ YES' : '❌ NO') : 'N/A');
    console.log('🔑 API Key length:', KONNECT_API_KEY ? KONNECT_API_KEY.length : 0);
    console.log('💰 Receiver Wallet ID:', RECEIVER_WALLET_ID);

    // Convert EUR to TND if needed (default currency is EUR for backward compatibility)
    const currency = paymentRequest.currency || 'EUR';
    const amountInTND = currency === 'EUR' 
      ? paymentRequest.amount * EUR_TO_TND_RATE 
      : paymentRequest.amount;

    console.log(`💶 Amount received: ${paymentRequest.amount} ${currency}`);
    console.log(`💵 Amount in TND: ${amountInTND.toFixed(3)} TND`);

    // Convert amount to millimes (1 TND = 1000 millimes)
    const amountInMillimes = Math.round(amountInTND * 1000);

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

    console.log('📤 Konnect request URL:', `${KONNECT_API_BASE_URL}/payments/init-payment`);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

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

    console.log('✅ Konnect payment initialized successfully:', response.data);

    return {
      payUrl: response.data.payUrl,
      paymentRef: response.data.paymentRef,
    };
  } catch (error: any) {
    console.error('❌ Konnect payment initialization error:', error.response?.data || error.message);
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
