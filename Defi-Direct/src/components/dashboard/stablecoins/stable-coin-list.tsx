// src/components/dashboard/stable-coin-list.tsx
"use client";

import { useWallet } from "@/context/WalletContext";
import { StableCoinItem } from "./stable-coin-item";
import { formatBalance } from "@/utils/formatBalance";
import { useEffect, useState, useRef, useCallback } from "react";

// Export the StableCoin type
export type StableCoin = {
  id: string;
  name: string;
  symbol: string;
  balance: string; // Balance is now a string (formatted)
  ngnBalance: string; // NGN balance
  icon: string;
};



export default function StableCoinList() {
  const { usdcBalance, usdtBalance, usdcPrice, usdtPrice } = useWallet();

  const [stableCoins, setStableCoins] = useState<StableCoin[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStableCoins = useCallback(async () => {

    const usdcBalanceFormatted = formatBalance(usdcBalance);
    const usdtBalanceFormatted = formatBalance(usdtBalance);

    const usdcNgnBalance = ((parseFloat(usdcBalance) * usdcPrice) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const usdtNgnBalance = ((parseFloat(usdtBalance) * usdtPrice) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    setStableCoins([
      {
        id: "1",
        symbol: "USDC",
        name: "USDC $1",
        balance: usdcBalanceFormatted,
        ngnBalance: `₦${usdcNgnBalance}`, // Add NGN balance
        icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
      },
      {
        id: "2",
        symbol: "USDT",
        name: "USDT $1",
        balance: usdtBalanceFormatted,
        ngnBalance: `₦${usdtNgnBalance}`, // Add NGN balance
        icon: "https://cryptologos.cc/logos/tether-usdt-logo.png",
      },
    ]);
  }, [usdcBalance, usdtBalance, usdcPrice, usdtPrice]);


  useEffect(() => {

    fetchStableCoins();

    // Set up an interval to fetch stable coins every 5 seconds
    intervalRef.current = setInterval(fetchStableCoins, 5000);

    // Clean up the interval when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStableCoins]); // Now we can safely include fetchStableCoins

  return (
    <div className="w-full h-full rounded-2xl sm:rounded-3xl p-4 sm:p-6">
      <h2 className="text-lg sm:text-2xl font-semibold text-white">Your Stable coins</h2>
      <div className="mt-4 sm:mt-6">
        {stableCoins.map((coin, index) => (
          <StableCoinItem
            key={coin.id}
            coin={coin}
            opacity={1 - index * 0.2}
            isLast={index === stableCoins.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
