"use client";

import React, { useState } from 'react';
import { useAccount, useSwitchChain, useChainId } from 'wagmi';
import { useUser } from '@civic/auth-web3/react';
import { userHasWallet } from '@civic/auth-web3';
import { ChevronDown, Copy, LogOut, Network, Check } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { avalancheFuji } from '@/lib/chains';
import { addAvalancheFujiToWallet } from '@/utils/walletDetection';

const supportedChains = [avalancheFuji];

// Chain icon mapping with placeholder images
const chainIcons: Record<number, string> = {
    [avalancheFuji.id]: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
};

export function WalletInfoDropdown() {
    const { address } = useAccount();
    const { switchChain } = useSwitchChain();
    const chainId = useChainId();
    const userContext = useUser();
    const { walletIcon, walletName, disconnectWallet } = useWallet();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    console.log('WalletInfoDropdown - Debug:', {
        address,
        userContext: !!userContext.user,
        hasWallet: userContext.user ? userHasWallet(userContext) : false,
        walletIcon,
        walletName
    });

    const truncateAddress = (addr: string) => {
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleSwitchToAvalancheFuji = async () => {
        try {
            await switchChain({ chainId: avalancheFuji.id });
        } catch {
            console.log('Chain switch failed, adding network...');
            await addAvalancheFujiToWallet();
        }
    };

    const currentChain = supportedChains.find(chain => chain.id === chainId);

    // Show dropdown if user has either Civic auth or browser wallet
    const hasCivicAuth = userContext.user && userHasWallet(userContext);
    const hasBrowserWallet = address;
    const shouldShow = hasCivicAuth || hasBrowserWallet;

    if (!shouldShow) {
        return null;
    }

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 bg-[#7b40e3] hover:bg-[#6830d1] text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
                <div className="flex items-center space-x-2">
                    {walletIcon && (
                        <img
                            src={walletIcon}
                            alt={walletName || 'Wallet'}
                            className="w-5 h-5 rounded-full"
                        />
                    )}
                    <span className="text-sm font-medium">{address ? truncateAddress(address) : 'No Address'}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
                <div className="absolute top-full mt-2 right-0 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {/* Wallet Info */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                            {walletIcon && (
                                <img
                                    src={walletIcon}
                                    alt={walletName || 'Wallet'}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                            <div>
                                <p className="font-medium text-gray-900">{walletName || 'Wallet'}</p>
                                <p className="text-sm text-gray-500">{address ? truncateAddress(address) : 'No Address'}</p>
                            </div>
                        </div>

                        {/* Copy Address Button */}
                        <button
                            onClick={() => address && copyToClipboard(address)}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            {copySuccess ? (
                                <>
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span className="text-green-600 text-sm">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-700 text-sm">Copy Address</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Network Info */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    {chainIcons[chainId] && (
                                        <img
                                            src={chainIcons[chainId]}
                                            alt={currentChain?.name || 'Chain'}
                                            className="w-4 h-4 rounded-full"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <Network className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">
                                        {currentChain?.name || 'Unknown Network'}
                                    </span>
                                </div>
                                {chainId === avalancheFuji.id && (
                                    <Check className="h-4 w-4 text-green-500" />
                                )}
                            </div>

                            {/* Switch to Avalanche Fuji button if not on correct chain */}
                            {chainId !== avalancheFuji.id && (
                                <button
                                    onClick={handleSwitchToAvalancheFuji}
                                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                                >
                                    <Network className="h-4 w-4" />
                                    <span>Switch to Avalanche Fuji</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Disconnect Button */}
                    <div className="p-2">
                        <button
                            onClick={disconnectWallet}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm">Disconnect</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop to close dropdown */}
            {dropdownOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                />
            )}
        </div>
    );
}
