// Utility functions for blockchain explorer URLs
import { Chain } from 'wagmi/chains';

/**
 * Get the explorer URL for a transaction on a specific chain
 * @param chainId - The chain ID
 * @param txHash - The transaction hash
 * @param chain - Optional chain object from wagmi
 * @returns The full URL to view the transaction on the blockchain explorer
 */
export function getTransactionExplorerUrl(
    chainId: number,
    txHash: string,
    chain?: Chain
): string {
    // If we have the chain object and it has block explorers, use that
    if (chain?.blockExplorers?.default?.url) {
        return `${chain.blockExplorers.default.url}/tx/${txHash}`;
    }

    // Fallback mapping for common chains
    const explorerUrls: Record<number, string> = {
        // Ethereum Mainnet
        1: 'https://etherscan.io',
        // Ethereum Sepolia Testnet
        11155111: 'https://sepolia.etherscan.io',
        // Polygon Mainnet
        137: 'https://polygonscan.com',
        // Base Mainnet
        8453: 'https://basescan.org',
        // Base Sepolia
        84532: 'https://sepolia.basescan.org',
        // Arbitrum One
        42161: 'https://arbiscan.io',
        // Cronos Mainnet
        25: 'https://explorer.cronos.org',
        // Cronos Testnet
        338: 'https://explorer.cronos.org/testnet',
        // Scroll Mainnet
        534352: 'https://scrollscan.com',
        // Scroll Sepolia
        534351: 'https://sepolia.scrollscan.com',
        // BSC Mainnet
        56: 'https://bscscan.com',
        // Avalanche C-Chain
        43114: 'https://snowtrace.io',
        // Lisk Mainnet
        1135: 'https://blockscout.lisk.com',
        // Lisk Sepolia
        4202: 'https://sepolia-blockscout.lisk.com',
        // EduChain
        41923: 'https://educhain-explorer.opencampus.xyz',
        // EduChain Testnet
        656476: 'https://educhain-testnet-explorer.opencampus.xyz',
    };

    const baseUrl = explorerUrls[chainId];
    if (!baseUrl) {
        // Fallback to Scroll Sepolia if chain is not supported
        console.warn(`Explorer URL not found for chain ID ${chainId}, falling back to Scroll Sepolia`);
        return `https://sepolia.scrollscan.com/tx/${txHash}`;
    }

    return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get the explorer name for a specific chain
 * @param chainId - The chain ID
 * @param chain - Optional chain object from wagmi
 * @returns The name of the blockchain explorer
 */
export function getExplorerName(chainId: number, chain?: Chain): string {
    // If we have the chain object and it has block explorers, try to get the name
    if (chain?.blockExplorers?.default?.name) {
        return chain.blockExplorers.default.name;
    }

    // Fallback mapping for common chains
    const explorerNames: Record<number, string> = {
        1: 'Etherscan',
        11155111: 'Etherscan',
        137: 'Polygonscan',
        8453: 'Basescan',
        84532: 'Basescan',
        42161: 'Arbiscan',
        25: 'Cronos Explorer',
        338: 'Cronos Explorer',
        534352: 'Scrollscan',
        534351: 'Scrollscan',
        56: 'BscScan',
        43114: 'Snowtrace',
        1135: 'Lisk Explorer',
        4202: 'Lisk Explorer',
        41923: 'EduChain Explorer',
        656476: 'EduChain Explorer',
    };

    return explorerNames[chainId] || 'Block Explorer';
}
