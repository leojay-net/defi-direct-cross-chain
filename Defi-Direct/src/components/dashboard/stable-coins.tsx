import { Avatar } from "antd"

interface StableCoin {
  symbol: string
  name: string
  balance: string
  price: string
  icon: string
}

interface StableCoinsProps {
  coins: StableCoin[]
}

export default function StableCoins({ coins }: StableCoinsProps) {
  return (
    <div className="rounded-2xl bg-[#1A1727] p-6">
      <h2 className="mb-4 text-lg text-white">Your Stable coins</h2>
      <div className="space-y-4">
        {coins.map((coin) => (
          <div key={coin.symbol} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar src={coin.icon} size="large" />
              <div>
                <p className="font-medium text-white">{coin.symbol}</p>
                <p className="text-sm text-gray-400">{coin.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-white">${coin.balance}</p>
              <p className="text-sm text-gray-400">{coin.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

