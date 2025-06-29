"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useUser } from '@civic/auth-web3/react';
import { userHasWallet } from '@civic/auth-web3';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const { isConnected, address } = useAccount();
    const userContext = useUser();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    console.log('AuthGuard - Initial state:', {
        isConnected,
        address,
        userContext: !!userContext.user,
        userContextUser: userContext.user,
        isLoading: userContext.isLoading,
        isAuthenticated,
        isLoadingState: isLoading
    });

    useEffect(() => {
        const checkAuthentication = () => {
            // Check if user is authenticated via Civic
            const hasCivicAuth = userContext.user && userHasWallet(userContext);

            // Check if user is authenticated via browser wallet
            const hasBrowserWallet = isConnected && address;

            // User is authenticated if they have either Civic auth or browser wallet
            const authenticated = Boolean(hasCivicAuth || hasBrowserWallet);

            console.log('AuthGuard - Checking authentication:', {
                hasCivicAuth,
                hasBrowserWallet,
                authenticated,
                userContext: !!userContext.user,
                userContextUser: userContext.user,
                isConnected,
                address,
                userHasWallet: userContext.user ? userHasWallet(userContext) : false
            });

            setIsAuthenticated(authenticated);
            setIsLoading(false);

            if (!authenticated) {
                // Redirect to homepage if not authenticated
                console.log('AuthGuard - Not authenticated, redirecting to homepage');
                router.push('/');
            } else {
                console.log('AuthGuard - Authenticated, allowing access');
            }
        };

        // Add a longer delay to allow auth state to settle, especially for Civic
        const timer = setTimeout(checkAuthentication, 500);

        return () => clearTimeout(timer);
    }, [userContext, isConnected, address, router]);

    // Re-check authentication when auth state changes
    useEffect(() => {
        if (!isLoading) {
            const hasCivicAuth = userContext.user && userHasWallet(userContext);
            const hasBrowserWallet = isConnected && address;
            const authenticated = Boolean(hasCivicAuth || hasBrowserWallet);

            setIsAuthenticated(authenticated);

            if (!authenticated) {
                router.push('/');
            }
        }
    }, [userContext, isConnected, address, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0A0014]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-white">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0A0014]">
                <div className="text-center">
                    <p className="text-white">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
} 