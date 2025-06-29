import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/paydirect";

// This should be stored securely in environment variables
const TRANSACTION_MANAGER_PRIVATE_KEY = process.env.TRANSACTION_MANAGER_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";

if (!TRANSACTION_MANAGER_PRIVATE_KEY) {
    console.error("TRANSACTION_MANAGER_PRIVATE_KEY environment variable is not set");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transactionId, amountSpent } = body;

        // Validate required fields
        if (!transactionId || !amountSpent) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: transactionId and amountSpent' },
                { status: 400 }
            );
        }

        // TODO: Add authentication/authorization logic here
        // Verify that the request is coming from an authorized source
        // This could involve verifying a JWT token, checking user permissions, etc.

        if (!TRANSACTION_MANAGER_PRIVATE_KEY) {
            return NextResponse.json(
                { success: false, message: 'Transaction manager not configured' },
                { status: 500 }
            );
        }

        // Set up the provider and signer
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const signer = new ethers.Wallet(TRANSACTION_MANAGER_PRIVATE_KEY, provider);

        // Create contract instance
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        console.log("Completing transaction with transaction manager...");
        console.log("Transaction ID:", transactionId);
        console.log("Amount spent:", amountSpent);
        console.log("Signer address:", signer.address);

        // Ensure transactionId is properly formatted as bytes32
        const encodedTxId = ethers.AbiCoder.defaultAbiCoder().encode(
            ["bytes32"],
            [transactionId]
        );

        // Call the completeTransaction function
        const tx = await contract.completeTransaction(encodedTxId, BigInt(amountSpent));

        console.log("Complete transaction submitted:", tx.hash);

        // Wait for the transaction to be mined
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            console.log("Transaction completed successfully");
            return NextResponse.json({
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                message: 'Transaction completed successfully'
            });
        } else {
            console.error("Transaction failed");
            return NextResponse.json(
                { success: false, message: 'Transaction failed to complete' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Complete transaction error:', error);

        let errorMessage = 'Failed to complete transaction';

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
}
