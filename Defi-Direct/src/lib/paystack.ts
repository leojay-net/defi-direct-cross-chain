// src/lib/paystack.ts
import axios from 'axios';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

const paystackAxios = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

export async function listBanks() {
  try {
    const response = await paystackAxios.get('/bank?country=nigeria');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching banks:', error);
    throw error;
  }
}

export async function verifyAccountNumber(accountNumber: string, bankCode: string) {
  try {
    const response = await paystackAxios.get(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
    );
    return response.data;
  } catch (error) {
    console.error('Error verifying account:', error);
    throw error;
  }
}

export async function createRecipient(
  bankCode: string, 
  accountNumber: string, 
  accountName: string
) {
  try {
    const response = await paystackAxios.post('/transferrecipient', {
      type: "nuban",
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode, 
      currency: "NGN"
    });
    
    return response.data.data.recipient_code;
  } catch (error) {
    console.error('Error creating recipient:', error);
    throw error;
  }
}

export async function initiateTransfer(
  amount: number, 
  recipientCode: string, 
  reason: string = "Withdrawal"
) {
  try {
    const response = await paystackAxios.post('/transfer', {
      source: "balance",
      reason,
      amount: amount * 100, // Convert to kobo
      recipient: recipientCode
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error initiating transfer:', error);
    throw error;
  }
}