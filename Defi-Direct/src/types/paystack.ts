// src/types/paystack.ts
export interface TransferRecipientData {
    type: string;
    name: string;
    account_number: string;
    bank_code: string;
    currency: string;
  }
  
  export interface TransferRecipientResponse {
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
      }
    }
  }
  
  export interface TransferData {
    source: string;
    amount: number;
    recipient: string;
    reason?: string;
  }
  
  export interface TransferResponse {
    status: boolean;
    message: string;
    data: {
      reference: string;
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
    }
  }