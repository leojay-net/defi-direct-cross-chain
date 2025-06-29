// src/services/paystackService.ts
import axios from 'axios';
import { 
  TransferRecipientData, 
  TransferRecipientResponse,
  TransferData,
  TransferResponse
} from '../types/paystack';

// This service will be used server-side only
const createPaystackInstance = () => {
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  
  return axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    }
  });
};

export const createTransferRecipient = async (
  recipientData: TransferRecipientData
): Promise<TransferRecipientResponse> => {
  const paystackAxios = createPaystackInstance();
  
  // try {
  //   const response = await paystackAxios.post<TransferRecipientResponse>(
  //     '/transferrecipient', 
  //     recipientData
  //   );
  //   return response.data;
  // } catch (error) {
  //   console.error('Error creating transfer recipient:', error);
  //   throw error;
  // }
  try {
    const response = await paystackAxios.post(
      '/transferrecipient', 
      recipientData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating transfer recipient:', error);
    throw error;
  }
};

export const initiateTransfer = async (
  transferData: TransferData
): Promise<TransferResponse> => {
  const paystackAxios = createPaystackInstance();
  
  // try {
  //   const response = await paystackAxios.post<TransferResponse>(
  //     '/transfer', 
  //     transferData
  //   );
  //   return response.data;
  // } catch (error) {
  //   console.error('Error initiating transfer:', error);
  //   throw error;
  // }

  try {
    const response = await paystackAxios.post(
      '/transfer', 
      transferData
    );
    return response.data;
  } catch (error) {
    console.error('Error initiating transfer:', error);
    throw error;
  }
};