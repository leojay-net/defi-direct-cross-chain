// src/components/settings/SettingsContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';

function SettingsContent() {
  const { connectedAddress, disconnectWallet, walletIcon, walletName } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(!!connectedAddress);

  const truncateAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setError(null);
    setIsConnected(false);
  };

  useEffect(() => {
    if (connectedAddress) {
      setIsConnected(true);
    }
  }, [connectedAddress]);

  return (
    <div className="text-white px-4 w-fit">
      
          {/* Display wallet logo, address, and name only when connected */}
          {isConnected && connectedAddress && walletIcon && (
            <div className="bg-gradient-to-b from-[#151021] via-[#151021] to-[#160429] rounded-t-2xl py-6 px-10">
        <div className="flex flex-col items-center">
            <>
              <div className="w-32 h-32 bg-white rounded-full mb-6 flex items-center justify-center">
                <img 
                  src={walletIcon }  
                  alt={walletName || 'Wallet'} 
                  className="w-[7.8rem] h-30 rounded-full" 
                />
              </div>
              <h2 className="text-2xl font-medium mb-4">
                {truncateAddress(connectedAddress)}
              </h2>
              <p className="text-lg text-gray-400 mb-4">{walletName}</p>

              {/* Display "Disconnect Wallet" button only when a wallet is connected */}
              <button
                onClick={handleDisconnect}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-12 rounded-2xl w-full max-w-sm flex items-center justify-center gap-2"
              >
                Disconnect Wallet
              </button>
            </>
            </div>
      </div>
          )}

          
      {/* Display nothing when no wallet is connected */}
      {!isConnected && (
        <p className="text-gray-400 text-center text-lg font-medium  px-10 py-6">
          No wallet connected.
        </p>
      )}

      {/* Display error message if any */}
      {error && (
        <div className="mt-4 text-red-500 text-sm bg-red-100 p-3 rounded-lg text-center">
          {error}
        </div>
      )}
        
    </div>
  );
}

export default SettingsContent;
