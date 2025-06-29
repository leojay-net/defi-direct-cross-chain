'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, CheckCircle, XCircle, Info, Zap, Link as LinkIcon } from 'lucide-react';
import { useCCIPTransfer } from '@/hooks/useCCIPTransfer';
import { SUPPORTED_CHAINS, AVALANCHE_FUJI_ADDRESSES } from '@/config';
import { CCIPTransferParams } from '@/services/ccipTransferService';

// Available tokens on Avalanche Fuji
const AVALANCHE_FUJI_TOKENS = {
    'USDC': {
        address: AVALANCHE_FUJI_ADDRESSES.USDC_TOKEN,
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6
    },
    'USDT': {
        address: AVALANCHE_FUJI_ADDRESSES.USDT_TOKEN,
        name: 'Tether USD',
        symbol: 'USDT',
        decimals: 6
    },
    'LINK': {
        address: AVALANCHE_FUJI_ADDRESSES.LINK_TOKEN,
        name: 'Chainlink Token',
        symbol: 'LINK',
        decimals: 18
    },
    'CCIP-BnM': {
        address: AVALANCHE_FUJI_ADDRESSES.CCIP_BnM,
        name: 'CCIP Test Token (Burn & Mint)',
        symbol: 'CCIP-BnM',
        decimals: 18
    },
    'CCIP-LnM': {
        address: AVALANCHE_FUJI_ADDRESSES.CCIP_LnM,
        name: 'CCIP Test Token (Lock & Mint)',
        symbol: 'CCIP-LnM',
        decimals: 18
    },
} as const;

interface TokenBalance {
    balance: string;
    decimals: number;
    allowance: string;
}

