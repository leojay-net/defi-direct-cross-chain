const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("FIAT_BRIDGE - Fork Tests", function () {

    const SPREAD_FEE_PERCENTAGE = 100; // 1%
    const MAX_FEE = 500;

    // Sepolia Chainlink Price Feed Addresses
    const CHAINLINK_AGGREGATORS = {
        // ETH/USD on Sepolia
        ETH_USD: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        // USDC/USD on Sepolia (if available, otherwise we'll use ETH/USD for testing)
        USDC_USD: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E", // This might not exist, we'll handle it
    };

    async function deployContractFixture() {
        console.log("Setting up fork test environment...");

        const [owner, transactionManager, user1, user2, user3, user4] = await ethers.getSigners();

        // Deploy mock USDC token for testing
        const MockToken = await ethers.getContractFactory("MOCKERC20");
        const mockToken = await MockToken.deploy("USD Coin", "USDC", 6);
        await mockToken.mint(owner.address, ethers.parseUnits("10000", 6));
        await mockToken.mint(user1.address, ethers.parseUnits("10000", 6));
        await mockToken.mint(user2.address, ethers.parseUnits("10000", 6));
        await mockToken.mint(user3.address, ethers.parseUnits("10000", 6));
        await mockToken.mint(user4.address, ethers.parseUnits("10000", 6));

        const feeReceiver = user3.address;
        const vaultAddress = user4.address;

        // Deploy FiatBridge contract (without CCIP contract for now)
        const StableFiatBridge = await ethers.getContractFactory("FiatBridge");
        const bridge = await StableFiatBridge.deploy(
            SPREAD_FEE_PERCENTAGE,
            transactionManager.address,
            feeReceiver,
            vaultAddress,
            ethers.ZeroAddress // No CCIP contract for basic tests
        );

        // Add supported token
        await bridge.addSupportedToken(mockToken.target);

        // Approve tokens
        await mockToken.connect(user1).approve(bridge.target, ethers.parseUnits("10000", 6));
        await mockToken.connect(user2).approve(bridge.target, ethers.parseUnits("10000", 6));
        await mockToken.connect(user3).approve(bridge.target, ethers.parseUnits("10000", 6));
        await mockToken.connect(user4).approve(bridge.target, ethers.parseUnits("10000", 6));

        // Test the price feed connection
        console.log("Testing Chainlink price feed connection...");
        try {
            const [price, decimals] = await bridge.getTokenPrice(CHAINLINK_AGGREGATORS.ETH_USD);
            console.log(`ETH/USD Price: ${ethers.formatUnits(price, decimals)} (${decimals} decimals)`);
        } catch (error) {
            console.log("Price feed test failed:", error.message);
        }

        return {
            bridge,
            mockToken,
            owner,
            transactionManager,
            user1,
            user2,
            feeReceiver,
            vaultAddress,
            aggregators: CHAINLINK_AGGREGATORS
        };
    }

    describe("Chainlink Price Feed Integration", function () {
        it("Should fetch price from real Chainlink aggregator", async function () {
            const { bridge, aggregators } = await loadFixture(deployContractFixture);

            // Test ETH/USD price feed
            const [price, decimals] = await bridge.getTokenPrice(aggregators.ETH_USD);

            expect(price).to.be.gt(0);
            expect(decimals).to.equal(8); // Chainlink USD pairs typically have 8 decimals

            console.log(`Current ETH/USD Price: $${ethers.formatUnits(price, decimals)}`);
        });

        it("Should calculate fees based on USD value using Chainlink price", async function () {
            const { bridge, mockToken, aggregators } = await loadFixture(deployContractFixture);

            const tokenAmount = ethers.parseUnits("1000", 6); // 1000 USDC
            const tokenDecimals = 6;

            // Calculate price and fee using real Chainlink data
            const [tokenPriceUSD, totalValueUSD, feeInTokens] = await bridge.calculateTokenPriceAndFee(
                aggregators.ETH_USD,
                tokenAmount,
                tokenDecimals
            );

            expect(tokenPriceUSD).to.be.gt(0);
            expect(totalValueUSD).to.be.gt(0);
            expect(feeInTokens).to.be.gt(0);

            console.log(`Token Price: $${ethers.formatUnits(tokenPriceUSD, 8)}`);
            console.log(`Total Value: $${ethers.formatUnits(totalValueUSD, 8)}`);
            console.log(`Fee in Tokens: ${ethers.formatUnits(feeInTokens, tokenDecimals)}`);
        });

        it("Should initiate transaction with real Chainlink price feed", async function () {
            const { bridge, mockToken, user1, aggregators } = await loadFixture(deployContractFixture);

            const balanceBefore = await mockToken.balanceOf(user1.address);
            const amount = ethers.parseUnits("1000", 6);

            // Use real Chainlink aggregator
            const tx = await bridge.connect(user1).initiateFiatTransaction(
                mockToken.target,
                amount,
                aggregators.ETH_USD,
                1234567890, // Bank account number
                1000, // Fiat amount (e.g., $1000)
                "Test Bank",
                "John Doe"
            );

            const receipt = await tx.wait();

            // Check for TransactionInitiated event
            const event = receipt.logs.find(
                log => bridge.interface.parseLog(log)?.name === "TransactionInitiated"
            );
            expect(event).to.not.be.undefined;

            const parsedEvent = bridge.interface.parseLog(event);
            const txId = parsedEvent.args[0];

            // Verify transaction was created
            const transaction = await bridge.transactions(txId);
            expect(transaction.user).to.equal(user1.address);
            expect(transaction.token).to.equal(mockToken.target);
            expect(transaction.amount).to.equal(amount);
            expect(transaction.fiatBankAccountNumber).to.equal(1234567890);
            expect(transaction.fiatBank).to.equal("Test Bank");
            expect(transaction.recipientName).to.equal("John Doe");

            // Check that tokens were transferred and fees calculated
            const balanceAfter = await mockToken.balanceOf(user1.address);
            expect(balanceAfter).to.be.lt(balanceBefore);

            console.log(`Transaction ID: ${txId}`);
            console.log(`Fee charged: ${ethers.formatUnits(transaction.transactionFee, 6)} USDC`);
        });

        it("Should handle invalid aggregator address", async function () {
            const { bridge, mockToken, user1 } = await loadFixture(deployContractFixture);

            const amount = ethers.parseUnits("1000", 6);

            await expect(
                bridge.connect(user1).initiateFiatTransaction(
                    mockToken.target,
                    amount,
                    ethers.ZeroAddress, // Invalid aggregator
                    1234567890,
                    1000,
                    "Test Bank",
                    "John Doe"
                )
            ).to.be.revertedWith("Invalid aggregator address");
        });

        it("Should complete transaction successfully with real price feed", async function () {
            const { bridge, mockToken, user1, transactionManager, feeReceiver, vaultAddress, aggregators } = await loadFixture(deployContractFixture);

            const amount = ethers.parseUnits("1000", 6);

            // Initiate transaction
            const tx = await bridge.connect(user1).initiateFiatTransaction(
                mockToken.target,
                amount,
                aggregators.ETH_USD,
                1234567890,
                1000,
                "Test Bank",
                "John Doe"
            );

            const receipt = await tx.wait();
            const event = receipt.logs.find(
                log => bridge.interface.parseLog(log)?.name === "TransactionInitiated"
            );
            const parsedEvent = bridge.interface.parseLog(event);
            const txId = parsedEvent.args[0];

            // Get balances before completion
            const feeReceiverBalanceBefore = await mockToken.balanceOf(feeReceiver);
            const vaultBalanceBefore = await mockToken.balanceOf(vaultAddress);

            // Complete transaction
            await bridge.connect(transactionManager).completeTransaction(txId, amount);

            // Verify completion
            const transaction = await bridge.transactions(txId);
            expect(transaction.isCompleted).to.equal(true);
            expect(transaction.amountSpent).to.equal(amount);

            // Check fund transfers
            const feeReceiverBalanceAfter = await mockToken.balanceOf(feeReceiver);
            const vaultBalanceAfter = await mockToken.balanceOf(vaultAddress);

            expect(feeReceiverBalanceAfter).to.be.gt(feeReceiverBalanceBefore);
            expect(vaultBalanceAfter).to.equal(vaultBalanceBefore + amount);

            console.log(`Transaction completed successfully`);
            console.log(`Fee transferred: ${ethers.formatUnits(feeReceiverBalanceAfter - feeReceiverBalanceBefore, 6)} USDC`);
        });
    });

    describe("Price Feed Error Handling", function () {
        it("Should handle stale price feed data", async function () {
            // Note: This test would need a custom mock or very old price feed
            // For now, we'll just test that the function doesn't revert with current data
            const { bridge, aggregators } = await loadFixture(deployContractFixture);

            const [price, decimals] = await bridge.getTokenPrice(aggregators.ETH_USD);
            expect(price).to.be.gt(0);
            expect(decimals).to.equal(8);
        });

        it("Should revert on invalid price feed address", async function () {
            const { bridge } = await loadFixture(deployContractFixture);

            await expect(
                bridge.getTokenPrice("0x1234567890123456789012345678901234567890")
            ).to.be.reverted;
        });
    });

    // You can add more tests here for edge cases, multiple price feeds, etc.
});
