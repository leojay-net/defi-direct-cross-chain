export const formatBalance = (balance: string, decimals: number = 6) => {
    const wei = BigInt(balance); // Convert string to BigInt
    const divisor = 10 ** decimals; // 10^6 for USDC/USDT
    const ether = Number(wei) / divisor; // Convert to floating-point number
    return ether.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };