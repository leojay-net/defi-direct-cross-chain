// src/app/api/verify-account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccountNumber } from '@/lib/paystack';

export async function POST(request: NextRequest) {
  try {
    const { bankCode, accountNumber } = await request.json();

    if (!bankCode || !accountNumber) {
      return NextResponse.json(
        { success: false, message: 'Bank code and account number are required' },
        { status: 400 }
      );
    }

    const accountData = await verifyAccountNumber(accountNumber, bankCode);

    return NextResponse.json({
      success: true,
      data: accountData.data
    });
  } catch (error) {
    // Handle specific Paystack errors
    if (error) {
      return NextResponse.json(
        { success: false, message: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error || 'Could not verify account' },
      { status: 500 }
    );
  }
}