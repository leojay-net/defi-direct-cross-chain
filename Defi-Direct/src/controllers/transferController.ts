// // src/controllers/transferController.ts
// import { Request, Response } from 'express';
// import { createTransferRecipient, initiateTransfer } from '../services/paystackService';
// import { TransferRecipientData, TransferData } from '../types/paystack';

// export const createRecipient = async (req: Request, res: Response)/*|: Promise<Response>*/ => {
//   try {
//     const { name, account_number, bank_code, currency = 'NGN' } = req.body;
    
//     // Validate required fields
//     if (!name || !account_number || !bank_code) {
//       return res.status(400).json({ 
//         status: false, 
//         message: 'Missing required fields' 
//       });
//     }
    
//     const recipientData: TransferRecipientData = {
//       type: 'nuban',
//       name,
//       account_number,
//       bank_code,
//       currency
//     };
    
//     const response = await createTransferRecipient(recipientData);
    
//     return res.status(201).json(response.data);
//   } catch (error) {
//     return res.status(500).json(
//       error || { status: false, message: 'An error occurred' }
//     );
//   }
// };

// export const initiatePayment = async (req: Request, res: Response): Promise<Response> => {
//   try {
//     const { amount, recipient_code, reason } = req.body;
    
//     if (!amount || !recipient_code) {
//       return res.status(400).json({
//         status: false,
//         message: 'Amount and recipient code are required'
//       });
//     }
    
//     const transferData: TransferData = {
//       source: 'balance',
//       amount,
//       recipient: recipient_code,
//       reason: reason || 'Transfer payment'
//     };
    
//     const response = await initiateTransfer(transferData);
//     return res.status(200).json(response);
//   } catch (error) {
//     return res.status( 500).json(
//       error || { status: false, message: 'An error occurred' }
//     );
//   }
// };

// src/controllers/transferController.ts
import { Request, Response } from 'express';
import { createTransferRecipient, initiateTransfer } from '../services/paystackService';
import { TransferRecipientData, TransferData } from '../types/paystack';

export const createRecipient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, account_number, bank_code, currency = 'NGN' } = req.body;
    
    // Validate required fields
    if (!name || !account_number || !bank_code) {
      res.status(400).json({ 
        status: false, 
        message: 'Missing required fields' 
      });
      return;
    }
    
    const recipientData: TransferRecipientData = {
      type: 'nuban',
      name,
      account_number,
      bank_code,
      currency
    };
    
    const response = await createTransferRecipient(recipientData);
    
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json(
      error || { status: false, message: 'An error occurred' }
    );
  }
};

export const initiatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, recipient_code, reason } = req.body;
    
    if (!amount || !recipient_code) {
      res.status(400).json({
        status: false,
        message: 'Amount and recipient code are required'
      });
      return;
    }
    
    const transferData: TransferData = {
      source: 'balance',
      amount,
      recipient: recipient_code,
      reason: reason || 'Transfer payment'
    };
    
    const response = await initiateTransfer(transferData);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json(
      error || { status: false, message: 'An error occurred' }
    );
  }
};