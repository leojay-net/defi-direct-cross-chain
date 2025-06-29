import { ethers } from "hardhat";

async function main() {
    console.log("🌊 Starting deployment to Echo L1 Testnet...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX\n");

    // Echo L1 Configuration
    const ECHO_L1_ADDRESSES = {
        // Note: CCIP is not currently supported on Echo L1
        // These are placeholder addresses - will need to be updated when CCIP support is added
        CCIP_ROUTER: "0x0000000000000000000000000000000000000000", // Placeholder - CCIP not supported yet
        LINK_TOKEN: "0x0000000000000000000000000000000000000000", // Placeholder - LINK not deployed yet

        // Native token (AVAX on Echo L1)
        NATIVE_TOKEN: "0x0000000000000000000000000000000000000000", // ETH equivalent on Echo L1

        // Chain Selectors for future CCIP integration
        ECHO_L1: 173750n, // Chain ID as placeholder for future CCIP selector
        AVALANCHE_FUJI: 14767482510784806043n, // Avalanche Fuji CCIP selector
        DISPATCH_L1: 779672n, // Dispatch L1 chain ID as placeholder
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

    // Deploy Mock LINK token for future CCIP integration
    const mockLINK = await MockERC20.deploy("Chainlink Token", "LINK", 18);
    await mockLINK.waitForDeployment();
    console.log("Mock LINK deployed to:", mockLINK.target);

    // Deploy Echo L1 specific token
    const echoToken = await MockERC20.deploy("Echo Token", "ECHO", 18);
    await echoToken.waitForDeployment();
    console.log("Echo Token deployed to:", echoToken.target);

    console.log("\n=== Minting Test Tokens ===");

    // Mint test tokens to deployer
    const mintAmount = ethers.parseUnits("50000", 6); // 50,000 tokens with 6 decimals
    await mockUSDC.mint(deployer.address, mintAmount);
    console.log(`Minted 50,000 USDC to ${deployer.address}`);

    await mockUSDT.mint(deployer.address, mintAmount);
    console.log(`Minted 50,000 USDT to ${deployer.address}`);

    // Mint LINK tokens with 18 decimals
    const linkMintAmount = ethers.parseUnits("10000", 18);
    await mockLINK.mint(deployer.address, linkMintAmount);
    console.log(`Minted 10,000 LINK to ${deployer.address}`);

    // Mint Echo tokens
    const echoMintAmount = ethers.parseUnits("100000", 18);
    await echoToken.mint(deployer.address, echoMintAmount);
    console.log(`Minted 100,000 ECHO to ${deployer.address}\n`);

    console.log("=== Deploying FiatBridge ===");

    // Deploy FiatBridge contract (without CCIP integration initially)
    const FiatBridge = await ethers.getContractFactory("FiatBridge");
    const fiatBridge = await FiatBridge.deploy(
        spreadFee,
        txManagerAddress,
        feeReceiverAddress,
        vaultAddress,
        ethers.ZeroAddress // No CCIP contract initially
    );

    await fiatBridge.waitForDeployment();
    console.log("FiatBridge deployed to:", fiatBridge.target);
    console.log("Spread fee:", spreadFee, "bps (1%)");
    console.log("Transaction manager:", txManagerAddress);
    console.log("Fee receiver:", feeReceiverAddress);
    console.log("Vault address:", vaultAddress, "\n");

    console.log("=== Adding Supported Tokens to FiatBridge ===");

    // Add USDC to supported tokens
    const addUSDCTx = await fiatBridge.addSupportedToken(mockUSDC.target);
    await addUSDCTx.wait();
    console.log("Mock USDC added to supported tokens");

    // Add USDT to supported tokens
    const addUSDTTx = await fiatBridge.addSupportedToken(mockUSDT.target);
    await addUSDTTx.wait();
    console.log("Mock USDT added to supported tokens");

    // Add LINK to supported tokens for future CCIP integration
    const addLinkTx = await fiatBridge.addSupportedToken(mockLINK.target);
    await addLinkTx.wait();
    console.log("Mock LINK token added to supported tokens");

    // Add Echo token to supported tokens
    const addEchoTx = await fiatBridge.addSupportedToken(echoToken.target);
    await addEchoTx.wait();
    console.log("Echo Token added to supported tokens");

    console.log("\n=== Final Contract Verification ===");

    // Verify contract states
    console.log("FiatBridge owner:", await fiatBridge.owner());
    console.log("FiatBridge spread fee:", await fiatBridge.spreadFeePercentage(), "bps");

    // Check supported tokens
    console.log("USDC supported in FiatBridge:", await fiatBridge.supportedTokens(mockUSDC.target));
    console.log("USDT supported in FiatBridge:", await fiatBridge.supportedTokens(mockUSDT.target));
    console.log("LINK supported in FiatBridge:", await fiatBridge.supportedTokens(mockLINK.target));
    console.log("ECHO supported in FiatBridge:", await fiatBridge.supportedTokens(echoToken.target));

    console.log("\n🎉 Deployment to Echo L1 completed successfully!\n");

    console.log("=== ECHO L1 DEPLOYMENT SUMMARY ===");
    console.log("Network: Echo L1 Testnet");
    console.log("Chain ID: 173750");
    console.log("Deployer:", deployer.address);
    console.log("");
    console.log("📋 Contract Addresses:");
    console.log("┌─────────────────────────┬──────────────────────────────────────────────┐");
    console.log("│ Contract                │ Address                                      │");
    console.log("├─────────────────────────┼──────────────────────────────────────────────┤");
    console.log(`│ FiatBridge              │ ${fiatBridge.target}                         │`);
    console.log(`│ Mock USDC               │ ${mockUSDC.target}                           │`);
    console.log(`│ Mock USDT               │ ${mockUSDT.target}                           │`);
    console.log(`│ Mock LINK               │ ${mockLINK.target}                           │`);
    console.log(`│ Echo Token              │ ${echoToken.target}                          │`);
    console.log("└─────────────────────────┴──────────────────────────────────────────────┘");
    console.log("");
    console.log("⚠️  Important Notes:");
    console.log("- CCIP is not currently supported on Echo L1");
    console.log("- Cross-chain transfers will be available when CCIP support is added");
    console.log("- FiatBridge functions normally for local token operations");
    console.log("- Echo Token is a native L1 token for testing");
    console.log("");
    console.log("💰 Configuration:");
    console.log("- Spread Fee: 1% (100 basis points)");
    console.log("- Transaction Manager:", txManagerAddress);
    console.log("- Fee Receiver:", feeReceiverAddress);
    console.log("- Vault Address:", vaultAddress);
    console.log("");
    console.log("🔍 Block Explorer: https://subnets-test.avax.network/echo");
    console.log("");
    console.log("⚠️  Next Steps:");
    console.log("1. Fund user accounts with test tokens for transfers");
    console.log("2. Update frontend configuration to include Echo L1 addresses");
    console.log("3. Monitor Chainlink CCIP for Echo L1 support");
    console.log("4. Deploy CCIPTokenTransfer when CCIP support becomes available");
    console.log("5. Test inter-L1 communication when available");
    console.log("");
    console.log("💡 Get test tokens:");
    console.log("- AVAX Faucet: https://faucet.avax.network/");
    console.log("- Use the mock tokens deployed above for testing");
    console.log("- ECHO tokens are available for L1-specific testing");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