export const CrossChainTransferForm = () => {
    const { address } = useAccount();
    const {
        isLoading,
        isEstimating,
        estimate,
        error,
        result,
        estimateFee,
        executeTransfer,
        checkChainSupport,
        checkTokenSupport,
        getTokenBalance,
        reset
    } = useCCIPTransfer();

    // Form state
    const [selectedToken, setSelectedToken] = useState<string>('');
    const [destinationChain, setDestinationChain] = useState<string>('');
    const [receiverAddress, setReceiverAddress] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [payWithNative, setPayWithNative] = useState<boolean>(true);

    // Validation state
    const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);
    const [chainSupported, setChainSupported] = useState<boolean>(false);
    const [tokenSupported, setTokenSupported] = useState<boolean>(false);
    const [isValidating, setIsValidating] = useState<boolean>(false);

    // Reset form
    const resetForm = () => {
        setSelectedToken('');
        setDestinationChain('');
        setReceiverAddress('');
        setAmount('');
        setTokenBalance(null);
        setChainSupported(false);
        setTokenSupported(false);
        reset();
    };

    // Validate chain support
    useEffect(() => {
        if (destinationChain) {
            const chain = SUPPORTED_CHAINS.find(c => c.selector.toString() === destinationChain);
            if (chain) {
                checkChainSupport(chain.selector).then(setChainSupported);
            }
        } else {
            setChainSupported(false);
        }
    }, [destinationChain, checkChainSupport]);

    // Validate token support and get balance
    useEffect(() => {
        if (selectedToken && address) {
            setIsValidating(true);
            const tokenInfo = AVALANCHE_FUJI_TOKENS[selectedToken as keyof typeof AVALANCHE_FUJI_TOKENS];

            if (tokenInfo) {
                Promise.all([
                    checkTokenSupport(tokenInfo.address),
                    getTokenBalance(tokenInfo.address, address)
                ]).then(([supported, balance]) => {
                    setTokenSupported(supported);
                    setTokenBalance(balance);
                }).catch(console.error).finally(() => {
                    setIsValidating(false);
                });
            }
        } else {
            setTokenSupported(false);
            setTokenBalance(null);
            setIsValidating(false);
        }
    }, [selectedToken, address, checkTokenSupport, getTokenBalance]);

    // Auto-estimate fee when params change
    useEffect(() => {
        if (selectedToken && destinationChain && receiverAddress && amount && tokenSupported && chainSupported) {
            const tokenInfo = AVALANCHE_FUJI_TOKENS[selectedToken as keyof typeof AVALANCHE_FUJI_TOKENS];
            const chain = SUPPORTED_CHAINS.find(c => c.selector.toString() === destinationChain);

            if (tokenInfo && chain && tokenBalance) {
                try {
                    const amountBigInt = parseUnits(amount, tokenInfo.decimals);
                    const params: CCIPTransferParams = {
                        destinationChainSelector: chain.selector,
                        receiver: receiverAddress as `0x${string}`,
                        token: tokenInfo.address,
                        amount: amountBigInt,
                        payWithNative
                    };

                    estimateFee(params);
                } catch (err) {
                    console.error('Error preparing estimate:', err);
                }
            }
        }
    }, [selectedToken, destinationChain, receiverAddress, amount, payWithNative, tokenSupported, chainSupported, tokenBalance, estimateFee]);

    const handleTransfer = async () => {
        if (!selectedToken || !destinationChain || !receiverAddress || !amount || !tokenBalance) {
            return;
        }

        const tokenInfo = AVALANCHE_FUJI_TOKENS[selectedToken as keyof typeof AVALANCHE_FUJI_TOKENS];
        const chain = SUPPORTED_CHAINS.find(c => c.selector.toString() === destinationChain);

        if (!tokenInfo || !chain) {
            return;
        }

        try {
            const amountBigInt = parseUnits(amount, tokenInfo.decimals);
            const params: CCIPTransferParams = {
                destinationChainSelector: chain.selector,
                receiver: receiverAddress as `0x${string}`,
                token: tokenInfo.address,
                amount: amountBigInt,
                payWithNative
            };

            await executeTransfer(params);
        } catch (err) {
            console.error('Transfer failed:', err);
        }
    };

    const isFormValid = selectedToken && destinationChain && receiverAddress && amount &&
        tokenSupported && chainSupported && tokenBalance &&
        parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(tokenBalance.balance);

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <Card className="bg-[#1C1C27] border-gray-700">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Zap className="h-5 w-5 text-[#9C2CFF]" />
                        Cross-Chain Token Transfer
                    </CardTitle>
                    <p className="text-gray-400 text-sm">
                        Transfer your tokens securely across different blockchains using Chainlink CCIP
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Token Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="token" className="text-white">Select Token</Label>
                        <Select value={selectedToken} onValueChange={setSelectedToken}>
                            <SelectTrigger className="bg-[#2F2F3A] border-gray-700 text-white">
                                <SelectValue placeholder="Choose a token to transfer" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#2F2F3A] border-gray-700">
                                {Object.entries(AVALANCHE_FUJI_TOKENS).map(([tokenKey, tokenInfo]) => (
                                    <SelectItem key={tokenKey} value={tokenKey} className="text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#E84142] flex items-center justify-center text-xs font-bold">
                                                {tokenInfo.symbol.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{tokenInfo.symbol}</span>
                                                <span className="text-xs text-gray-400">{tokenInfo.name}</span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedToken && (
                            <div className="flex items-center gap-2 mt-2">
                                {isValidating ? (
                                    <Badge variant="secondary" className="bg-gray-700">
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        Checking...
                                    </Badge>
                                ) : tokenSupported ? (
                                    <Badge variant="default" className="bg-green-500">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Supported
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive">
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Not Supported
                                    </Badge>
                                )}

                                {tokenBalance && (
                                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                                        Balance: {parseFloat(tokenBalance.balance).toFixed(4)} {selectedToken}
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Destination Chain */}
                    <div className="space-y-2">
                        <Label htmlFor="chain" className="text-white">Destination Chain</Label>
                        <Select value={destinationChain} onValueChange={setDestinationChain}>
                            <SelectTrigger className="bg-[#2F2F3A] border-gray-700 text-white">
                                <SelectValue placeholder="Select destination blockchain" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#2F2F3A] border-gray-700">
                                {SUPPORTED_CHAINS.map((chain) => (
                                    <SelectItem key={chain.selector.toString()} value={chain.selector.toString()} className="text-white">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                style={{ backgroundColor: chain.iconColor }}
                                            >
                                                {chain.icon}
                                            </div>
                                            {chain.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {destinationChain && (
                            <Badge variant={chainSupported ? "default" : "destructive"} className={chainSupported ? "bg-green-500" : ""}>
                                {chainSupported ? (
                                    <>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Chain Supported
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-3 w-3 mr-1" />
                                        Chain Not Supported
                                    </>
                                )}
                            </Badge>
                        )}
                    </div>

                    {/* Receiver Address */}
                    <div className="space-y-2">
                        <Label htmlFor="receiver" className="text-white">Receiver Address</Label>
                        <Input
                            id="receiver"
                            type="text"
                            placeholder="0x... (destination wallet address)"
                            value={receiverAddress}
                            onChange={(e) => setReceiverAddress(e.target.value)}
                            className="bg-[#2F2F3A] border-gray-700 text-white placeholder-gray-400"
                        />
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount" className="text-white">Amount</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.000001"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-[#2F2F3A] border-gray-700 text-white placeholder-gray-400"
                        />
                        {tokenBalance && amount && parseFloat(amount) > parseFloat(tokenBalance.balance) && (
                            <p className="text-red-500 text-sm">Insufficient balance</p>
                        )}
                    </div>

                    {/* Fee Payment Method */}
                    <div className="space-y-3">
                        <Label className="text-white">Fee Payment Method</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant={payWithNative ? "default" : "outline"}
                                onClick={() => setPayWithNative(true)}
                                className={payWithNative ? "bg-[#9C2CFF] hover:bg-[#8A1FD9]" : "border-gray-600 text-gray-300 hover:bg-gray-800"}
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                Native Gas
                            </Button>
                            <Button
                                variant={!payWithNative ? "default" : "outline"}
                                onClick={() => setPayWithNative(false)}
                                className={!payWithNative ? "bg-[#9C2CFF] hover:bg-[#8A1FD9]" : "border-gray-600 text-gray-300 hover:bg-gray-800"}
                            >
                                <LinkIcon className="h-4 w-4 mr-2" />
                                LINK Token
                            </Button>
                        </div>
                    </div>

                    {/* Fee Estimate */}
                    {estimate && (
                        <Card className="bg-[#1C1C27] border-gray-700">
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Estimated Fee:</span>
                                    <div className="text-right">
                                        <div className="text-white font-medium">
                                            {payWithNative ?
                                                `${formatUnits(estimate.fee, 18)} ETH` :
                                                `${formatUnits(estimate.fee, 18)} LINK`
                                            }
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Gas Limit: {estimate.gasLimit.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {isEstimating && (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin mr-2 text-[#9C2CFF]" />
                            <span className="text-gray-300">Estimating fees...</span>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert className="border-red-500/50 bg-red-900/20">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription className="text-red-500">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Success Display */}
                    {result && (
                        <Alert className="border-green-500/50 bg-green-900/20">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription className="text-green-500">
                                <div className="space-y-2">
                                    <p>Transfer initiated successfully!</p>
                                    <div className="text-xs space-y-1">
                                        <p>Transaction: {result.transactionHash.slice(0, 10)}...{result.transactionHash.slice(-8)}</p>
                                        <p>Message ID: {result.messageId.slice(0, 10)}...{result.messageId.slice(-8)}</p>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <Separator className="bg-gray-700" />

                    <div className="flex gap-3">
                        <Button
                            onClick={handleTransfer}
                            disabled={!isFormValid || isLoading || isEstimating}
                            className="flex-1 bg-[#9C2CFF] hover:bg-[#8A1FD9]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="h-4 w-4 mr-2" />
                                    Transfer Tokens
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={resetForm}
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-[#2F2F3A]"
                        >
                            Reset
                        </Button>
                    </div>

                    {/* Info Section */}
                    <Card className="bg-[#1C1C27] border-[#9C2CFF]/20">
                        <CardContent className="pt-4">
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-[#9C2CFF] mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-gray-300 space-y-1">
                                    <p>• Cross-chain transfers are powered by Chainlink CCIP</p>
                                    <p>• Transfers typically take 5-20 minutes to complete</p>
                                    <p>• Fees vary based on destination chain and gas prices</p>
                                    <p>• Always verify the receiver address before sending</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    );
};
