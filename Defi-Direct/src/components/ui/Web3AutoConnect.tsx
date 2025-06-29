"use client";

// import { useEffect } from 'react';
import { useAutoConnect } from '@civic/auth-web3/wagmi';
// import { useUser } from '@civic/auth-web3/react';
// import { userHasWallet } from '@civic/auth-web3';
// import { useAccount } from 'wagmi';

interface Web3AutoConnectProps {
    children: React.ReactNode;
}

export function Web3AutoConnect({ children }: Web3AutoConnectProps) {
    // const { user } = useUser();
    // const { isConnected } = useAccount();

    // Auto-connect the embedded wallet when user is authenticated
    useAutoConnect();

    return <>{children}</>;
}
