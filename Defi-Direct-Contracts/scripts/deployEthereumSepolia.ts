import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Starting deployment to Ethereum Sepolia...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // // Ethereum Sepolia CCIP Configuration
    const SEPOLIA_ADDRESSES = {
        CCIP_ROUTER: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59", 
        LINK_TOKEN: "0x779877A7B0D9E8603169DdbD7836e478b4624789", 
        WETH_TOKEN: "0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534", 
        
        // CCIP Test Tokens (already deployed on Sepolia)
        CCIP_BnM: "0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05", 
        CCIP_LnM: "0x466D489b6d36E7E3b824ef491C225F5830E81cC1", 
        
        // Chain Selectors
        AVALANCHE_FUJI: 14767482510784806043n, 
        ETHEREUM_SEPOLIA: 16015286601757825753n, 
        POLYGON_MUMBAI: 12532609583862916517n, 
        BASE_SEPOLIA: 10344971235874465080n, 
    };

    // FiatBridge deployment parameters
    const spreadFee = 100; // 1% fee
    const txManagerAddress = deployer.address; // Transaction manager address
    const vaultAddress = deployer.address; // Vault address (using deployer for simplicity)
    const feeReceiverAddress = deployer.address; // Fee receiver address (using deployer for simplicity)

    // console.log("=== Deploying Mock Tokens First ===");

    // // Deploy Mock USDC
    // const MockERC20 = await ethers.getContractFactory("MOCKERC20");
    // const mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);
    // await mockUSDC.waitForDeployment();
    // console.log("Mock USDC deployed to:", mockUSDC.target);

    // // Deploy Mock USDT
    // const mockUSDT = await MockERC20.deploy("Tether USD", "USDT", 6);
    // await mockUSDT.waitForDeployment();
    // console.log("Mock USDT deployed to:", mockUSDT.target);

    // console.log("\n=== Minting Test Tokens ===");

    // // Mint test tokens to deployer
    // const mintAmount = ethers.parseUnits("50000", 6); // 50,000 tokens with 6 decimals

    // await mockUSDC.mint(deployer.address, mintAmount);
    // console.log(`Minted 50,000 USDC to ${deployer.address}`);

    // await mockUSDT.mint(deployer.address, mintAmount);
    // console.log(`Minted 50,000 USDT to ${deployer.address}\n`);

    // console.log("=== Deploying CCIPTokenTransfer ===");

    // // Deploy CCIPTokenTransfer first
    // const CCIPTokenTransfer = await ethers.getContractFactory("CCIPTokenTransfer");
    // const ccipTokenTransfer = await CCIPTokenTransfer.deploy(
    //     SEPOLIA_ADDRESSES.CCIP_ROUTER,
    //     SEPOLIA_ADDRESSES.LINK_TOKEN,
    //     deployer.address // Temporarily set deployer as fiatBridge, will update later
    // );

    // await ccipTokenTransfer.waitForDeployment();
    // console.log("CCIPTokenTransfer deployed to:", ccipTokenTransfer.target);
    // console.log("CCIP Router:", SEPOLIA_ADDRESSES.CCIP_ROUTER);
    // console.log("LINK Token:", SEPOLIA_ADDRESSES.LINK_TOKEN);
    // console.log("Initial FiatBridge address:", deployer.address, "(will be updated)\n");

    // console.log("=== Deploying FiatBridge ===");

    // // Deploy FiatBridge (Direct.sol)
    // const FiatBridge = await ethers.getContractFactory("FiatBridge");
    // const fiatBridge = await FiatBridge.deploy(
    //     spreadFee,
    //     txManagerAddress,
    //     feeReceiverAddress,
    //     vaultAddress,
    //     ccipTokenTransfer.target
    // );

    // await fiatBridge.waitForDeployment();
    // console.log("FiatBridge deployed to:", fiatBridge.target);
    // console.log("Transaction Manager:", txManagerAddress);
    // console.log("Fee Receiver:", feeReceiverAddress);
    // console.log("Vault Address:", vaultAddress, "\n");

    // console.log("=== Updating CCIPTokenTransfer FiatBridge Address ===");

    // // Update CCIPTokenTransfer with the actual FiatBridge address
    // const updateTx = await ccipTokenTransfer.updateFiatBridgeContract(fiatBridge.target);
    // await updateTx.wait();
    // console.log("CCIPTokenTransfer FiatBridge address updated to:", fiatBridge.target, "\n");

    // console.log("=== Setting up CCIP Configuration ===");

    // // Allow multiple destination chains for testing
    // const allowBaseSepoliaTx = await ccipTokenTransfer.allowlistDestinationChain(SEPOLIA_ADDRESSES.BASE_SEPOLIA, true);
    // await allowBaseSepoliaTx.wait();
    // console.log("Base Sepolia chain allowlisted for CCIP transfers");

    // const allowAvalancheTx = await ccipTokenTransfer.allowlistDestinationChain(SEPOLIA_ADDRESSES.AVALANCHE_FUJI, true);
    // await allowAvalancheTx.wait();
    // console.log("Avalanche Fuji chain allowlisted for CCIP transfers");

    // const allowPolygonTx = await ccipTokenTransfer.allowlistDestinationChain(SEPOLIA_ADDRESSES.POLYGON_MUMBAI, true);
    // await allowPolygonTx.wait();
    // console.log("Polygon Mumbai chain allowlisted for CCIP transfers");

    // // Enable support for LINK token in CCIP contract
    // const enableLinkTx = await ccipTokenTransfer.updateTokenSupport(SEPOLIA_ADDRESSES.LINK_TOKEN, true);
    // await enableLinkTx.wait();
    // console.log("LINK token support enabled in CCIP contract\n");

    // console.log("=== Adding Supported Tokens to FiatBridge ===");

    // // Add USDC to supported tokens
    // const addUSDCTx = await fiatBridge.addSupportedToken(mockUSDC.target);
    // await addUSDCTx.wait();
    // console.log("Mock USDC added to supported tokens");

    // // Add USDT to supported tokens
    // const addUSDTTx = await fiatBridge.addSupportedToken(mockUSDT.target);
    // await addUSDTTx.wait();
    // console.log("Mock USDT added to supported tokens");

    // // Add LINK to supported tokens
    // const addLinkTx = await fiatBridge.addSupportedToken(SEPOLIA_ADDRESSES.LINK_TOKEN);
    // await addLinkTx.wait();
    // console.log("LINK token added to supported tokens");

    // // Add CCIP test tokens to supported tokens
    // const addCCIPBnMTx = await fiatBridge.addSupportedToken(SEPOLIA_ADDRESSES.CCIP_BnM);
    // await addCCIPBnMTx.wait();
    // console.log("CCIP-BnM token added to supported tokens");

    // const addCCIPLnMTx = await fiatBridge.addSupportedToken(SEPOLIA_ADDRESSES.CCIP_LnM);
    // await addCCIPLnMTx.wait();
    // console.log("CCIP-LnM token added to supported tokens");

    // console.log("\n=== Adding Supported Tokens to CCIP Contract ===");

    // // Add supported tokens to CCIP contract
    // const ccipUSDCTx = await ccipTokenTransfer.updateTokenSupport(mockUSDC.target, true);
    // await ccipUSDCTx.wait();
    // console.log("Mock USDC support enabled in CCIP contract");

    // const ccipUSDTTx = await ccipTokenTransfer.updateTokenSupport(mockUSDT.target, true);
    // await ccipUSDTTx.wait();
    // console.log("Mock USDT support enabled in CCIP contract");

    const ccipTokenTransfer = await ethers.getContractAt("CCIPTokenTransfer", "0x428e8EB515a8f3d52fDCA8044F1C9334D86a6F2A");
    const fiatBridge = await ethers.getContractAt("FiatBridge", "0x47EC71e8979ec93fCF71FE64FF1F5ee81D51B024")
    const mockUSDC = await ethers.getContractAt("MOCKERC20", "0xF1Cfc4A96166158ED568Ea2d6aBc739Ec0ddAcAb")
    const mockUSDT = await ethers.getContractAt("MOCKERC20", "0xBA00240A1EfD8E2cc702216c19EF07B2E594bcA6")



    const ccipBnMTx = await ccipTokenTransfer.updateTokenSupport(SEPOLIA_ADDRESSES.CCIP_BnM, true);
    await ccipBnMTx.wait();
    console.log("CCIP-BnM support enabled in CCIP contract");

    const ccipLnMTx = await ccipTokenTransfer.updateTokenSupport(SEPOLIA_ADDRESSES.CCIP_LnM, true);
    await ccipLnMTx.wait();
    console.log("CCIP-LnM support enabled in CCIP contract\n");

    console.log("=== Final Contract Verification ===");

    // Verify contract states
    console.log("FiatBridge owner:", await fiatBridge.owner());
    console.log("CCIPTokenTransfer owner:", await ccipTokenTransfer.owner());
    console.log("FiatBridge spread fee:", await fiatBridge.spreadFeePercentage(), "bps");
    console.log("CCIPTokenTransfer fiatBridge address:", await ccipTokenTransfer.fiatBridgeContract());
    
    // Check token support in FiatBridge
    console.log("USDC supported in FiatBridge:", await fiatBridge.supportedTokens(mockUSDC.target));
    console.log("USDT supported in FiatBridge:", await fiatBridge.supportedTokens(mockUSDT.target));
    console.log("LINK supported in FiatBridge:", await fiatBridge.supportedTokens(SEPOLIA_ADDRESSES.LINK_TOKEN));
    console.log("CCIP-BnM supported in FiatBridge:", await fiatBridge.supportedTokens(SEPOLIA_ADDRESSES.CCIP_BnM));
    console.log("CCIP-LnM supported in FiatBridge:", await fiatBridge.supportedTokens(SEPOLIA_ADDRESSES.CCIP_LnM));
    
    // Check chain allowlisting
    console.log("Base Sepolia chain allowlisted in CCIP:", await ccipTokenTransfer.isChainAllowlisted(SEPOLIA_ADDRESSES.BASE_SEPOLIA));
    console.log("Avalanche Fuji chain allowlisted in CCIP:", await ccipTokenTransfer.isChainAllowlisted(SEPOLIA_ADDRESSES.AVALANCHE_FUJI));
    console.log("Polygon Mumbai chain allowlisted in CCIP:", await ccipTokenTransfer.isChainAllowlisted(SEPOLIA_ADDRESSES.POLYGON_MUMBAI), "\n");

    console.log("🎉 === DEPLOYMENT SUMMARY ===");
    console.log("Network: Ethereum Sepolia");
    console.log("Deployer:", deployer.address);
    console.log("=================================");
    console.log("📋 CONTRACT ADDRESSES:");
    console.log("FiatBridge Address:", fiatBridge.target);
    console.log("CCIPTokenTransfer Address:", ccipTokenTransfer.target);
    console.log("=================================");
    console.log("🪙 TOKEN ADDRESSES:");
    console.log("Mock USDC Address:", mockUSDC.target);
    console.log("Mock USDT Address:", mockUSDT.target);
    console.log("CCIP-BnM Address:", SEPOLIA_ADDRESSES.CCIP_BnM);
    console.log("CCIP-LnM Address:", SEPOLIA_ADDRESSES.CCIP_LnM);
    console.log("LINK Token Address:", SEPOLIA_ADDRESSES.LINK_TOKEN);
    console.log("=================================");
    console.log("⚙️  CONFIGURATION:");
    console.log("Transaction Manager:", txManagerAddress);
    console.log("Fee Receiver:", feeReceiverAddress);
    console.log("Vault Address:", vaultAddress);
    console.log("CCIP Router:", SEPOLIA_ADDRESSES.CCIP_ROUTER);
    console.log("Spread Fee:", spreadFee, "bps (1%)");
    console.log("=================================");
    console.log("🔗 SUPPORTED CHAINS:");
    console.log("- Base Sepolia (Chain Selector:", SEPOLIA_ADDRESSES.BASE_SEPOLIA.toString(), ")");
    console.log("- Avalanche Fuji (Chain Selector:", SEPOLIA_ADDRESSES.AVALANCHE_FUJI.toString(), ")");
    console.log("- Polygon Mumbai (Chain Selector:", SEPOLIA_ADDRESSES.POLYGON_MUMBAI.toString(), ")");
    console.log("=================================");
    console.log("✅ All contracts deployed and configured successfully!");
    console.log("✅ All tokens added to support lists");
    console.log("✅ Test tokens minted to deployer (50,000 each)");
    console.log("✅ CCIP configuration completed");
    console.log("✅ Cross-chain transfers enabled to Base Sepolia, Avalanche Fuji, and Polygon Mumbai");
    
    console.log("\n📝 UPDATE YOUR CONFIG.TS WITH THESE ADDRESSES:");
    console.log("=================================");
    console.log(`export const ETHEREUM_SEPOLIA_ADDRESSES = {`);
    console.log(`  FIAT_BRIDGE: "${fiatBridge.target}" as \`0x\${string}\`,`);
    console.log(`  CCIP_TOKEN_TRANSFER: "${ccipTokenTransfer.target}" as \`0x\${string}\`,`);
    console.log(`  CCIP_ROUTER: "${SEPOLIA_ADDRESSES.CCIP_ROUTER}" as \`0x\${string}\`,`);
    console.log(`  LINK_TOKEN: "${SEPOLIA_ADDRESSES.LINK_TOKEN}" as \`0x\${string}\`,`);
    console.log(`  USDC_TOKEN: "${mockUSDC.target}" as \`0x\${string}\`,`);
    console.log(`  USDT_TOKEN: "${mockUSDT.target}" as \`0x\${string}\`,`);
    console.log(`  CCIP_BnM: "${SEPOLIA_ADDRESSES.CCIP_BnM}" as \`0x\${string}\`,`);
    console.log(`  CCIP_LnM: "${SEPOLIA_ADDRESSES.CCIP_LnM}" as \`0x\${string}\`,`);
    console.log(`};`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
