// src/utils/fetchTokenBalance.ts
import { readContract } from "@wagmi/core";
import { getFiatTokenAddresses } from "@/config";
import { config } from "@/lib/wagmiConfig";

const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
];

export const fetchTokenBalance = async (token: "USDC" | "USDT", address: string, chainId: number = 11155111) => {
  try {
    const fiatTokenAddresses = getFiatTokenAddresses(chainId);
    const balance = (await readContract(config, {
      address: fiatTokenAddresses[token],
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address as `0x${string}`],
    })) as bigint;

    return balance.toString();
  } catch (error) {
    console.error(`Error fetching ${token} balance:`, error);
    return "0";
  }
};