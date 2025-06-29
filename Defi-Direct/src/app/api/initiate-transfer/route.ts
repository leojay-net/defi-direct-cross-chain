// src/app/api/initiate-transfer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createRecipient, initiateTransfer } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bankCode, accountNumber, accountName, amount } = body;

    // Validate required fields
    if (!bankCode || !accountNumber || !accountName || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure amount is a valid number
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Log request data for debugging
    console.log('Initiating transfer with:', { bankCode, accountNumber, accountName, amount });

    // Create recipient
    const recipientCode = await createRecipient(bankCode, accountNumber, accountName);

    if (!recipientCode) {
      return NextResponse.json(
        { success: false, message: 'Failed to create recipient' },
        { status: 400 }
      );
    }

    // Initiate transfer
    const transfer = await initiateTransfer(amount, recipientCode);

    if (!transfer || !transfer.reference) {
      return NextResponse.json(
        { success: false, message: 'Transfer initiation failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        reference: transfer.reference,
        amount,
        recipient: accountName
      }
    });
  } catch (error) {
    console.error('Transfer error:', error);

    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error || 'Transfer failed' },
      { status: 500 }
    );
  }
}
