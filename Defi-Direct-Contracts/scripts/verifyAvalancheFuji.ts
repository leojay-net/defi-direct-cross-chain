import { run } from "hardhat";

async function main() {
    console.log("🔍 Starting contract verification on Avalanche Fuji...\n");

    // Contract addresses from deployment
    const DEPLOYED_CONTRACTS = {
        FIAT_BRIDGE: "0xfE2567096081eB4CF4E0DE60f4E76A9cFD3b39D7",
        CCIP_TOKEN_TRANSFER: "0xb69AE33bd9aDe08F4E89A0Ca6038CFA2d18c97d3",
        MOCK_USDC: "0x47EC71e8979ec93fCF71FE64FF1F5ee81D51B024",
        MOCK_USDT: "0x87FAD5732C553eb939F89F0D1ec9C5C67d651a05",
    };

    // Deployment parameters used during deployment
    const DEPLOYMENT_PARAMS = {
        spreadFee: 100, // 1% fee (100 basis points)
        txManagerAddress: "0xeD6c9f2573343043DD443bc633f9071ABDF688Fd", // Deployer address
        vaultAddress: "0xeD6c9f2573343043DD443bc633f9071ABDF688Fd", // Deployer address
        feeReceiverAddress: "0xeD6c9f2573343043DD443bc633f9071ABDF688Fd", // Deployer address
        ccipRouter: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
        linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    };

    try {
        console.log("=== Verifying FiatBridge Contract ===");
        console.log(`Address: ${DEPLOYED_CONTRACTS.FIAT_BRIDGE}`);

        await run("verify:verify", {
            address: DEPLOYED_CONTRACTS.FIAT_BRIDGE,
            constructorArguments: [
                DEPLOYMENT_PARAMS.spreadFee,
                DEPLOYMENT_PARAMS.txManagerAddress,
                DEPLOYMENT_PARAMS.feeReceiverAddress,
                DEPLOYMENT_PARAMS.vaultAddress,
                "0x0000000000000000000000000000000000000000" // Initial CCIP contract address (zero)
            ],
            contract: "contracts/Direct.sol:FiatBridge"
        });

        console.log("✅ FiatBridge verified successfully!\n");

    } catch (error) {
        console.log("❌ FiatBridge verification failed:");
        console.log(error);
        console.log("");
    }

    try {
        console.log("=== Verifying CCIPTokenTransfer Contract ===");
        console.log(`Address: ${DEPLOYED_CONTRACTS.CCIP_TOKEN_TRANSFER}`);

        await run("verify:verify", {
            address: DEPLOYED_CONTRACTS.CCIP_TOKEN_TRANSFER,
            constructorArguments: [
                DEPLOYMENT_PARAMS.ccipRouter,
                DEPLOYMENT_PARAMS.linkToken,
                DEPLOYED_CONTRACTS.FIAT_BRIDGE // FiatBridge address
            ],
            contract: "contracts/CCIPTokenTransfer.sol:CCIPTokenTransfer"
        });

        console.log("✅ CCIPTokenTransfer verified successfully!\n");

    } catch (error) {
        console.log("❌ CCIPTokenTransfer verification failed:");
        console.log(error);
        console.log("");
    }

    try {
        console.log("=== Verifying Mock USDC Contract ===");
        console.log(`Address: ${DEPLOYED_CONTRACTS.MOCK_USDC}`);

        await run("verify:verify", {
            address: DEPLOYED_CONTRACTS.MOCK_USDC,
            constructorArguments: [
                "USD Coin",
                "USDC",
                6
            ],
            contract: "contracts/MockErc20.sol:MOCKERC20"
        });

        console.log("✅ Mock USDC verified successfully!\n");

    } catch (error) {
        console.log("❌ Mock USDC verification failed:");
        console.log(error);
        console.log("");
    }

    try {
        console.log("=== Verifying Mock USDT Contract ===");
        console.log(`Address: ${DEPLOYED_CONTRACTS.MOCK_USDT}`);

        await run("verify:verify", {
            address: DEPLOYED_CONTRACTS.MOCK_USDT,
            constructorArguments: [
                "Tether USD",
                "USDT",
                6
            ],
            contract: "contracts/MockErc20.sol:MOCKERC20"
        });

        console.log("✅ Mock USDT verified successfully!\n");

    } catch (error) {
        console.log("❌ Mock USDT verification failed:");
        console.log(error);
        console.log("");
    }

    console.log("🎉 Contract verification process completed!");
    console.log("");
    console.log("=== VERIFICATION SUMMARY ===");
    console.log("Network: Avalanche Fuji Testnet");
    console.log("Chain ID: 43113");
    console.log("");
    console.log("📋 Verified Contracts:");
    console.log("┌─────────────────────────┬──────────────────────────────────────────────┐");
    console.log("│ Contract                │ Address                                      │");
    console.log("├─────────────────────────┼──────────────────────────────────────────────┤");
    console.log(`│ FiatBridge              │ ${DEPLOYED_CONTRACTS.FIAT_BRIDGE}           │`);
    console.log(`│ CCIPTokenTransfer       │ ${DEPLOYED_CONTRACTS.CCIP_TOKEN_TRANSFER}   │`);
    console.log(`│ Mock USDC               │ ${DEPLOYED_CONTRACTS.MOCK_USDC}             │`);
    console.log(`│ Mock USDT               │ ${DEPLOYED_CONTRACTS.MOCK_USDT}             │`);
    console.log("└─────────────────────────┴──────────────────────────────────────────────┘");
    console.log("");
    console.log("🔍 View contracts on SnowTrace:");
    console.log(`- FiatBridge: https://testnet.snowtrace.io/address/${DEPLOYED_CONTRACTS.FIAT_BRIDGE}`);
    console.log(`- CCIPTokenTransfer: https://testnet.snowtrace.io/address/${DEPLOYED_CONTRACTS.CCIP_TOKEN_TRANSFER}`);
    console.log(`- Mock USDC: https://testnet.snowtrace.io/address/${DEPLOYED_CONTRACTS.MOCK_USDC}`);
    console.log(`- Mock USDT: https://testnet.snowtrace.io/address/${DEPLOYED_CONTRACTS.MOCK_USDT}`);
    console.log("");
    console.log("📝 Note: Some contracts may already be verified. Check SnowTrace for verification status.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
