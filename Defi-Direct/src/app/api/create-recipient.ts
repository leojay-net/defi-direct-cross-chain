// pages/api/create-recipient.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createTransferRecipient } from '../../services/paystackService';
import { TransferRecipientData } from '../../types/paystack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  try {
    const { name, account_number, bank_code, currency = 'NGN' } = req.body;
    
    // Validate required fields
    if (!name || !account_number || !bank_code) {
      return res.status(400).json({ 
        status: false, 
        message: 'Missing required fields' 
      });
    }
    
    const recipientData: TransferRecipientData = {
      type: 'nuban',
      name,
      account_number,
      bank_code,
      currency
    };
    
    const response = await createTransferRecipient(recipientData);
    
    return res.status(201).json(response);
  } catch (error) {
    return res.status(500).json(
      error || { status: false, message: 'An error occurred' }
    );
  }
}