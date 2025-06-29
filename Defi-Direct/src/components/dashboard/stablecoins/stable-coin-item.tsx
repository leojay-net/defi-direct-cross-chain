// src/components/dashboard/stable-coin-item.tsx
import { Avatar } from "antd";
import type { StableCoin } from "./stable-coin-list"; // Import the type

interface StableCoinItemProps {
  coin: StableCoin;
  opacity: number;
  isLast: boolean;
}

export function StableCoinItem({ coin, opacity, isLast }: StableCoinItemProps) {
  const { name, symbol, balance, ngnBalance, icon } = coin;

  return (
    <div className="relative flex items-center justify-between py-3 sm:py-4" style={{ opacity }}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative h-8 w-8 sm:h-10 sm:w-10 overflow-hidden rounded-full flex-shrink-0">
          <Avatar src={icon} size="large" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-white text-sm sm:text-base truncate">{name}</p>
          <p className="text-xs sm:text-sm text-gray-400">{symbol}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium text-white text-sm sm:text-base">${balance}</p> {/* Display formatted balance */}
        <p className="text-xs sm:text-sm text-gray-400">{ngnBalance}</p>
      </div>
      {!isLast && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent" />
      )}
    </div>
  );
}