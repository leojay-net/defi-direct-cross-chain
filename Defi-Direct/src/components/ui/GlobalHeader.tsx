'use client';

import React from 'react';
import { useWallet } from '@/context/WalletContext';
import { WalletInfoDropdown } from '@/components/ui/WalletInfoDropdown';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import Link from 'next/link';

export function GlobalHeader() {
    const { isAuthenticated } = useWallet();
    const pathname = usePathname();

    // Don't show header on the home page or dashboard routes since they have their own headers
    if (pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/transaction') || pathname.startsWith('/settings') || pathname.startsWith('/crosschain')) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 bg-[#0F0F14]/95 backdrop-blur border-b border-gray-800">
            <div className="flex justify-between items-center w-full max-w-6xl mx-auto px-6 py-4">
                <Link href="/">
                    <Logo />
                </Link>

                {isAuthenticated && (
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <button className='py-3 px-6 bg-[#7b40e3] rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors'>
                                Dashboard
                            </button>
                        </Link>
                        <WalletInfoDropdown />
                    </div>
                )}
            </div>
        </header>
    );
}
