import { ethers } from "hardhat";

async function main() {
    console.log("🏔️ Starting deployment to Avalanche Fuji...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX\n");

    // Avalanche Fuji CCIP Configuration
    const FUJI_ADDRESSES = {
        CCIP_ROUTER: "0xF694E193200268f9a4868e4Aa017A0118C9a8177", // Avalanche Fuji CCIP Router
        LINK_TOKEN: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846", // LINK on Avalanche Fuji
        WAVAX_TOKEN: "0xd00ae08403B9bbb9124bB305C09058E32C39A48c", // Wrapped AVAX on Fuji

        // CCIP Test Tokens (deployed on Avalanche Fuji)
        CCIP_BnM: "0xD21341536c5cF5EB1bcb58f6723cE26e8D8E90e4", // CCIP-BnM on Fuji
        CCIP_LnM: "0x70F5c5C40b873EA597776DA2C21929A8282A3b35", // CCIP-LnM on Fuji (fixed checksum)

        // Chain Selectors for cross-chain transfers
        AVALANCHE_FUJI: 14767482510784806043n, // Current chain
        ETHEREUM_SEPOLIA: 16015286601757825753n, // Ethereum Sepolia
        POLYGON_MUMBAI: 12532609583862916517n, // Polygon Mumbai
        BASE_SEPOLIA: 10344971235874465080n, // Base Sepolia
    };

    // FiatBridge deployment parameters
    const spreadFee = 100; // 1% fee (100 basis points)
    const txManagerAddress = deployer.address; // Transaction manager address
    const vaultAddress = deployer.address; // Vault address
    const feeReceiverAddress = deployer.address; // Fee receiver address

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

    console.log("\n=== Minting Test Tokens ===");

    // Mint test tokens to deployer
    const mintAmount = ethers.parseUnits("50000", 6); // 50,000 tokens with 6 decimals
    await mockUSDC.mint(deployer.address, mintAmount);
    console.log(`Minted 50,000 USDC to ${deployer.address}`);

    await mockUSDT.mint(deployer.address, mintAmount);
    console.log(`Minted 50,000 USDT to ${deployer.address}\n`);

    console.log("=== Deploying FiatBridge ===");

    // Deploy FiatBridge contract
    const FiatBridge = await ethers.getContractFactory("FiatBridge");
    const fiatBridge = await FiatBridge.deploy(
        spreadFee,
        txManagerAddress,
        feeReceiverAddress,
        vaultAddress,
        ethers.ZeroAddress // Will set CCIP contract address later
    );

    await fiatBridge.waitForDeployment();
    console.log("FiatBridge deployed to:", fiatBridge.target);
    console.log("Spread fee:", spreadFee, "bps (1%)");
    console.log("Transaction manager:", txManagerAddress);
    console.log("Fee receiver:", feeReceiverAddress);
    console.log("Vault address:", vaultAddress, "\n");

    console.log("=== Deploying CCIPTokenTransfer ===");

    // Deploy CCIPTokenTransfer contract
    const CCIPTokenTransfer = await ethers.getContractFactory("CCIPTokenTransfer");
    const ccipTokenTransfer = await CCIPTokenTransfer.deploy(
        FUJI_ADDRESSES.CCIP_ROUTER,
        FUJI_ADDRESSES.LINK_TOKEN,
        fiatBridge.target
    );

    await ccipTokenTransfer.waitForDeployment();
    console.log("CCIPTokenTransfer deployed to:", ccipTokenTransfer.target);
    console.log("CCIP Router:", FUJI_ADDRESSES.CCIP_ROUTER);
    console.log("LINK Token:", FUJI_ADDRESSES.LINK_TOKEN);
    console.log("FiatBridge address:", fiatBridge.target, "\n");

    console.log("=== Configuring Cross-Chain Destinations ===");

    // Allowlist destination chains for CCIP transfers
    const allowEthereumTx = await ccipTokenTransfer.allowlistDestinationChain(FUJI_ADDRESSES.ETHEREUM_SEPOLIA, true);
    await allowEthereumTx.wait();
    console.log("Ethereum Sepolia chain allowlisted for CCIP transfers");

    const allowBaseTx = await ccipTokenTransfer.allowlistDestinationChain(FUJI_ADDRESSES.BASE_SEPOLIA, true);
    await allowBaseTx.wait();
    console.log("Base Sepolia chain allowlisted for CCIP transfers");

    const allowPolygonTx = await ccipTokenTransfer.allowlistDestinationChain(FUJI_ADDRESSES.POLYGON_MUMBAI, true);
    await allowPolygonTx.wait();
    console.log("Polygon Mumbai chain allowlisted for CCIP transfers");

    console.log("\n=== Adding Supported Tokens to FiatBridge ===");

    // Add USDC to supported tokens
    const addUSDCTx = await fiatBridge.addSupportedToken(mockUSDC.target);
    await addUSDCTx.wait();
    console.log("Mock USDC added to supported tokens");

    // Add USDT to supported tokens
    const addUSDTTx = await fiatBridge.addSupportedToken(mockUSDT.target);
    await addUSDTTx.wait();
    console.log("Mock USDT added to supported tokens");

    // Add LINK to supported tokens
    const addLinkTx = await fiatBridge.addSupportedToken(FUJI_ADDRESSES.LINK_TOKEN);
    await addLinkTx.wait();
    console.log("LINK token added to supported tokens");

    // Add CCIP test tokens to supported tokens
    const addCCIPBnMTx = await fiatBridge.addSupportedToken(FUJI_ADDRESSES.CCIP_BnM);
    await addCCIPBnMTx.wait();
    console.log("CCIP-BnM token added to supported tokens");

    const addCCIPLnMTx = await fiatBridge.addSupportedToken(FUJI_ADDRESSES.CCIP_LnM);
    await addCCIPLnMTx.wait();
    console.log("CCIP-LnM token added to supported tokens");

    // Add WAVAX to supported tokens
    const addWAVAXTx = await fiatBridge.addSupportedToken(FUJI_ADDRESSES.WAVAX_TOKEN);
    await addWAVAXTx.wait();
    console.log("WAVAX token added to supported tokens");

    console.log("\n=== Adding Supported Tokens to CCIP Contract ===");

    // Add supported tokens to CCIP contract
    const ccipUSDCTx = await ccipTokenTransfer.updateTokenSupport(mockUSDC.target, true);
    await ccipUSDCTx.wait();
    console.log("Mock USDC support enabled in CCIP contract");

    const ccipUSDTTx = await ccipTokenTransfer.updateTokenSupport(mockUSDT.target, true);
    await ccipUSDTTx.wait();
    console.log("Mock USDT support enabled in CCIP contract");

    // Enable support for LINK token in CCIP contract
    const enableLinkTx = await ccipTokenTransfer.updateTokenSupport(FUJI_ADDRESSES.LINK_TOKEN, true);
    await enableLinkTx.wait();
    console.log("LINK token support enabled in CCIP contract");

    const ccipBnMTx = await ccipTokenTransfer.updateTokenSupport(FUJI_ADDRESSES.CCIP_BnM, true);
    await ccipBnMTx.wait();
    console.log("CCIP-BnM support enabled in CCIP contract");

    const ccipLnMTx = await ccipTokenTransfer.updateTokenSupport(FUJI_ADDRESSES.CCIP_LnM, true);
    await ccipLnMTx.wait();
    console.log("CCIP-LnM support enabled in CCIP contract");

    const ccipWAVAXTx = await ccipTokenTransfer.updateTokenSupport(FUJI_ADDRESSES.WAVAX_TOKEN, true);
    await ccipWAVAXTx.wait();
    console.log("WAVAX support enabled in CCIP contract");

    // Update FiatBridge with CCIPTokenTransfer address
    console.log("\n=== Updating FiatBridge with CCIPTokenTransfer Address ===");
    const updateFiatBridgeTx = await fiatBridge.setCCIPContract(ccipTokenTransfer.target);
    await updateFiatBridgeTx.wait();
    console.log("FiatBridge CCIPTokenTransfer address updated to:", await fiatBridge.ccipTokenTransfer(), "\n");

    console.log("=== Final Contract Verification ===");

    // Verify contract states
    console.log("FiatBridge owner:", await fiatBridge.owner());
    console.log("CCIPTokenTransfer owner:", await ccipTokenTransfer.owner());
    console.log("FiatBridge spread fee:", await fiatBridge.spreadFeePercentage(), "bps");
    console.log("CCIPTokenTransfer fiatBridge address:", await ccipTokenTransfer.fiatBridgeContract());

    // Check some supported tokens
    console.log("USDC supported in FiatBridge:", await fiatBridge.supportedTokens(mockUSDC.target));
    console.log("CCIP-BnM supported in CCIP contract:", await ccipTokenTransfer.isTokenSupported(FUJI_ADDRESSES.CCIP_BnM));

    // Check allowlisted chains
    console.log("Ethereum Sepolia allowlisted:", await ccipTokenTransfer.isChainAllowlisted(FUJI_ADDRESSES.ETHEREUM_SEPOLIA));
    console.log("Base Sepolia allowlisted:", await ccipTokenTransfer.isChainAllowlisted(FUJI_ADDRESSES.BASE_SEPOLIA));

    console.log("\n🎉 Deployment to Avalanche Fuji completed successfully!\n");

    console.log("=== AVALANCHE FUJI DEPLOYMENT SUMMARY ===");
    console.log("Network: Avalanche Fuji Testnet");
    console.log("Chain ID: 43113");
    console.log("Deployer:", deployer.address);
    console.log("");
    console.log("📋 Contract Addresses:");
    console.log("┌─────────────────────────┬──────────────────────────────────────────────┐");
    console.log("│ Contract                │ Address                                      │");
    console.log("├─────────────────────────┼──────────────────────────────────────────────┤");
    console.log(`│ FiatBridge              │ ${fiatBridge.target}                         │`);
    console.log(`│ CCIPTokenTransfer       │ ${ccipTokenTransfer.target}                  │`);
    console.log(`│ Mock USDC               │ ${mockUSDC.target}                           │`);
    console.log(`│ Mock USDT               │ ${mockUSDT.target}                           │`);
    console.log("└─────────────────────────┴──────────────────────────────────────────────┘");
    console.log("");
    console.log("🔗 CCIP Configuration:");
    console.log(`CCIP Router: ${FUJI_ADDRESSES.CCIP_ROUTER}`);
    console.log(`LINK Token: ${FUJI_ADDRESSES.LINK_TOKEN}`);
    console.log(`CCIP-BnM: ${FUJI_ADDRESSES.CCIP_BnM}`);
    console.log(`CCIP-LnM: ${FUJI_ADDRESSES.CCIP_LnM}`);
    console.log("");
    console.log("🌐 Supported Cross-Chain Destinations:");
    console.log(`- Ethereum Sepolia (${FUJI_ADDRESSES.ETHEREUM_SEPOLIA})`);
    console.log(`- Base Sepolia (${FUJI_ADDRESSES.BASE_SEPOLIA})`);
    console.log(`- Polygon Mumbai (${FUJI_ADDRESSES.POLYGON_MUMBAI})`);
    console.log("");
    console.log("💰 Configuration:");
    console.log("- Spread Fee: 1% (100 basis points)");
    console.log("- Transaction Manager:", txManagerAddress);
    console.log("- Fee Receiver:", feeReceiverAddress);
    console.log("- Vault Address:", vaultAddress);
    console.log("");
    console.log("🔍 Block Explorer: https://testnet.snowtrace.io");
    console.log("");
    console.log("⚠️  Next Steps:");
    console.log("1. Fund the CCIPTokenTransfer contract with LINK for fee payments");
    console.log("2. Fund user accounts with test tokens for transfers");
    console.log("3. Update frontend configuration to include Avalanche Fuji addresses");
    console.log("4. Test cross-chain transfers between supported networks");
    console.log("");
    console.log("💡 Get test tokens:");
    console.log("- AVAX Faucet: https://faucet.avax.network/");
    console.log("- LINK Faucet: https://faucets.chain.link/fuji");
    console.log("- CCIP Tokens: https://docs.chain.link/ccip/test-tokens#avalanche-fuji");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
