// Utility functions for wallet authentication cookies

export const setWalletAuthCookies = (address: string, connectorId: string) => {
    if (typeof document === 'undefined') return;

    // Set wallet authentication cookies
    document.cookie = `wallet-auth-token=${connectorId}; path=/; max-age=86400; SameSite=Lax`; // 24 hours
    document.cookie = `wallet-address=${address}; path=/; max-age=86400; SameSite=Lax`; // 24 hours
};

export const clearWalletAuthCookies = () => {
    if (typeof document === 'undefined') return;

    // Clear wallet authentication cookies
    document.cookie = 'wallet-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'wallet-address=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const getWalletAuthCookies = () => {
    if (typeof document === 'undefined') return { token: null, address: null };

    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return {
        token: cookies['wallet-auth-token'] || null,
        address: cookies['wallet-address'] || null,
    };
}; 