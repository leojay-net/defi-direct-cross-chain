// components/Providers.tsx
'use client'; // Mark this as a client component

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { CivicAuthProvider } from '@civic/auth-web3/nextjs';
import { ApolloProvider } from '@apollo/client';
import { config } from '@/lib/wagmiConfig';
import { subgraphClient } from '@/services/subgraphService';
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
          <ApolloProvider client={subgraphClient}>
            {children}
          </ApolloProvider>
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}