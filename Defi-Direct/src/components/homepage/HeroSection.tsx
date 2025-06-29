'use client';
import Image from 'next/image';
import React from 'react';
import Logo from '../Logo';
import { useWallet } from '@/context/WalletContext'; // Use isAuthenticated from useWallet
import { ConnectButton } from '@/components/ui/ConnectButton';
import { WalletInfoDropdown } from '@/components/ui/WalletInfoDropdown';
import { AutoConnectWrapper } from '@/components/ui/AutoConnect';
import { FadeIn, SlideIn } from '@/components/ui/Transitions';
import Link from 'next/link';

function HeroSection() {
  const { isAuthenticated } = useWallet(); // Use isAuthenticated from useWallet
  console.log('HeroSection - isAuthenticated:', isAuthenticated);
  console.log(process.env.NEXT_PUBLIC_JSON_RPC_SERVER_URL)

  // Remove automatic redirect - let users manually navigate

  return (
    <AutoConnectWrapper>
      <div>
        <div className='flex justify-between w-full max-w-6xl mx-auto items-center px-4 sm:px-6'>
          <div> <Logo /></div>
          <div className="z-10 flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <button className='py-2 sm:py-3 px-3 sm:px-6 bg-[#7b40e3] rounded-lg font-bold text-xs sm:text-sm hover:bg-purple-700 transition-colors h-[36px] sm:h-[44px]'>
                    Dashboard
                  </button>
                </Link>
                <WalletInfoDropdown />
              </>
            ) : (
              <ConnectButton />
            )}
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className='flex flex-col items-center text-center'>
            {/* Floating crypto icons - hidden on mobile, shown on larger screens */}
            <div className="absolute inset-0 z-0 hidden lg:block">
              <SlideIn direction="down" delay={0.2}>
                <div className="absolute top-[107px] left-[210px] animate-pulse">
                  <Image
                    src="/Bitcoin_3D.png"
                    alt="Bitcoin"
                    width={113}
                    height={114}
                    className="hover:scale-150 transition-transform duration-300 w-12 h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20"
                  />
                </div>
              </SlideIn>

              <SlideIn direction="up" delay={0.4}>
                <div className="absolute top-[529px] left-[308px] animate-pulse delay-300">
                  <Image
                    src="/USD_Coin_3D.png"
                    alt="usd"
                    width={80}
                    height={80}
                    className="hover:scale-150 transition-transform duration-300 w-12 h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20"
                  />
                </div>
              </SlideIn>

              <SlideIn direction="left" delay={0.6}>
                <div className="absolute top-[294px] right-[-5px] animate-pulse delay-700">
                  <Image
                    src="/Shiba_Inu_3D.png"
                    alt="Shiba Inu"
                    width={130}
                    height={130}
                    className="hover:scale-150 transition-transform duration-300 w-20 h-20 lg:w-24 lg:h-24 xl:w-32 xl:h-32"
                  />
                </div>
              </SlideIn>

              <SlideIn direction="right" delay={0.3}>
                <div className="absolute top-[250px] animate-pulse delay-500">
                  <Image
                    src="/Polygon_3D.png"
                    alt="Polygon"
                    width={120}
                    height={120}
                    className="hover:scale-150 transition-transform duration-300 w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24"
                  />
                </div>
              </SlideIn>

              <SlideIn direction="up" delay={0.5}>
                <div className="absolute bottom-72 right-36 animate-pulse delay-200">
                  <Image
                    src="/Solana_3D.png"
                    alt="Solana"
                    width={60}
                    height={60}
                    className="hover:scale-150 transition-transform duration-300 w-12 h-12 lg:w-14 lg:h-14"
                  />
                </div>
              </SlideIn>

              <SlideIn direction="down" delay={0.7}>
                <div className="absolute bottom-[25rem] left-72 animate-pulse delay-400">
                  <Image
                    src="/Ethereum_3D.png"
                    alt="Ethereum"
                    width={55}
                    height={55}
                    className="hover:scale-150 transition-transform duration-300 w-12 h-12 lg:w-16 lg:h-16"
                  />
                </div>
              </SlideIn>
            </div>

            <FadeIn delay={0.1}>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold mt-6 sm:mt-8 md:mt-12 lg:mt-16 xl:mt-20 mb-3 sm:mb-4 leading-tight px-2">
                Take Control of Your Finances With Seamless Crypto Spending
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="mt-3 sm:mt-4 md:mt-6 lg:mt-8 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mx-2 sm:mx-4 md:mx-8 lg:mx-16 xl:mx-32 2xl:mx-44 text-gray-300 leading-relaxed">
                Spend directly from your DeFi wallet anywhere, anytime, no intermediaries, no delays. Secure, fast, and built for the future.
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <Link href="#WaitList">
                <button className='py-3 sm:py-3 md:py-4 px-6 sm:px-6 md:px-8 bg-[#7b40e3] rounded-lg mt-6 sm:mt-8 animate-bounce font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl hover:bg-purple-700 transition-colors'>
                  Join Waitlist
                </button>
              </Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </AutoConnectWrapper>
  );
}

export default HeroSection;