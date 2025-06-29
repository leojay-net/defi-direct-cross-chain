// src/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  // Verify signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
    .update(payload)
    .digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(payload);

  // Handle transfer events
  if (event.event === 'transfer.success') {
    // Update your database with successful transfer
    console.log('Transfer successful:', event.data);
  } else if (event.event === 'transfer.failed') {
    // Update your database with failed transfer
    console.log('Transfer failed:', event.data);
  } else if (event.event === 'transfer.reversed') {
    // Handle reversed transfers
    console.log('Transfer reversed:', event.data);
  }

  return NextResponse.json({ received: true });
}