// app/layout.tsx
import './globals.css';
import '../styles/civic-auth.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import StyledComponentsRegistry from '@/lib/AntdRegistry';
import { Providers } from '@/components/Providers';
import { WalletProvider } from '@/context/WalletContext';
import { Web3AutoConnect } from '@/components/ui/Web3AutoConnect';
import { GlobalHeader } from '@/components/ui/GlobalHeader';

// Force dynamic rendering for all pages
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const roboto = Inter({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
});

export const metadata: Metadata = {
  title: 'Defi-Direct',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={roboto?.className || ''}>
        <StyledComponentsRegistry>
          <Providers>
            <WalletProvider>
              <Web3AutoConnect>
                <GlobalHeader />
                {children}
              </Web3AutoConnect>
            </WalletProvider>
          </Providers>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
