"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useUser } from '@civic/auth-web3/react';
import { userHasWallet } from '@civic/auth-web3';
import { fetchTokenBalance } from "@/utils/fetchTokenBalance";
import { fetchTokenPrice } from "@/utils/fetchTokenprice";
import { Transaction } from "@/types/transaction";
import { setWalletAuthCookies, clearWalletAuthCookies } from "@/utils/walletAuth";

interface WalletContextType {
  connectedAddress: string | null;
  isConnecting: boolean;
  isAuthenticated: boolean;
  walletIcon: string | null;
  walletName: string | null;
  usdcBalance: string;
  usdtBalance: string;
  totalNgnBalance: number;
  usdcPrice: number;
  usdtPrice: number;
  fetchBalances: () => Promise<void>;
  disconnectWallet: () => void;
  refetchTransactions: () => void;
  transactionTrigger: number;
  pendingTransactions: Transaction[];
  addPendingTransaction: (tx: Transaction) => void;
  clearPendingTransaction: (txHash: `0x${string}`) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const userContext = useUser();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletIcon, setWalletIcon] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<string>("0");
  const [usdtBalance, setUsdtBalance] = useState<string>("0");
  const [totalNgnBalance, setTotalNgnBalance] = useState<number>(0);
  const [usdcPrice, setUsdcPrice] = useState<number>(0);
  const [usdtPrice, setUsdtPrice] = useState<number>(0);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<number>(0);
  const [transactionTrigger, setTransactionTrigger] = useState<number>(0);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);

  const fetchAndCacheTokenPrices = useCallback(async () => {
    const now = Date.now();
    const cacheDuration = 5 * 60 * 1000;

    if (now - lastPriceUpdate > cacheDuration) {
      try {
        const [usdcPrice, usdtPrice] = await Promise.all([
          fetchTokenPrice("usd-coin"),
          fetchTokenPrice("tether"),
        ]);

        setUsdcPrice(usdcPrice);
        setUsdtPrice(usdtPrice);
        setLastPriceUpdate(now);
      } catch (error) {
        console.error("Failed to fetch token prices:", error);
      }
    }
  }, [lastPriceUpdate]);

  const fetchBalances = useCallback(async () => {
    if (!address) return;

    try {
      const [usdcBalance, usdtBalance] = await Promise.all([
        fetchTokenBalance("USDC", address),
        fetchTokenBalance("USDT", address),
      ]);

      setUsdcBalance(usdcBalance);
      setUsdtBalance(usdtBalance);

      // Calculate total NGN balance
      const totalBalance = parseFloat(usdcBalance) * usdcPrice + parseFloat(usdtBalance) * usdtPrice;
      setTotalNgnBalance(totalBalance);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    }
  }, [address, usdcPrice, usdtPrice]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setIsAuthenticated(false);
    setWalletIcon(null);
    setWalletName(null);
    setUsdcBalance("0");
    setUsdtBalance("0");
    setTotalNgnBalance(0);
    setPendingTransactions([]);
    clearWalletAuthCookies();
  }, [disconnect]);

  const refetchTransactions = useCallback(() => {
    setTransactionTrigger(prev => prev + 1);
  }, []);

  const addPendingTransaction = useCallback((tx: Transaction) => {
    setPendingTransactions(prev => [...prev, tx]);
  }, []);

  const clearPendingTransaction = useCallback((txHash: `0x${string}`) => {
    setPendingTransactions(prev => prev.filter(tx => tx.txHash !== txHash));
  }, []);

  useEffect(() => {
    // Check for both Civic authentication and browser wallet connection
    const hasCivicAuth = userContext.user && userHasWallet(userContext);
    const hasBrowserWallet = isConnected && address;
    const authenticated = Boolean(hasCivicAuth || hasBrowserWallet);

    console.log('WalletContext - Authentication check:', {
      hasCivicAuth,
      hasBrowserWallet,
      authenticated,
      userContext: !!userContext.user,
      userContextUser: userContext.user,
      isConnected,
      address,
      userHasWallet: userContext.user ? userHasWallet(userContext) : false
    });

    setIsAuthenticated(authenticated);

    if (!authenticated) {
      setWalletIcon(null);
      setWalletName(null);
      setUsdcBalance("0");
      setUsdtBalance("0");
      setTotalNgnBalance(0);
      setUsdcPrice(0);
      setUsdtPrice(0);
      setPendingTransactions([]);
      clearWalletAuthCookies();
      return;
    }

    // Set wallet authentication cookies when connected
    if (address && connector) {
      setWalletAuthCookies(address, connector.id);
    }

    fetchBalances();
    fetchAndCacheTokenPrices();
    const priceIntervalId = setInterval(fetchAndCacheTokenPrices, 5 * 60 * 1000);

    return () => {
      clearInterval(priceIntervalId);
    };
  }, [isConnected, connector, address, userContext, fetchBalances, fetchAndCacheTokenPrices]);

  return (
    <WalletContext.Provider
      value={{
        connectedAddress: address || null,
        isConnecting: false,
        isAuthenticated,
        walletIcon,
        walletName,
        usdcBalance,
        usdtBalance,
        totalNgnBalance,
        usdcPrice,
        usdtPrice,
        fetchBalances,
        disconnectWallet,
        refetchTransactions,
        transactionTrigger,
        pendingTransactions,
        addPendingTransaction,
        clearPendingTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};