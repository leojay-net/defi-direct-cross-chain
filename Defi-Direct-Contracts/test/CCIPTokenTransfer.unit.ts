const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CCIPTokenTransfer - Unit Tests", function () {

    const MOCK_ADDRESSES = {
        CCIP_ROUTER: "0x1111111111111111111111111111111111111111",
        LINK_TOKEN: "0x2222222222222222222222222222222222222222",
        DESTINATION_CHAIN: 12345n,
        ZERO_ADDRESS: ethers.ZeroAddress
    };

    const GAS_LIMIT = 200000;
    const TRANSFER_AMOUNT = ethers.parseUnits("100", 18);
    const MIN_TRANSFER_AMOUNT = 1000;
    const MAX_GAS_LIMIT = 5000000;

    async function deployUnitTestFixture() {
        const [owner, user1, user2, fiatBridge, receiver] = await ethers.getSigners();


        const MockLINK = await ethers.getContractFactory("MOCKERC20");
        const mockLinkToken = await MockLINK.deploy("ChainLink Token", "LINK", 18);
        await mockLinkToken.mint(owner.address, ethers.parseUnits("1000", 18));
        await mockLinkToken.mint(user1.address, ethers.parseUnits("1000", 18));


        const MockToken = await ethers.getContractFactory("MOCKERC20");
        const testToken = await MockToken.deploy("Test Token", "TEST", 18);
        await testToken.mint(user1.address, ethers.parseUnits("10000", 18));
        await testToken.mint(user2.address, ethers.parseUnits("10000", 18));


        const MockRouter = await ethers.getContractFactory("MOCKERC20");
        const mockRouter = await MockRouter.deploy("Router", "ROUTER", 18);


        const CCIPTokenTransfer = await ethers.getContractFactory("CCIPTokenTransfer");
        const ccipContract = await CCIPTokenTransfer.deploy(
            mockRouter.target,
            mockLinkToken.target,
            fiatBridge.address
        );


        await testToken.connect(user1).approve(ccipContract.target, ethers.parseUnits("10000", 18));
        await testToken.connect(user2).approve(ccipContract.target, ethers.parseUnits("10000", 18));
        await mockLinkToken.connect(user1).approve(ccipContract.target, ethers.parseUnits("1000", 18));

        return {
            ccipContract,
            testToken,
            mockLinkToken,
            mockRouter,
            owner,
            user1,
            user2,
            fiatBridge,
            receiver
        };
    }

    describe("Contract Initialization", function () {
        it("Should deploy with correct parameters", async function () {
            const { ccipContract, mockLinkToken, mockRouter, fiatBridge, owner } = await loadFixture(deployUnitTestFixture);

            expect(await ccipContract.owner()).to.equal(owner.address);
            expect(await ccipContract.s_linkToken()).to.equal(mockLinkToken.target);
            expect(await ccipContract.fiatBridgeContract()).to.equal(fiatBridge.address);
        });

        it("Should have correct constants", async function () {
            const { ccipContract } = await loadFixture(deployUnitTestFixture);

            expect(await ccipContract.MAX_GAS_LIMIT()).to.equal(MAX_GAS_LIMIT);
            expect(await ccipContract.MIN_TRANSFER_AMOUNT()).to.equal(MIN_TRANSFER_AMOUNT);
        });

        it("Should start with empty allowlists", async function () {
            const { ccipContract, testToken } = await loadFixture(deployUnitTestFixture);

            expect(await ccipContract.isChainAllowlisted(MOCK_ADDRESSES.DESTINATION_CHAIN)).to.equal(false);
            expect(await ccipContract.isTokenSupported(testToken.target)).to.equal(false);
        });

        it("Should start unpaused", async function () {
            const { ccipContract } = await loadFixture(deployUnitTestFixture);

            expect(await ccipContract.paused()).to.equal(false);
        });
    });

    describe("Ownership and Access Control", function () {
        it("Should transfer ownership correctly", async function () {
            const { ccipContract, owner, user1 } = await loadFixture(deployUnitTestFixture);


            await ccipContract.connect(owner).transferOwnership(user1.address);
            await ccipContract.connect(user1).acceptOwnership();

            expect(await ccipContract.owner()).to.equal(user1.address);
        });

        it("Should require acceptance for ownership transfer", async function () {
            const { ccipContract, owner, user1 } = await loadFixture(deployUnitTestFixture);


            await ccipContract.connect(owner).transferOwnership(user1.address);


            expect(await ccipContract.owner()).to.equal(owner.address);


            await ccipContract.connect(user1).acceptOwnership();
            expect(await ccipContract.owner()).to.equal(user1.address);
        }); it("Should not allow non-owner to call owner functions", async function () {
            const { ccipContract, user1 } = await loadFixture(deployUnitTestFixture);

            await expect(
                ccipContract.connect(user1).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true)
            ).to.be.revertedWith("Only callable by owner");
        });
    });

    describe("Chain Allowlist Management", function () {
        it("Should add chain to allowlist", async function () {
            const { ccipContract, owner } = await loadFixture(deployUnitTestFixture);

            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
            expect(await ccipContract.isChainAllowlisted(MOCK_ADDRESSES.DESTINATION_CHAIN)).to.equal(true);
        });

        it("Should remove chain from allowlist", async function () {
            const { ccipContract, owner } = await loadFixture(deployUnitTestFixture);


            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
            expect(await ccipContract.isChainAllowlisted(MOCK_ADDRESSES.DESTINATION_CHAIN)).to.equal(true);


            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, false);
            expect(await ccipContract.isChainAllowlisted(MOCK_ADDRESSES.DESTINATION_CHAIN)).to.equal(false);
        });

        it("Should emit ChainAllowlistUpdated event", async function () {
            const { ccipContract, owner } = await loadFixture(deployUnitTestFixture);

            await expect(
                ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true)
            ).to.emit(ccipContract, "ChainAllowlistUpdated")
                .withArgs(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
        });

        it("Should handle multiple chains", async function () {
            const { ccipContract, owner } = await loadFixture(deployUnitTestFixture);

            const chain1 = 111n;
            const chain2 = 222n;
            const chain3 = 333n;

            await ccipContract.connect(owner).allowlistDestinationChain(chain1, true);
            await ccipContract.connect(owner).allowlistDestinationChain(chain2, true);
            await ccipContract.connect(owner).allowlistDestinationChain(chain3, false);

            expect(await ccipContract.isChainAllowlisted(chain1)).to.equal(true);
            expect(await ccipContract.isChainAllowlisted(chain2)).to.equal(true);
            expect(await ccipContract.isChainAllowlisted(chain3)).to.equal(false);
        });
    });

    describe("Token Support Management", function () {
        it("Should add token support", async function () {
            const { ccipContract, testToken, owner } = await loadFixture(deployUnitTestFixture);

            await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);
            expect(await ccipContract.isTokenSupported(testToken.target)).to.equal(true);
        });

        it("Should remove token support", async function () {
            const { ccipContract, testToken, owner } = await loadFixture(deployUnitTestFixture);


            await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);
            expect(await ccipContract.isTokenSupported(testToken.target)).to.equal(true);


            await ccipContract.connect(owner).updateTokenSupport(testToken.target, false);
            expect(await ccipContract.isTokenSupported(testToken.target)).to.equal(false);
        });

        it("Should emit TokenSupportUpdated event", async function () {
            const { ccipContract, testToken, owner } = await loadFixture(deployUnitTestFixture);

            await expect(
                ccipContract.connect(owner).updateTokenSupport(testToken.target, true)
            ).to.emit(ccipContract, "TokenSupportUpdated")
                .withArgs(testToken.target, true);
        });

        it("Should handle multiple tokens", async function () {
            const { ccipContract, owner } = await loadFixture(deployUnitTestFixture);


            const Token1 = await ethers.getContractFactory("MOCKERC20");
            const token1 = await Token1.deploy("Token1", "TK1", 18);
            const token2 = await Token1.deploy("Token2", "TK2", 18);
            const token3 = await Token1.deploy("Token3", "TK3", 18);

            await ccipContract.connect(owner).updateTokenSupport(token1.target, true);
            await ccipContract.connect(owner).updateTokenSupport(token2.target, true);
            await ccipContract.connect(owner).updateTokenSupport(token3.target, false);

            expect(await ccipContract.isTokenSupported(token1.target)).to.equal(true);
            expect(await ccipContract.isTokenSupported(token2.target)).to.equal(true);
            expect(await ccipContract.isTokenSupported(token3.target)).to.equal(false);
        });
    });

    describe("FiatBridge Contract Management", function () {
        it("Should update FiatBridge contract address", async function () {
            const { ccipContract, owner, user1 } = await loadFixture(deployUnitTestFixture);

            await ccipContract.connect(owner).updateFiatBridgeContract(user1.address);
            expect(await ccipContract.fiatBridgeContract()).to.equal(user1.address);
        }); it("Should only allow owner to update FiatBridge contract", async function () {
            const { ccipContract, user1 } = await loadFixture(deployUnitTestFixture);

            await expect(
                ccipContract.connect(user1).updateFiatBridgeContract(user1.address)
            ).to.be.revertedWith("Only callable by owner");
        });
    });

    describe("Pause/Unpause Functionality", function () {
        it("Should pause the contract", async function () {
            const { ccipContract, owner } = await loadFixture(deployUnitTestFixture);

            await ccipContract.connect(owner).pause();
            expect(await ccipContract.paused()).to.equal(true);
        });

        it("Should unpause the contract", async function () {
            const { ccipContract, owner } = await loadFixture(deployUnitTestFixture);

            await ccipContract.connect(owner).pause();
            await ccipContract.connect(owner).unpause();
            expect(await ccipContract.paused()).to.equal(false);
        }); it("Should only allow owner to pause/unpause", async function () {
            const { ccipContract, user1 } = await loadFixture(deployUnitTestFixture);

            await expect(
                ccipContract.connect(user1).pause()
            ).to.be.revertedWith("Only callable by owner");

            await expect(
                ccipContract.connect(user1).unpause()
            ).to.be.revertedWith("Only callable by owner");
        });
    });

    describe("Validation Functions", function () {
        describe("Chain Validation", function () {
            it("Should validate allowlisted chains", async function () {
                const { ccipContract, testToken, owner, user1, receiver } = await loadFixture(deployUnitTestFixture);


                await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);


                await expect(
                    ccipContract.connect(user1).transferTokensPayLINK(
                        MOCK_ADDRESSES.DESTINATION_CHAIN,
                        receiver.address,
                        testToken.target,
                        TRANSFER_AMOUNT,
                        GAS_LIMIT
                    )
                ).to.be.revertedWithCustomError(ccipContract, "DestinationChainNotAllowlisted");
            });
        });

        describe("Token Validation", function () {
            it("Should validate supported tokens", async function () {
                const { ccipContract, testToken, owner, user1, receiver } = await loadFixture(deployUnitTestFixture);


                await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);


                await expect(
                    ccipContract.connect(user1).transferTokensPayLINK(
                        MOCK_ADDRESSES.DESTINATION_CHAIN,
                        receiver.address,
                        testToken.target,
                        TRANSFER_AMOUNT,
                        GAS_LIMIT
                    )
                ).to.be.revertedWithCustomError(ccipContract, "TokenNotSupported");
            });
        });

        describe("Receiver Validation", function () {
            it("Should validate receiver address", async function () {
                const { ccipContract, testToken, owner, user1 } = await loadFixture(deployUnitTestFixture);


                await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
                await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);


                await expect(
                    ccipContract.connect(user1).transferTokensPayLINK(
                        MOCK_ADDRESSES.DESTINATION_CHAIN,
                        ethers.ZeroAddress,
                        testToken.target,
                        TRANSFER_AMOUNT,
                        GAS_LIMIT
                    )
                ).to.be.revertedWithCustomError(ccipContract, "InvalidReceiverAddress");
            });
        });

        describe("Amount Validation", function () {
            it("Should validate minimum transfer amount", async function () {
                const { ccipContract, testToken, owner, user1, receiver } = await loadFixture(deployUnitTestFixture);


                await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
                await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);


                await expect(
                    ccipContract.connect(user1).transferTokensPayLINK(
                        MOCK_ADDRESSES.DESTINATION_CHAIN,
                        receiver.address,
                        testToken.target,
                        100,
                        GAS_LIMIT
                    )
                ).to.be.revertedWithCustomError(ccipContract, "InvalidTransferAmount");
            });
        });

        describe("Gas Limit Validation", function () {
            it("Should validate gas limit", async function () {
                const { ccipContract, testToken, owner, user1, receiver } = await loadFixture(deployUnitTestFixture);


                await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
                await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);


                await expect(
                    ccipContract.connect(user1).transferTokensPayLINK(
                        MOCK_ADDRESSES.DESTINATION_CHAIN,
                        receiver.address,
                        testToken.target,
                        TRANSFER_AMOUNT,
                        5000001
                    )
                ).to.be.revertedWith("Gas limit too high");
            });
        });
    });

    describe("Withdrawal Functions", function () {
        it("Should handle withdrawal when nothing to withdraw", async function () {
            const { ccipContract, owner } = await loadFixture(deployUnitTestFixture);

            await expect(
                ccipContract.connect(owner).withdraw(owner.address)
            ).to.be.revertedWithCustomError(ccipContract, "NothingToWithdraw");
        });

        it("Should handle token withdrawal when nothing to withdraw", async function () {
            const { ccipContract, testToken, owner } = await loadFixture(deployUnitTestFixture);

            await expect(
                ccipContract.connect(owner).withdrawToken(owner.address, testToken.target)
            ).to.be.revertedWithCustomError(ccipContract, "NothingToWithdraw");
        });

        it("Should allow withdrawal of native tokens", async function () {
            const { ccipContract, owner, user1 } = await loadFixture(deployUnitTestFixture);


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
            expect(await ethers.provider.getBalance(ccipContract.target)).to.equal(0);
        });

        it("Should allow withdrawal of ERC20 tokens", async function () {
            const { ccipContract, testToken, owner, user1 } = await loadFixture(deployUnitTestFixture);


            const transferAmount = ethers.parseUnits("100", 18);
            await testToken.connect(user1).transfer(ccipContract.target, transferAmount);

            const initialBalance = await testToken.balanceOf(owner.address);

            await ccipContract.connect(owner).withdrawToken(owner.address, testToken.target);

            const finalBalance = await testToken.balanceOf(owner.address);
            expect(finalBalance).to.equal(initialBalance + transferAmount);
            expect(await testToken.balanceOf(ccipContract.target)).to.equal(0);
        }); it("Should only allow owner to withdraw", async function () {
            const { ccipContract, testToken, user1 } = await loadFixture(deployUnitTestFixture);

            await expect(
                ccipContract.connect(user1).withdraw(user1.address)
            ).to.be.revertedWith("Only callable by owner");

            await expect(
                ccipContract.connect(user1).withdrawToken(user1.address, testToken.target)
            ).to.be.revertedWith("Only callable by owner");
        });
    });

    describe("Receive Function", function () {
        it("Should receive native tokens", async function () {
            const { ccipContract, user1 } = await loadFixture(deployUnitTestFixture);

            const sendAmount = ethers.parseEther("1");
            const initialBalance = await ethers.provider.getBalance(ccipContract.target);

            await user1.sendTransaction({
                to: ccipContract.target,
                value: sendAmount
            });

            const finalBalance = await ethers.provider.getBalance(ccipContract.target);
            expect(finalBalance).to.equal(initialBalance + sendAmount);
        });
    });

    describe("Modifiers Testing", function () {
        it("Should test onlyAllowlistedChain modifier", async function () {
            const { ccipContract, testToken, owner, user1, receiver } = await loadFixture(deployUnitTestFixture);


            await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);


            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    MOCK_ADDRESSES.DESTINATION_CHAIN,
                    receiver.address,
                    testToken.target,
                    TRANSFER_AMOUNT,
                    GAS_LIMIT
                )
            ).to.be.revertedWithCustomError(ccipContract, "DestinationChainNotAllowlisted");
        });

        it("Should test validateReceiver modifier", async function () {
            const { ccipContract, testToken, owner, user1 } = await loadFixture(deployUnitTestFixture);


            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
            await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);


            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    MOCK_ADDRESSES.DESTINATION_CHAIN,
                    ethers.ZeroAddress,
                    testToken.target,
                    TRANSFER_AMOUNT,
                    GAS_LIMIT
                )
            ).to.be.revertedWithCustomError(ccipContract, "InvalidReceiverAddress");
        });

        it("Should test onlySupportedToken modifier", async function () {
            const { ccipContract, testToken, owner, user1, receiver } = await loadFixture(deployUnitTestFixture);


            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);


            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    MOCK_ADDRESSES.DESTINATION_CHAIN,
                    receiver.address,
                    testToken.target,
                    TRANSFER_AMOUNT,
                    GAS_LIMIT
                )
            ).to.be.revertedWithCustomError(ccipContract, "TokenNotSupported");
        });

        it("Should test validateAmount modifier", async function () {
            const { ccipContract, testToken, owner, user1, receiver } = await loadFixture(deployUnitTestFixture);


            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
            await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);


            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    MOCK_ADDRESSES.DESTINATION_CHAIN,
                    receiver.address,
                    testToken.target,
                    MIN_TRANSFER_AMOUNT - 1,
                    GAS_LIMIT
                )
            ).to.be.revertedWithCustomError(ccipContract, "InvalidTransferAmount");
        });

        it("Should test whenNotPaused modifier", async function () {
            const { ccipContract, testToken, owner, user1, receiver } = await loadFixture(deployUnitTestFixture);


            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
            await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);


            await ccipContract.connect(owner).pause();


            await expect(
                ccipContract.connect(user1).transferTokensPayLINK(
                    MOCK_ADDRESSES.DESTINATION_CHAIN,
                    receiver.address,
                    testToken.target,
                    TRANSFER_AMOUNT,
                    GAS_LIMIT
                )
            ).to.be.revertedWithCustomError(ccipContract, "EnforcedPause");
        });
    });

    describe("State Management", function () {
        it("Should maintain correct state across multiple operations", async function () {
            const { ccipContract, testToken, owner } = await loadFixture(deployUnitTestFixture);

            const chain1 = 111n;
            const chain2 = 222n;


            await ccipContract.connect(owner).allowlistDestinationChain(chain1, true);
            expect(await ccipContract.isChainAllowlisted(chain1)).to.equal(true);
            expect(await ccipContract.isChainAllowlisted(chain2)).to.equal(false);


            await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);
            expect(await ccipContract.isTokenSupported(testToken.target)).to.equal(true);


            await ccipContract.connect(owner).allowlistDestinationChain(chain2, true);
            expect(await ccipContract.isChainAllowlisted(chain1)).to.equal(true);
            expect(await ccipContract.isChainAllowlisted(chain2)).to.equal(true);


            await ccipContract.connect(owner).allowlistDestinationChain(chain1, false);
            expect(await ccipContract.isChainAllowlisted(chain1)).to.equal(false);
            expect(await ccipContract.isChainAllowlisted(chain2)).to.equal(true);


            expect(await ccipContract.isTokenSupported(testToken.target)).to.equal(true);
        });

        it("Should handle edge cases in state management", async function () {
            const { ccipContract, testToken, owner } = await loadFixture(deployUnitTestFixture);


            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, true);
            expect(await ccipContract.isChainAllowlisted(MOCK_ADDRESSES.DESTINATION_CHAIN)).to.equal(true);

            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, false);
            await ccipContract.connect(owner).allowlistDestinationChain(MOCK_ADDRESSES.DESTINATION_CHAIN, false);
            expect(await ccipContract.isChainAllowlisted(MOCK_ADDRESSES.DESTINATION_CHAIN)).to.equal(false);


            await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);
            await ccipContract.connect(owner).updateTokenSupport(testToken.target, true);
            expect(await ccipContract.isTokenSupported(testToken.target)).to.equal(true);

            await ccipContract.connect(owner).updateTokenSupport(testToken.target, false);
            await ccipContract.connect(owner).updateTokenSupport(testToken.target, false);
            expect(await ccipContract.isTokenSupported(testToken.target)).to.equal(false);
        });
    });
});
