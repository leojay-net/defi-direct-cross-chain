// pages/api/initiate-transfer.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { initiateTransfer } from '../../services/paystackService';
import { TransferData } from '../../types/paystack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  try {
    const { amount, recipient_code, reason } = req.body;

    if (!amount || !recipient_code) {
      return res.status(400).json({
        status: false,
        message: 'Amount and recipient code are required'
      });
    }

    const transferData: TransferData = {
      source: 'balance',
      amount,
      recipient: recipient_code,
      reason: reason || 'Transfer payment'
    };

    const response = await initiateTransfer(transferData);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(
      error || { status: false, message: 'An error occurred' }
    );
  }
}