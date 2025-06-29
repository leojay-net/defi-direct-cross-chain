// src/utils/fetchTokenPrice.ts
export const fetchTokenPrice = async (tokenId: string) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=ngn`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${tokenId} price: ${response.statusText}`);
    }

    const data = await response.json();
    return data[tokenId].ngn; // Return the price in NGN
  } catch (error) {
    // console.error(`Error fetching ${tokenId} price:`, error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

