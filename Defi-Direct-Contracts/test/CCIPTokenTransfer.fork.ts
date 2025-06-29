const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CCIPTokenTransfer - Fork Tests", function () {
    
    const SEPOLIA_ADDRESSES = {
        CCIP_ROUTER: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59", 
        LINK_TOKEN: "0x779877A7B0D9E8603169DdbD7836e478b4624789", 
        WETH_TOKEN: "0x097D90c9d3E0B50Ca60e1ae45F6A81010f9FB534", 
        
        CCIP_BnM: "0xFd57b4ddBf88a4e07fF4e34C487b99af2Fe82a05", 
        CCIP_LnM: "0x466D489b6d36E7E3b824ef491C225F5830E81cC1", 
        
        AVALANCHE_FUJI: 14767482510784806043n, 
        ETHEREUM_SEPOLIA: 16015286601757825753n, 
        POLYGON_MUMBAI: 12532609583862916517n, 
        BASE_SEPOLIA: 10344971235874465080n, 
    };

    
    const GAS_LIMIT = 200000;
    const MAX_GAS_LIMIT = 5000000;
    const TRANSFER_AMOUNT = ethers.parseUnits("1", 16); 
    const MIN_TRANSFER_AMOUNT = 1000; 

    async function deployCCIPFixture() {
        console.log("Setting up CCIP fork test environment...");

        const [owner, user1, user2, fiatBridge, receiver] = await ethers.getSigners();

        
        const MockToken = await ethers.getContractFactory("MOCKERC20");
        const testToken = await MockToken.deploy("Test Token", "TEST", 18);
        await testToken.mint(user1.address, ethers.parseUnits("10000", 18));
        await testToken.mint(user2.address, ethers.parseUnits("10000", 18));
        await testToken.mint(owner.address, ethers.parseUnits("10000", 18));

        
        const CCIPTokenTransfer = await ethers.getContractFactory("CCIPTokenTransfer");
        const ccipContract = await CCIPTokenTransfer.deploy(
            SEPOLIA_ADDRESSES.CCIP_ROUTER,
            SEPOLIA_ADDRESSES.LINK_TOKEN,
            fiatBridge.address
        );

        
        const linkToken = await ethers.getContractAt("IERC20", SEPOLIA_ADDRESSES.LINK_TOKEN);
        const wethToken = await ethers.getContractAt("IERC20", SEPOLIA_ADDRESSES.WETH_TOKEN);
        const ccipBnM = await ethers.getContractAt("IERC20", SEPOLIA_ADDRESSES.CCIP_BnM);
        const ccipLnM = await ethers.getContractAt("IERC20", SEPOLIA_ADDRESSES.CCIP_LnM);

        
        console.log("Funding contract and users with CCIP tokens from owner...");

        
        const ownerLinkBalance = await linkToken.balanceOf(owner.address);
        const ownerCcipBnMBalance = await ccipBnM.balanceOf(owner.address);
        const ownerCcipLnMBalance = await ccipLnM.balanceOf(owner.address);

        console.log(`Owner LINK balance: ${ethers.formatUnits(ownerLinkBalance, 18)} LINK`);
        console.log(`Owner CCIP-BnM balance: ${ethers.formatUnits(ownerCcipBnMBalance, 18)} CCIP-BnM`);
        console.log(`Owner CCIP-LnM balance: ${ethers.formatUnits(ownerCcipLnMBalance, 18)} CCIP-LnM`);

        
        if (ownerLinkBalance > ethers.parseUnits("100", 18)) {
            
            await linkToken.connect(owner).transfer(ccipContract.target, ethers.parseUnits("50", 18));
            
            await linkToken.connect(owner).transfer(user1.address, ethers.parseUnits("50", 18));
            await linkToken.connect(owner).transfer(user2.address, ethers.parseUnits("50", 18));
            console.log("Successfully transferred LINK tokens from owner");
        } else {
            console.log("Owner doesn't have enough LINK, funding contract with ETH for native fees");
            await owner.sendTransaction({
                to: ccipContract.target,
                value: ethers.parseEther("10")
            });
        }

        
        if (ownerCcipBnMBalance > ethers.parseUnits("2", 18)) {
            await ccipBnM.connect(owner).transfer(user1.address, ethers.parseUnits("2", 17));
            await ccipBnM.connect(owner).transfer(user2.address, ethers.parseUnits("2", 17));
            console.log("Successfully transferred CCIP-BnM tokens from owner");
        }

        
        if (ownerCcipLnMBalance > ethers.parseUnits("2", 18)) {
            await ccipLnM.connect(owner).transfer(user1.address, ethers.parseUnits("2", 17));
            await ccipLnM.connect(owner).transfer(user2.address, ethers.parseUnits("2", 17));
            console.log("Successfully transferred CCIP-LnM tokens from owner");
        }

        
        await ccipContract.connect(owner).allowlistDestinationChain(SEPOLIA_ADDRESSES.BASE_SEPOLIA, true);
        
        await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);
        
        await ccipContract.connect(owner).updateTokenSupport(SEPOLIA_ADDRESSES.WETH_TOKEN, true);
        await ccipContract.connect(owner).updateTokenSupport(SEPOLIA_ADDRESSES.LINK_TOKEN, true);
        await ccipContract.connect(owner).updateTokenSupport(SEPOLIA_ADDRESSES.CCIP_BnM, true);
        await ccipContract.connect(owner).updateTokenSupport(SEPOLIA_ADDRESSES.CCIP_LnM, true);

        
        await testToken.connect(user1).approve(ccipContract.target, ethers.parseUnits("10000", 18));
        await testToken.connect(user2).approve(ccipContract.target, ethers.parseUnits("10000", 18));
        await linkToken.connect(user1).approve(ccipContract.target, ethers.parseUnits("10000", 18));
        await linkToken.connect(user2).approve(ccipContract.target, ethers.parseUnits("10000", 18));
        await ccipBnM.connect(user1).approve(ccipContract.target, ethers.parseUnits("10000", 18));
        await ccipBnM.connect(user2).approve(ccipContract.target, ethers.parseUnits("10000", 18));
        await ccipLnM.connect(user1).approve(ccipContract.target, ethers.parseUnits("10000", 18));
        await ccipLnM.connect(user2).approve(ccipContract.target, ethers.parseUnits("10000", 18));

        return {
            ccipContract,
            testToken,
            linkToken,
            wethToken,
            ccipBnM,
            ccipLnM,
            owner,
            user1,
            user2,
            fiatBridge,
            receiver
        };
    }

    describe("Contract Deployment and Initial State", function () {
        it("Should deploy with correct initial parameters", async function () {
            const { ccipContract, owner } = await loadFixture(deployCCIPFixture);

            expect(await ccipContract.owner()).to.equal(owner.address);
            expect(await ccipContract.s_linkToken()).to.equal(SEPOLIA_ADDRESSES.LINK_TOKEN);
            expect(await ccipContract.fiatBridgeContract()).to.not.equal(ethers.ZeroAddress);
        });

        it("Should have correct constants", async function () {
            const { ccipContract } = await loadFixture(deployCCIPFixture);

            expect(await ccipContract.MAX_GAS_LIMIT()).to.equal(MAX_GAS_LIMIT);
            expect(await ccipContract.MIN_TRANSFER_AMOUNT()).to.equal(MIN_TRANSFER_AMOUNT);
        });

        it("Should start unpaused", async function () {
            const { ccipContract } = await loadFixture(deployCCIPFixture);

            expect(await ccipContract.paused()).to.equal(false);
        });
    });

    describe("Chain Allowlist Management", function () {
        it("Should allow owner to allowlist destination chains", async function () {
            const { ccipContract, owner } = await loadFixture(deployCCIPFixture);

            expect(await ccipContract.isChainAllowlisted(SEPOLIA_ADDRESSES.AVALANCHE_FUJI)).to.equal(false);

            await ccipContract.connect(owner).allowlistDestinationChain(SEPOLIA_ADDRESSES.AVALANCHE_FUJI, true);

            expect(await ccipContract.isChainAllowlisted(SEPOLIA_ADDRESSES.AVALANCHE_FUJI)).to.equal(true);
        });

        it("Should allow owner to remove chains from allowlist", async function () {
            const { ccipContract, owner } = await loadFixture(deployCCIPFixture);

            
            await ccipContract.connect(owner).allowlistDestinationChain(SEPOLIA_ADDRESSES.AVALANCHE_FUJI, true);
            expect(await ccipContract.isChainAllowlisted(SEPOLIA_ADDRESSES.AVALANCHE_FUJI)).to.equal(true);

            
            await ccipContract.connect(owner).allowlistDestinationChain(SEPOLIA_ADDRESSES.AVALANCHE_FUJI, false);
            expect(await ccipContract.isChainAllowlisted(SEPOLIA_ADDRESSES.AVALANCHE_FUJI)).to.equal(false);
        });

        it("Should emit ChainAllowlistUpdated event", async function () {
            const { ccipContract, owner } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(owner).allowlistDestinationChain(SEPOLIA_ADDRESSES.AVALANCHE_FUJI, true)
            ).to.emit(ccipContract, "ChainAllowlistUpdated")
                .withArgs(SEPOLIA_ADDRESSES.AVALANCHE_FUJI, true);
        });

        it("Should only allow owner to manage allowlist", async function () {
            const { ccipContract, user1 } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(user1).allowlistDestinationChain(SEPOLIA_ADDRESSES.AVALANCHE_FUJI, true)
            ).to.be.revertedWith("Only callable by owner");
        });
    });

    describe("Token Support Management", function () {
        it("Should allow owner to add token support", async function () {
            const { ccipContract, testToken, owner } = await loadFixture(deployCCIPFixture);

            
            await ccipContract.connect(owner).updateTokenSupport(testToken.target, false);
            expect(await ccipContract.isTokenSupported(testToken.target)).to.equal(false);

            
            await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);
            expect(await ccipContract.isTokenSupported(testToken.target)).to.equal(true);
        });

        it("Should emit TokenSupportUpdated event", async function () {
            const { ccipContract, testToken, owner } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(owner).updateTokenSupport(testToken.target, false)
            ).to.emit(ccipContract, "TokenSupportUpdated")
                .withArgs(testToken.target, false);
        });

        it("Should only allow owner to manage token support", async function () {
            const { ccipContract, testToken, user1 } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(user1).updateTokenSupport(testToken.target, true)
            ).to.be.revertedWith("Only callable by owner");
        });
    });

    describe("Fee Estimation", function () {
        it("Should estimate fees correctly for CCIP-BnM with LINK payment", async function () {
            const { ccipContract, receiver } = await loadFixture(deployCCIPFixture);

            const fee = await ccipContract.estimateTransferFee(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                SEPOLIA_ADDRESSES.CCIP_BnM, 
                TRANSFER_AMOUNT,
                SEPOLIA_ADDRESSES.LINK_TOKEN,
                GAS_LIMIT
            );

            expect(fee).to.be.gt(0);
            console.log(`CCIP-BnM transfer fee (LINK): ${ethers.formatUnits(fee, 18)} LINK`);
        });

        it("Should estimate fees correctly for CCIP-BnM with native payment", async function () {
            const { ccipContract, receiver } = await loadFixture(deployCCIPFixture);

            const fee = await ccipContract.estimateTransferFee(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                SEPOLIA_ADDRESSES.CCIP_BnM, 
                TRANSFER_AMOUNT,
                ethers.ZeroAddress, 
                GAS_LIMIT
            );

            expect(fee).to.be.gt(0);
            console.log(`CCIP-BnM transfer fee (native): ${ethers.formatEther(fee)} ETH`);
        });

        it("Should fail fee estimation for unsupported mock token", async function () {
            const { ccipContract, testToken, receiver } = await loadFixture(deployCCIPFixture);

            
            
            try {
                await ccipContract.estimateTransferFee(
                    SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                    receiver.address,
                    testToken.target, 
                    TRANSFER_AMOUNT,
                    SEPOLIA_ADDRESSES.LINK_TOKEN,
                    GAS_LIMIT
                );
                
                expect.fail("Expected UnsupportedToken error but call succeeded");
            } catch (error: any) {
                
                expect(error.message).to.include("0xbf16aab6"); 
            }
        });
    });

    describe("LINK Token Transfers", function () {
        it("Should handle transfer attempt with unsupported mock token", async function () {
            const { ccipContract, testToken, user1, receiver } = await loadFixture(deployCCIPFixture);

            
            
            try {
                await ccipContract.connect(user1).transferTokensPayLINK(
                    SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                    receiver.address,
                    testToken.target, 
                    TRANSFER_AMOUNT,
                    GAS_LIMIT
                );
                
                expect.fail("Expected UnsupportedToken error but call succeeded");
            } catch (error: any) {
                
                expect(error.message).to.include("0xbf16aab6");
            }
        });

        it("Should successfully transfer CCIP-BnM tokens (CCIP supported)", async function () {
            const { ccipContract, ccipBnM, user1, receiver } = await loadFixture(deployCCIPFixture);

            const initialBalance = await ccipBnM.balanceOf(user1.address);
            expect(initialBalance).to.be.gt(0); 

            const transferAmount = ethers.parseUnits("1", 16); 
            const tx = await ccipContract.connect(user1).transferTokensPayLINK(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                ccipBnM.target,
                transferAmount,
                GAS_LIMIT
            );

            const receipt = await tx.wait();

            
            const transferEvent = receipt.logs.find(
                (log: any) => log.fragment && log.fragment.name === "TokensTransferred"
            );
            expect(transferEvent).to.not.be.undefined;
            console.log("CCIP-BnM cross-chain transfer successful!");
        });

        it("Should successfully transfer CCIP-LnM tokens (CCIP supported)", async function () {
            const { ccipContract, ccipLnM, user1, receiver } = await loadFixture(deployCCIPFixture);

            const initialBalance = await ccipLnM.balanceOf(user1.address);
            expect(initialBalance).to.be.gt(0); 

            const transferAmount = ethers.parseUnits("1", 16); 
            const tx = await ccipContract.connect(user1).transferTokensPayLINK(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                ccipLnM.target,
                transferAmount,
                GAS_LIMIT
            );

            const receipt = await tx.wait();

            
            const transferEvent = receipt.logs.find(
                (log: any) => log.fragment && log.fragment.name === "TokensTransferred"
            );
            expect(transferEvent).to.not.be.undefined;
            console.log("CCIP-LnM cross-chain transfer successful!");
        });

        it("Should revert if destination chain not allowlisted", async function () {
            const { ccipContract, testToken, user1, receiver } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    SEPOLIA_ADDRESSES.AVALANCHE_FUJI, 
                    receiver.address,
                    testToken.target,
                    TRANSFER_AMOUNT,
                    GAS_LIMIT
                )
            ).to.be.revertedWithCustomError(ccipContract, "DestinationChainNotAllowlisted");
        });

        it("Should revert if token not supported by our contract", async function () {
            const { ccipContract, user1, receiver, owner } = await loadFixture(deployCCIPFixture);

            
            const MockToken = await ethers.getContractFactory("MOCKERC20");
            const unsupportedToken = await MockToken.deploy("Unsupported", "UNSUP", 18);
            await unsupportedToken.mint(user1.address, TRANSFER_AMOUNT);
            await unsupportedToken.connect(user1).approve(ccipContract.target, TRANSFER_AMOUNT);

            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                    receiver.address,
                    unsupportedToken.target,
                    TRANSFER_AMOUNT,
                    GAS_LIMIT
                )
            ).to.be.revertedWithCustomError(ccipContract, "TokenNotSupported");
        });

        it("Should revert if transfer amount too small", async function () {
            const { ccipContract, testToken, user1, receiver } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                    receiver.address,
                    testToken.target,
                    100, 
                    GAS_LIMIT
                )
            ).to.be.revertedWithCustomError(ccipContract, "InvalidTransferAmount");
        });

        it("Should revert if receiver is zero address", async function () {
            const { ccipContract, testToken, user1 } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                    ethers.ZeroAddress,
                    testToken.target,
                    TRANSFER_AMOUNT,
                    GAS_LIMIT
                )
            ).to.be.revertedWithCustomError(ccipContract, "InvalidReceiverAddress");
        });

        it("Should revert if gas limit too high", async function () {
            const { ccipContract, testToken, user1, receiver } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                    receiver.address,
                    testToken.target,
                    TRANSFER_AMOUNT,
                    6000000 
                )
            ).to.be.revertedWith("Gas limit too high");
        });
    });

    describe("Native Token Transfers", function () {
        it("Should successfully transfer CCIP-BnM tokens paying with native gas", async function () {
            const { ccipContract, ccipBnM, user1, receiver } = await loadFixture(deployCCIPFixture);

            const initialBalance = await ccipBnM.balanceOf(user1.address);
            expect(initialBalance).to.be.gt(0); 

            const transferAmount = ethers.parseUnits("1", 16); 

            
            const estimatedFee = await ccipContract.estimateTransferFee(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                ccipBnM.target,
                transferAmount,
                ethers.ZeroAddress,
                GAS_LIMIT
            );

            const initialEthBalance = await ethers.provider.getBalance(user1.address);

            const tx = await ccipContract.connect(user1).transferTokensPayNative(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                ccipBnM.target,
                transferAmount,
                GAS_LIMIT,
                { value: estimatedFee + ethers.parseEther("0.01") } 
            );

            const receipt = await tx.wait();

            
            const finalBalance = await ccipBnM.balanceOf(user1.address);
            expect(finalBalance).to.equal(initialBalance - transferAmount);

            
            const finalEthBalance = await ethers.provider.getBalance(user1.address);
            expect(finalEthBalance).to.be.lt(initialEthBalance);

            console.log("CCIP-BnM native transfer successful!");
        });

        it("Should revert if insufficient native gas sent", async function () {
            const { ccipContract, ccipBnM, user1, receiver } = await loadFixture(deployCCIPFixture);

            const initialBalance = await ccipBnM.balanceOf(user1.address);
            expect(initialBalance).to.be.gt(0); 

            await expect(
                ccipContract.connect(user1).transferTokensPayNative(
                    SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                    receiver.address,
                    ccipBnM.target,
                    ethers.parseUnits("1", 16),
                    GAS_LIMIT,
                    { value: ethers.parseEther("0.000000000000001") } 
                )
            ).to.be.revertedWithCustomError(ccipContract, "NotEnoughBalance");
        });

        it("Should refund excess native gas", async function () {
            const { ccipContract, ccipBnM, user1, receiver } = await loadFixture(deployCCIPFixture);

            const initialBalance = await ccipBnM.balanceOf(user1.address);
            expect(initialBalance).to.be.gt(0); 

            const transferAmount = ethers.parseUnits("1", 16);

            
            const estimatedFee = await ccipContract.estimateTransferFee(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                ccipBnM.target,
                transferAmount,
                ethers.ZeroAddress,
                GAS_LIMIT
            );

            const excessAmount = ethers.parseEther("1"); 
            const totalSent = estimatedFee + excessAmount;

            const initialEthBalance = await ethers.provider.getBalance(user1.address);

            const tx = await ccipContract.connect(user1).transferTokensPayNative(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                ccipBnM.target,
                transferAmount,
                GAS_LIMIT,
                { value: totalSent }
            );

            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            const finalEthBalance = await ethers.provider.getBalance(user1.address);

            
            const expectedBalance = initialEthBalance - estimatedFee - gasUsed;

            
            const tolerance = ethers.parseEther("0.01");
            expect(finalEthBalance).to.be.closeTo(expectedBalance, tolerance);

            console.log("CCIP-BnM native refund test successful!");
        });
    });

    describe("Pause Functionality", function () {
        it("Should allow owner to pause contract", async function () {
            const { ccipContract, owner } = await loadFixture(deployCCIPFixture);

            await ccipContract.connect(owner).pause();
            expect(await ccipContract.paused()).to.equal(true);
        });

        it("Should allow owner to unpause contract", async function () {
            const { ccipContract, owner } = await loadFixture(deployCCIPFixture);

            await ccipContract.connect(owner).pause();
            await ccipContract.connect(owner).unpause();
            expect(await ccipContract.paused()).to.equal(false);
        });

        it("Should prevent transfers when paused", async function () {
            const { ccipContract, testToken, user1, receiver, owner } = await loadFixture(deployCCIPFixture);

            await ccipContract.connect(owner).pause();

            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                    receiver.address,
                    testToken.target,
                    TRANSFER_AMOUNT,
                    GAS_LIMIT
                )
            ).to.be.revertedWithCustomError(ccipContract, "EnforcedPause");
        });

        it("Should only allow owner to pause/unpause", async function () {
            const { ccipContract, user1 } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(user1).pause()
            ).to.be.revertedWith("Only callable by owner");
        });
    });

    describe("Withdrawal Functions", function () {
        it("Should allow owner to withdraw native tokens", async function () {
            const { ccipContract, owner, user1 } = await loadFixture(deployCCIPFixture);

            
            await user1.sendTransaction({
                to: ccipContract.target,
                value: ethers.parseEther("1")
            });

            const initialBalance = await ethers.provider.getBalance(owner.address);
            const contractBalance = await ethers.provider.getBalance(ccipContract.target);

            const tx = await ccipContract.connect(owner).withdraw(owner.address);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const finalBalance = await ethers.provider.getBalance(owner.address);
            const expectedBalance = initialBalance + contractBalance - gasUsed;

            expect(finalBalance).to.equal(expectedBalance);
        });

        it("Should allow owner to withdraw ERC20 tokens", async function () {
            const { ccipContract, testToken, owner, user1 } = await loadFixture(deployCCIPFixture);

            
            await testToken.connect(user1).transfer(ccipContract.target, ethers.parseUnits("100", 18));

            const initialBalance = await testToken.balanceOf(owner.address);
            const contractBalance = await testToken.balanceOf(ccipContract.target);

            await ccipContract.connect(owner).withdrawToken(owner.address, testToken.target);

            const finalBalance = await testToken.balanceOf(owner.address);
            expect(finalBalance).to.equal(initialBalance + contractBalance);
        });

        it("Should revert withdrawal if nothing to withdraw", async function () {
            const { ccipContract, owner } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(owner).withdraw(owner.address)
            ).to.be.revertedWithCustomError(ccipContract, "NothingToWithdraw");
        });

        it("Should only allow owner to withdraw", async function () {
            const { ccipContract, user1 } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(user1).withdraw(user1.address)
            ).to.be.revertedWith("Only callable by owner");
        });
    });

    describe("Integration with FiatBridge", function () {
        it("Should update FiatBridge contract address", async function () {
            const { ccipContract, owner, user1 } = await loadFixture(deployCCIPFixture);

            const newFiatBridge = user1.address; 

            await ccipContract.connect(owner).updateFiatBridgeContract(newFiatBridge);
            expect(await ccipContract.fiatBridgeContract()).to.equal(newFiatBridge);
        });

        it("Should only allow owner to update FiatBridge contract", async function () {
            const { ccipContract, user1 } = await loadFixture(deployCCIPFixture);

            await expect(
                ccipContract.connect(user1).updateFiatBridgeContract(user1.address)
            ).to.be.revertedWith("Only callable by owner");
        });
    });

    describe("Edge Cases and Error Handling", function () {
        it("Should handle multiple transfers in sequence", async function () {
            const { ccipContract, ccipBnM, user1, receiver } = await loadFixture(deployCCIPFixture);

            const initialBalance = await ccipBnM.balanceOf(user1.address);
            const transferCount = 3;
            const transferAmount = ethers.parseUnits("1", 16); 

            expect(initialBalance).to.be.gte(transferAmount * BigInt(transferCount));

            for (let i = 0; i < transferCount; i++) {
                await ccipContract.connect(user1).transferTokensPayLINK(
                    SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                    receiver.address,
                    ccipBnM.target,
                    transferAmount,
                    GAS_LIMIT
                );
            }

            const finalBalance = await ccipBnM.balanceOf(user1.address);
            const expectedBalance = initialBalance - (transferAmount * BigInt(transferCount));
            expect(finalBalance).to.equal(expectedBalance);
        });

        it("Should handle zero value native transfers (should revert)", async function () {
            const { ccipContract, ccipBnM, user1, receiver } = await loadFixture(deployCCIPFixture);

            const initialBalance = await ccipBnM.balanceOf(user1.address);
            expect(initialBalance).to.be.gt(0);

            await expect(
                ccipContract.connect(user1).transferTokensPayNative(
                    SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                    receiver.address,
                    ccipBnM.target,
                    ethers.parseUnits("1", 16),
                    GAS_LIMIT,
                    { value: 0 }
                )
            ).to.be.revertedWithCustomError(ccipContract, "NotEnoughBalance");
        });

        it("Should maintain correct state after failed transfers", async function () {
            const { ccipContract, ccipBnM, user1, receiver } = await loadFixture(deployCCIPFixture);

            const initialBalance = await ccipBnM.balanceOf(user1.address);
            expect(initialBalance).to.be.gt(0);

            
            try {
                await ccipContract.connect(user1).transferTokensPayLINK(
                    999999n, 
                    receiver.address,
                    ccipBnM.target,
                    ethers.parseUnits("1", 16),
                    GAS_LIMIT
                );
            } catch (error) {
                
            }

            
            const finalBalance = await ccipBnM.balanceOf(user1.address);
            expect(finalBalance).to.equal(initialBalance);
        });
    });

    describe("Gas Optimization Tests", function () {
        it("Should have reasonable gas costs for LINK transfers", async function () {
            const { ccipContract, ccipBnM, user1, receiver } = await loadFixture(deployCCIPFixture);

            const initialBalance = await ccipBnM.balanceOf(user1.address);
            expect(initialBalance).to.be.gt(0); 

            const tx = await ccipContract.connect(user1).transferTokensPayLINK(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                ccipBnM.target,
                ethers.parseUnits("1", 16),
                GAS_LIMIT
            );

            const receipt = await tx.wait();
            console.log(`Gas used for CCIP-BnM LINK transfer: ${receipt.gasUsed}`);

            
            expect(receipt.gasUsed).to.be.lt(500000);
        });

        it("Should have reasonable gas costs for native transfers", async function () {
            const { ccipContract, ccipBnM, user1, receiver } = await loadFixture(deployCCIPFixture);

            const initialBalance = await ccipBnM.balanceOf(user1.address);
            expect(initialBalance).to.be.gt(0); 

            const transferAmount = ethers.parseUnits("1", 16);

            const estimatedFee = await ccipContract.estimateTransferFee(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                ccipBnM.target,
                transferAmount,
                ethers.ZeroAddress,
                GAS_LIMIT
            );

            const tx = await ccipContract.connect(user1).transferTokensPayNative(
                SEPOLIA_ADDRESSES.BASE_SEPOLIA,
                receiver.address,
                ccipBnM.target,
                transferAmount,
                GAS_LIMIT,
                { value: estimatedFee + ethers.parseEther("0.01") }
            );

            const receipt = await tx.wait();
            console.log(`Gas used for CCIP-BnM native transfer: ${receipt.gasUsed}`);

            
            expect(receipt.gasUsed).to.be.lt(500000);
        });
    });
});
