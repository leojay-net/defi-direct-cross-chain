import { ethers } from "hardhat";

async function main() {
    console.log("🌐 Starting Multi-Chain Deployment to Avalanche L1s...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX\n");

    // Multi-chain configuration
    const MULTI_CHAIN_CONFIG = {
        AVALANCHE_FUJI: {
            chainId: 43113,
            name: "Avalanche Fuji",
            ccipSupported: true,
            ccipRouter: "0xF694E193200268f9a4868e4Aa017A0118C9a8177",
            linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
            chainSelector: 14767482510784806043n,
            ccipBnM: "0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4",
            ccipLnM: "0x70F5c5C40b873EA597776DA2C21929A8282A3b35",
        },
        DISPATCH_L1: {
            chainId: 779672,
            name: "Dispatch L1",
            ccipSupported: false,
            ccipRouter: "0x0000000000000000000000000000000000000000",
            linkToken: "0x0000000000000000000000000000000000000000", // Mock LINK
            chainSelector: 779672n, // Placeholder
        },
        ECHO_L1: {
            chainId: 173750,
            name: "Echo L1",
            ccipSupported: false,
            ccipRouter: "0x0000000000000000000000000000000000000000",
            linkToken: "0x0000000000000000000000000000000000000000", // Mock LINK
            chainSelector: 173750n, // Placeholder
        }
    };

    // Deployment parameters
    const spreadFee = 100; // 1% fee (100 basis points)
    const txManagerAddress = deployer.address;
    const vaultAddress = deployer.address;
    const feeReceiverAddress = deployer.address;

    console.log("=== Deploying Multi-Chain Infrastructure ===\n");

    // Get current network
    const network = await ethers.provider.getNetwork();
    const currentChainId = Number(network.chainId);

    let currentChain: keyof typeof MULTI_CHAIN_CONFIG;
    if (currentChainId === 43113) {
        currentChain = "AVALANCHE_FUJI";
    } else if (currentChainId === 779672) {
        currentChain = "DISPATCH_L1";
    } else if (currentChainId === 173750) {
        currentChain = "ECHO_L1";
    } else {
        throw new Error(`Unsupported chain ID: ${currentChainId}`);
    }

    const chainConfig = MULTI_CHAIN_CONFIG[currentChain];
    console.log(`Deploying to: ${chainConfig.name} (Chain ID: ${chainConfig.chainId})`);
    console.log(`CCIP Support: ${chainConfig.ccipSupported ? "✅ Supported" : "❌ Not Supported"}\n`);

    console.log("=== Deploying Mock Tokens ===");

    // Deploy Mock USDC for testing
    const MockERC20 = await ethers.getContractFactory("MOCKERC20");
    const mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);
    await mockUSDC.waitForDeployment();
    console.log("Mock USDC deployed to:", mockUSDC.target);

    // Deploy Mock USDT for testing
    const mockUSDT = await MockERC20.deploy("Tether USD", "USDT", 6);
    await mockUSDT.waitForDeployment();
    console.log("Mock USDT deployed to:", mockUSDT.target);

    // Deploy Mock LINK token (for all chains, real LINK only on Fuji)
    let linkToken;
    if (chainConfig.ccipSupported && chainConfig.linkToken !== "0x0000000000000000000000000000000000000000") {
        // Use real LINK token address for CCIP-supported chains
        linkToken = { target: chainConfig.linkToken };
        console.log("Using real LINK token at:", chainConfig.linkToken);
    } else {
        // Deploy mock LINK for L1s without CCIP
        linkToken = await MockERC20.deploy("Chainlink Token", "LINK", 18);
        await linkToken.waitForDeployment();
        console.log("Mock LINK deployed to:", linkToken.target);
    }

    // Deploy chain-specific tokens
    let chainSpecificTokens: any = {};
    if (currentChain === "ECHO_L1") {
        const echoToken = await MockERC20.deploy("Echo Token", "ECHO", 18);
        await echoToken.waitForDeployment();
        chainSpecificTokens.echoToken = echoToken;
        console.log("Echo Token deployed to:", echoToken.target);
    } else if (currentChain === "DISPATCH_L1") {
        const dispatchToken = await MockERC20.deploy("Dispatch Token", "DISP", 18);
        await dispatchToken.waitForDeployment();
        chainSpecificTokens.dispatchToken = dispatchToken;
        console.log("Dispatch Token deployed to:", dispatchToken.target);
    }

    console.log("\n=== Minting Test Tokens ===");

    // Mint test tokens to deployer
    const mintAmount = ethers.parseUnits("50000", 6); // 50,000 tokens with 6 decimals
    await mockUSDC.mint(deployer.address, mintAmount);
    console.log(`Minted 50,000 USDC to ${deployer.address}`);

    await mockUSDT.mint(deployer.address, mintAmount);
    console.log(`Minted 50,000 USDT to ${deployer.address}`);

    // Mint LINK tokens if we deployed mock LINK
    if (!chainConfig.ccipSupported || chainConfig.linkToken === "0x0000000000000000000000000000000000000000") {
        const linkMintAmount = ethers.parseUnits("10000", 18);
        await (linkToken as any).mint(deployer.address, linkMintAmount);
        console.log(`Minted 10,000 LINK to ${deployer.address}`);
    }

    // Mint chain-specific tokens
    if (chainSpecificTokens.echoToken) {
        const echoMintAmount = ethers.parseUnits("100000", 18);
        await chainSpecificTokens.echoToken.mint(deployer.address, echoMintAmount);
        console.log(`Minted 100,000 ECHO to ${deployer.address}`);
    }
    if (chainSpecificTokens.dispatchToken) {
        const dispatchMintAmount = ethers.parseUnits("100000", 18);
        await chainSpecificTokens.dispatchToken.mint(deployer.address, dispatchMintAmount);
        console.log(`Minted 100,000 DISP to ${deployer.address}`);
    }

    console.log("\n=== Deploying FiatBridge ===");

    // Deploy FiatBridge contract
    const FiatBridge = await ethers.getContractFactory("FiatBridge");
    const fiatBridge = await FiatBridge.deploy(
        spreadFee,
        txManagerAddress,
        feeReceiverAddress,
        vaultAddress,
        ethers.ZeroAddress // Will set CCIP contract address later if supported
    );

    await fiatBridge.waitForDeployment();
    console.log("FiatBridge deployed to:", fiatBridge.target);

    // Deploy CCIP contract if supported
    let ccipTokenTransfer;
    if (chainConfig.ccipSupported) {
        console.log("\n=== Deploying CCIPTokenTransfer ===");

        const CCIPTokenTransfer = await ethers.getContractFactory("CCIPTokenTransfer");
        ccipTokenTransfer = await CCIPTokenTransfer.deploy(
            chainConfig.ccipRouter,
            chainConfig.linkToken,
            fiatBridge.target
        );

        await ccipTokenTransfer.waitForDeployment();
        console.log("CCIPTokenTransfer deployed to:", ccipTokenTransfer.target);

        // Update FiatBridge with CCIP contract
        const updateCCIPTx = await fiatBridge.setCCIPContract(ccipTokenTransfer.target);
        await updateCCIPTx.wait();
        console.log("FiatBridge updated with CCIPTokenTransfer address");

        // Configure cross-chain destinations
        console.log("\n=== Configuring Cross-Chain Destinations ===");

        // Add other Avalanche chains as destinations
        for (const [chainName, config] of Object.entries(MULTI_CHAIN_CONFIG)) {
            if (chainName !== currentChain && config.ccipSupported) {
                const allowChainTx = await ccipTokenTransfer.allowlistDestinationChain(config.chainSelector, true);
                await allowChainTx.wait();
                console.log(`${config.name} chain allowlisted for CCIP transfers`);
            }
        }

        // Add supported tokens to CCIP contract
        console.log("\n=== Adding Supported Tokens to CCIP Contract ===");

        const ccipUSDCTx = await ccipTokenTransfer.updateTokenSupport(mockUSDC.target, true);
        await ccipUSDCTx.wait();
        console.log("Mock USDC support enabled in CCIP contract");

        const ccipUSDTTx = await ccipTokenTransfer.updateTokenSupport(mockUSDT.target, true);
        await ccipUSDTTx.wait();
        console.log("Mock USDT support enabled in CCIP contract");

        // Add LINK token support
        const enableLinkTx = await ccipTokenTransfer.updateTokenSupport(chainConfig.linkToken, true);
        await enableLinkTx.wait();
        console.log("LINK token support enabled in CCIP contract");

        // Add CCIP test tokens if available
        if (chainConfig.ccipBnM) {
            const ccipBnMTx = await ccipTokenTransfer.updateTokenSupport(chainConfig.ccipBnM, true);
            await ccipBnMTx.wait();
            console.log("CCIP-BnM support enabled in CCIP contract");
        }

        if (chainConfig.ccipLnM) {
            const ccipLnMTx = await ccipTokenTransfer.updateTokenSupport(chainConfig.ccipLnM, true);
            await ccipLnMTx.wait();
            console.log("CCIP-LnM support enabled in CCIP contract");
        }
    }

    console.log("\n=== Adding Supported Tokens to FiatBridge ===");

    // Add tokens to FiatBridge
    const addUSDCTx = await fiatBridge.addSupportedToken(mockUSDC.target);
    await addUSDCTx.wait();
    console.log("Mock USDC added to FiatBridge");

    const addUSDTTx = await fiatBridge.addSupportedToken(mockUSDT.target);
    await addUSDTTx.wait();
    console.log("Mock USDT added to FiatBridge");

    const addLinkTx = await fiatBridge.addSupportedToken(linkToken.target);
    await addLinkTx.wait();
    console.log("LINK token added to FiatBridge");

    // Add chain-specific tokens
    if (chainSpecificTokens.echoToken) {
        const addEchoTx = await fiatBridge.addSupportedToken(chainSpecificTokens.echoToken.target);
        await addEchoTx.wait();
        console.log("Echo Token added to FiatBridge");
    }
    if (chainSpecificTokens.dispatchToken) {
        const addDispatchTx = await fiatBridge.addSupportedToken(chainSpecificTokens.dispatchToken.target);
        await addDispatchTx.wait();
        console.log("Dispatch Token added to FiatBridge");
    }

    // Add CCIP test tokens to FiatBridge if available
    if (chainConfig.ccipBnM) {
        const addCCIPBnMTx = await fiatBridge.addSupportedToken(chainConfig.ccipBnM);
        await addCCIPBnMTx.wait();
        console.log("CCIP-BnM added to FiatBridge");
    }

    if (chainConfig.ccipLnM) {
        const addCCIPLnMTx = await fiatBridge.addSupportedToken(chainConfig.ccipLnM);
        await addCCIPLnMTx.wait();
        console.log("CCIP-LnM added to FiatBridge");
    }

    console.log("\n🎉 Multi-Chain Deployment completed successfully!\n");

    // Deployment Summary
    console.log("=== MULTI-CHAIN DEPLOYMENT SUMMARY ===");
    console.log(`Network: ${chainConfig.name}`);
    console.log(`Chain ID: ${chainConfig.chainId}`);
    console.log(`CCIP Support: ${chainConfig.ccipSupported ? "✅ Enabled" : "❌ Not Available"}`);
    console.log("Deployer:", deployer.address);
    console.log("");
    console.log("📋 Contract Addresses:");
    console.log("┌─────────────────────────┬──────────────────────────────────────────────┐");
    console.log("│ Contract                │ Address                                      │");
    console.log("├─────────────────────────┼──────────────────────────────────────────────┤");
    console.log(`│ FiatBridge              │ ${fiatBridge.target}                         │`);
    if (ccipTokenTransfer) {
        console.log(`│ CCIPTokenTransfer       │ ${ccipTokenTransfer.target}                  │`);
    }
    console.log(`│ Mock USDC               │ ${mockUSDC.target}                           │`);
    console.log(`│ Mock USDT               │ ${mockUSDT.target}                           │`);
    console.log(`│ Mock LINK               │ ${linkToken.target}                          │`);

    if (chainSpecificTokens.echoToken) {
        console.log(`│ Echo Token              │ ${chainSpecificTokens.echoToken.target}      │`);
    }
    if (chainSpecificTokens.dispatchToken) {
        console.log(`│ Dispatch Token          │ ${chainSpecificTokens.dispatchToken.target}  │`);
    }
    console.log("└─────────────────────────┴──────────────────────────────────────────────┘");
    console.log("");

    if (chainConfig.ccipSupported) {
        console.log("🔗 CCIP Configuration:");
        console.log(`CCIP Router: ${chainConfig.ccipRouter}`);
        console.log(`LINK Token: ${chainConfig.linkToken}`);
        if (chainConfig.ccipBnM) console.log(`CCIP-BnM: ${chainConfig.ccipBnM}`);
        if (chainConfig.ccipLnM) console.log(`CCIP-LnM: ${chainConfig.ccipLnM}`);
        console.log("");
        console.log("🌐 Cross-Chain Destinations:");
        for (const [chainName, config] of Object.entries(MULTI_CHAIN_CONFIG)) {
            if (chainName !== currentChain && config.ccipSupported) {
                console.log(`- ${config.name} (${config.chainSelector})`);
            }
        }
    } else {
        console.log("⚠️  CCIP Notes:");
        console.log("- CCIP is not currently supported on this L1");
        console.log("- Cross-chain transfers will be available when CCIP support is added");
        console.log("- FiatBridge functions normally for local token operations");
    }

    console.log("");
    console.log("💰 Configuration:");
    console.log("- Spread Fee: 1% (100 basis points)");
    console.log("- Transaction Manager:", txManagerAddress);
    console.log("- Fee Receiver:", feeReceiverAddress);
    console.log("- Vault Address:", vaultAddress);
    console.log("");
    console.log("⚠️  Next Steps:");
    console.log("1. Update frontend configuration with deployed addresses");
    console.log("2. Fund user accounts with test tokens");
    if (chainConfig.ccipSupported) {
        console.log("3. Fund CCIPTokenTransfer contract with LINK for fees");
        console.log("4. Test cross-chain transfers between supported networks");
    } else {
        console.log("3. Monitor Chainlink CCIP for L1 support announcements");
        console.log("4. Deploy CCIPTokenTransfer when CCIP support becomes available");
    }
    console.log("");

    // Frontend configuration export
    console.log("📄 Frontend Configuration Update:");
    console.log("Add the following to your config.ts:");
    console.log("");

    if (currentChain === "AVALANCHE_FUJI") {
        console.log("export const AVALANCHE_FUJI_ADDRESSES = {");
        console.log(`  FIAT_BRIDGE: "${fiatBridge.target}" as \`0x\${string}\`,`);
        if (ccipTokenTransfer) {
            console.log(`  CCIP_TOKEN_TRANSFER: "${ccipTokenTransfer.target}" as \`0x\${string}\`,`);
        }
        console.log(`  USDC_TOKEN: "${mockUSDC.target}" as \`0x\${string}\`,`);
        console.log(`  USDT_TOKEN: "${mockUSDT.target}" as \`0x\${string}\`,`);
        console.log("  // ... existing CCIP addresses");
        console.log("};");
    } else if (currentChain === "DISPATCH_L1") {
        console.log("export const DISPATCH_L1_ADDRESSES = {");
        console.log(`  FIAT_BRIDGE: "${fiatBridge.target}" as \`0x\${string}\`,`);
        console.log(`  LINK_TOKEN: "${linkToken.target}" as \`0x\${string}\`,`);
        console.log(`  USDC_TOKEN: "${mockUSDC.target}" as \`0x\${string}\`,`);
        console.log(`  USDT_TOKEN: "${mockUSDT.target}" as \`0x\${string}\`,`);
        if (chainSpecificTokens.dispatchToken) {
            console.log(`  DISPATCH_TOKEN: "${chainSpecificTokens.dispatchToken.target}" as \`0x\${string}\`,`);
        }
        console.log("};");
    } else if (currentChain === "ECHO_L1") {
        console.log("export const ECHO_L1_ADDRESSES = {");
        console.log(`  FIAT_BRIDGE: "${fiatBridge.target}" as \`0x\${string}\`,`);
        console.log(`  LINK_TOKEN: "${linkToken.target}" as \`0x\${string}\`,`);
        console.log(`  USDC_TOKEN: "${mockUSDC.target}" as \`0x\${string}\`,`);
        console.log(`  USDT_TOKEN: "${mockUSDT.target}" as \`0x\${string}\`,`);
        if (chainSpecificTokens.echoToken) {
            console.log(`  ECHO_TOKEN: "${chainSpecificTokens.echoToken.target}" as \`0x\${string}\`,`);
        }
        console.log("};");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
