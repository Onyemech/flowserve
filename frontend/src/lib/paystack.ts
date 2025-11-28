const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    fees: number;
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
      phone: string | null;
      metadata: any;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
  };
}

export interface PaystackTransferRecipient {
  status: boolean;
  message: string;
  data: {
    active: boolean;
    createdAt: string;
    currency: string;
    domain: string;
    id: number;
    integration: number;
    name: string;
    recipient_code: string;
    type: string;
    updatedAt: string;
    is_deleted: boolean;
    details: {
      authorization_code: string | null;
      account_number: string;
      account_name: string;
      bank_code: string;
      bank_name: string;
    };
  };
}

export interface PaystackTransferResponse {
  status: boolean;
  message: string;
  data: {
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    source: string;
    reason: string;
    recipient: number;
    status: string;
    transfer_code: string;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
}

export class PaystackService {
  private headers = {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };

  async initializeTransaction(params: {
    email: string;
    amount: number; // in kobo
    reference: string;
    callback_url?: string;
    metadata?: any;
  }): Promise<PaystackInitializeResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params),
    });

    return response.json();
  }

  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );

    return response.json();
  }

  async createTransferRecipient(params: {
    type: 'nuban';
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
  }): Promise<PaystackTransferRecipient> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        ...params,
        currency: params.currency || 'NGN',
      }),
    });

    return response.json();
  }

  async initiateTransfer(params: {
    source: 'balance';
    amount: number; // in kobo
    recipient: string; // recipient code
    reason?: string;
    reference?: string;
  }): Promise<PaystackTransferResponse> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(params),
    });

    return response.json();
  }

  async verifyAccountNumber(params: {
    account_number: string;
    bank_code: string;
  }): Promise<any> {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${params.account_number}&bank_code=${params.bank_code}`,
      {
        method: 'GET',
        headers: this.headers,
      }
    );

    return response.json();
  }

  async listBanks(): Promise<any> {
    const response = await fetch(`${PAYSTACK_BASE_URL}/bank?currency=NGN`, {
      method: 'GET',
      headers: this.headers,
    });

    return response.json();
  }

  calculatePlatformFee(amount: number): { platformFee: number; userAmount: number } {
    const platformFee = Math.round(amount * 0.05); // 5% platform fee
    const userAmount = amount - platformFee;
    return { platformFee, userAmount };
  }
}

export const paystackService = new PaystackService();
