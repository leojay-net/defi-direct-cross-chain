// components/Providers.tsx
'use client'; // Mark this as a client component

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { CivicAuthProvider } from '@civic/auth-web3/nextjs';
import { config } from '@/lib/wagmiConfig';
import { avalancheFuji } from '@/lib/chains';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <CivicAuthProvider
          chains={[avalancheFuji]}
          initialChain={avalancheFuji}
        >
          {children}
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}