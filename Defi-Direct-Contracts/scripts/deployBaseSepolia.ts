import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Starting deployment to Base Sepolia...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Base Sepolia CCIP Configuration
    const BASE_SEPOLIA_ADDRESSES = {
        CCIP_ROUTER: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93", // Base Sepolia CCIP Router
        LINK_TOKEN: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410", // Base Sepolia LINK token
    };

    // FiatBridge deployment parameters
    const spreadFee = 100; // 1% fee
    const txManagerAddress = deployer.address; // Transaction manager address
    const vaultAddress = deployer.address; // Vault address (using deployer for simplicity)
    const feeReceiverAddress = deployer.address; // Fee receiver address (using deployer for simplicity)

    console.log("=== Deploying CCIPTokenTransfer ===");

    // Deploy CCIPTokenTransfer first
    const CCIPTokenTransfer = await ethers.getContractFactory("CCIPTokenTransfer");
    const ccipTokenTransfer = await CCIPTokenTransfer.deploy(
        BASE_SEPOLIA_ADDRESSES.CCIP_ROUTER,
        BASE_SEPOLIA_ADDRESSES.LINK_TOKEN,
        deployer.address // Temporarily set deployer as fiatBridge, will update later
    );

    await ccipTokenTransfer.waitForDeployment();
    console.log("CCIPTokenTransfer deployed to:", ccipTokenTransfer.target);
    console.log("CCIP Router:", BASE_SEPOLIA_ADDRESSES.CCIP_ROUTER);
    console.log("LINK Token:", BASE_SEPOLIA_ADDRESSES.LINK_TOKEN);
    console.log("Initial FiatBridge address:", deployer.address, "(will be updated)\n");

    console.log("=== Deploying FiatBridge ===");

    // Deploy FiatBridge (Direct.sol)
    const FiatBridge = await ethers.getContractFactory("FiatBridge");
    const fiatBridge = await FiatBridge.deploy(
        spreadFee,
        txManagerAddress,
        feeReceiverAddress,
        vaultAddress,
        ccipTokenTransfer.target
    );

    await fiatBridge.waitForDeployment();
    console.log("FiatBridge deployed to:", fiatBridge.target);
    console.log("Transaction Manager:", txManagerAddress);
    console.log("Fee Receiver:", feeReceiverAddress);
    console.log("Vault Address:", vaultAddress, "\n");

    console.log("=== Updating CCIPTokenTransfer FiatBridge Address ===");

    // Update CCIPTokenTransfer with the actual FiatBridge address
    const updateTx = await ccipTokenTransfer.updateFiatBridgeContract(fiatBridge.target);
    await updateTx.wait();
    console.log("CCIPTokenTransfer FiatBridge address updated to:", fiatBridge.target, "\n");

    console.log("=== Setting up CCIP Configuration ===");

    // Allow Base Sepolia as destination chain (self-chain for testing)
    const BASE_SEPOLIA_CHAIN_SELECTOR = 10344971235874465080n;
    const allowChainTx = await ccipTokenTransfer.allowlistDestinationChain(BASE_SEPOLIA_CHAIN_SELECTOR, true);
    await allowChainTx.wait();
    console.log("Base Sepolia chain allowlisted for CCIP transfers");

    // Enable support for LINK token in CCIP contract
    const enableLinkTx = await ccipTokenTransfer.updateTokenSupport(BASE_SEPOLIA_ADDRESSES.LINK_TOKEN, true);
    await enableLinkTx.wait();
    console.log("LINK token support enabled in CCIP contract\n");

    console.log("=== Deploying Mock Tokens ===");

    // Deploy Mock USDC
    const MockERC20 = await ethers.getContractFactory("MOCKERC20");
    const mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);
    await mockUSDC.waitForDeployment();
    console.log("Mock USDC deployed to:", mockUSDC.target);

    // Deploy Mock USDT
    const mockUSDT = await MockERC20.deploy("Tether USD", "USDT", 6);
    await mockUSDT.waitForDeployment();
    console.log("Mock USDT deployed to:", mockUSDT.target, "\n");

    console.log("=== Adding Supported Tokens to FiatBridge ===");

    // Add USDC to supported tokens
    const addUSDCTx = await fiatBridge.addSupportedToken(mockUSDC.target);
    await addUSDCTx.wait();
    console.log("Mock USDC added to supported tokens");

    // Add USDT to supported tokens
    const addUSDTTx = await fiatBridge.addSupportedToken(mockUSDT.target);
    await addUSDTTx.wait();
    console.log("Mock USDT added to supported tokens");

    // Add LINK to supported tokens
    const addLinkTx = await fiatBridge.addSupportedToken(BASE_SEPOLIA_ADDRESSES.LINK_TOKEN);
    await addLinkTx.wait();
    console.log("LINK token added to supported tokens");

    // Add supported tokens to CCIP contract
    const ccipUSDCTx = await ccipTokenTransfer.updateTokenSupport(mockUSDC.target, true);
    await ccipUSDCTx.wait();
    console.log("Mock USDC support enabled in CCIP contract");

    const ccipUSDTTx = await ccipTokenTransfer.updateTokenSupport(mockUSDT.target, true);
    await ccipUSDTTx.wait();
    console.log("Mock USDT support enabled in CCIP contract\n");

    console.log("=== Minting Test Tokens ===");

    // Mint test tokens to deployer
    const mintAmount = ethers.parseUnits("10000", 6); // 10,000 tokens with 6 decimals

    await mockUSDC.mint(deployer.address, mintAmount);
    console.log(`Minted 10,000 USDC to ${deployer.address}`);

    await mockUSDT.mint(deployer.address, mintAmount);
    console.log(`Minted 10,000 USDT to ${deployer.address}\n`);

    console.log("=== Final Contract Verification ===");

    // Verify contract states
    console.log("FiatBridge owner:", await fiatBridge.owner());
    console.log("CCIPTokenTransfer owner:", await ccipTokenTransfer.owner());
    console.log("FiatBridge spread fee:", await fiatBridge.spreadFeePercentage(), "bps");
    console.log("CCIPTokenTransfer fiatBridge address:", await ccipTokenTransfer.fiatBridgeContract());
    console.log("USDC supported in FiatBridge:", await fiatBridge.supportedTokens(mockUSDC.target));
    console.log("USDT supported in FiatBridge:", await fiatBridge.supportedTokens(mockUSDT.target));
    console.log("LINK supported in FiatBridge:", await fiatBridge.supportedTokens(BASE_SEPOLIA_ADDRESSES.LINK_TOKEN));
    console.log("Base Sepolia chain allowlisted in CCIP:", await ccipTokenTransfer.isChainAllowlisted(BASE_SEPOLIA_CHAIN_SELECTOR), "\n");

    console.log("🎉 === DEPLOYMENT SUMMARY ===");
    console.log("Network: Base Sepolia");
    console.log("Deployer:", deployer.address);
    console.log("=================================");
    console.log("FiatBridge Address:", fiatBridge.target);
    console.log("CCIPTokenTransfer Address:", ccipTokenTransfer.target);
    console.log("Mock USDC Address:", mockUSDC.target);
    console.log("Mock USDT Address:", mockUSDT.target);
    console.log("=================================");
    console.log("Configuration:");
    console.log("Transaction Manager:", txManagerAddress);
    console.log("Fee Receiver:", feeReceiverAddress);
    console.log("Vault Address:", vaultAddress);
    console.log("CCIP Router:", BASE_SEPOLIA_ADDRESSES.CCIP_ROUTER);
    console.log("LINK Token:", BASE_SEPOLIA_ADDRESSES.LINK_TOKEN);
    console.log("=================================");
    console.log("✅ All contracts deployed and configured successfully!");
    console.log("✅ All tokens added to support lists");
    console.log("✅ Test tokens minted to deployer");
    console.log("✅ CCIP configuration completed");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
