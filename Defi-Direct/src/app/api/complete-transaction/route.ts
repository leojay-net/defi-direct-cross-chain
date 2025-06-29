import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/paydirect";

// This should be stored securely in environment variables
const TRANSACTION_MANAGER_PRIVATE_KEY = process.env.TRANSACTION_MANAGER_PRIVATE_KEY;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";

if (!TRANSACTION_MANAGER_PRIVATE_KEY) {
    console.error("TRANSACTION_MANAGER_PRIVATE_KEY environment variable is not set");
    console.error("Please set this environment variable in your .env.local file");
    console.error("This should be the private key of the account with TRANSACTION_MANAGER role in the smart contract");
}

export async function POST(request: NextRequest) {
    console.log("=== COMPLETE TRANSACTION API START ===");
    console.log("1. Complete transaction API called");

    try {
        const body = await request.json();
        const { transactionId, amountSpent } = body;

        console.log("2. Request body received:", { transactionId, amountSpent });

        // Validate required fields
        if (!transactionId || !amountSpent) {
            console.log("❌ Missing required fields:", { transactionId, amountSpent });
            return NextResponse.json(
                { success: false, message: 'Missing required fields: transactionId and amountSpent' },
                { status: 400 }
            );
        }

        console.log("3. Required fields validated");

        // TODO: Add authentication/authorization logic here
        // Verify that the request is coming from an authorized source
        // This could involve verifying a JWT token, checking user permissions, etc.

        if (!TRANSACTION_MANAGER_PRIVATE_KEY) {
            console.log("❌ TRANSACTION_MANAGER_PRIVATE_KEY is not configured");
            return NextResponse.json(
                {
                    success: false,
                    message: 'Transaction manager not configured. Please set TRANSACTION_MANAGER_PRIVATE_KEY environment variable.',
                    error: 'MISSING_PRIVATE_KEY'
                },
                { status: 500 }
            );
        }

        console.log("4. Transaction manager private key is configured");

        // Set up the provider and signer
        console.log("5. Setting up provider and signer...");
        console.log("6. RPC URL:", RPC_URL);
        console.log("7. Contract address:", CONTRACT_ADDRESS);

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const signer = new ethers.Wallet(TRANSACTION_MANAGER_PRIVATE_KEY, provider);

        console.log("8. Provider and signer configured");
        console.log("9. Signer address:", signer.address);

        // Create contract instance
        console.log("10. Creating contract instance...");
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        console.log("11. Contract instance created");

        console.log("12. Completing transaction with transaction manager...");
        console.log("13. Transaction ID:", transactionId);
        console.log("14. Amount spent:", amountSpent);
        console.log("15. Signer address:", signer.address);

        // Ensure transactionId is properly formatted as bytes32
        console.log("16. Encoding transaction ID...");
        const encodedTxId = ethers.AbiCoder.defaultAbiCoder().encode(
            ["bytes32"],
            [transactionId]
        );

        console.log("17. Encoded transaction ID:", encodedTxId);

        // Call the completeTransaction function
        console.log("18. Calling completeTransaction function...");
        const tx = await contract.completeTransaction(encodedTxId, BigInt(amountSpent));

        console.log("19. Complete transaction submitted:", tx.hash);

        // Wait for the transaction to be mined
        console.log("20. Waiting for transaction to be mined...");
        const receipt = await tx.wait();

        console.log("21. Transaction receipt received:", {
            status: receipt.status,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed?.toString()
        });

        if (receipt.status === 1) {
            console.log("22. ✅ Transaction completed successfully");
            console.log("23. Block number:", receipt.blockNumber);
            console.log("24. Gas used:", receipt.gasUsed?.toString());

            return NextResponse.json({
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed?.toString(),
                message: 'Transaction completed successfully'
            });
        } else {
            console.log("❌ Transaction failed with status 0");
            return NextResponse.json(
                { success: false, message: 'Transaction failed to complete (status 0)' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.log("❌ Complete transaction error:", error);

        let errorMessage = 'Failed to complete transaction';
        let errorType = 'UNKNOWN_ERROR';

        if (error instanceof Error) {
            errorMessage = error.message;
            console.log("25. Error details:", {
                message: error.message,
                stack: error.stack
            });

            // Check for specific error types
            if (error.message.includes('insufficient funds')) {
                errorType = 'INSUFFICIENT_FUNDS';
                errorMessage = 'Transaction manager account has insufficient funds for gas';
            } else if (error.message.includes('nonce')) {
                errorType = 'NONCE_ERROR';
                errorMessage = 'Transaction nonce error - please try again';
            } else if (error.message.includes('revert')) {
                errorType = 'CONTRACT_REVERT';
                errorMessage = 'Smart contract reverted the transaction';
            } else if (error.message.includes('network')) {
                errorType = 'NETWORK_ERROR';
                errorMessage = 'Network connection error';
            }
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        console.log("26. Returning error response:", { errorType, errorMessage });
        return NextResponse.json(
            {
                success: false,
                message: errorMessage,
                error: errorType,
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
    console.log("=== COMPLETE TRANSACTION API END ===");
}
