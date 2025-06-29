import { ApolloClient, InMemoryCache, gql, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { ApolloError } from '@apollo/client';

// Subgraph endpoint
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/107317/defi-direct-graph/version/latest";

// Create HTTP link
const httpLink = createHttpLink({
  uri: SUBGRAPH_URL,
});

// Create auth link to add API key to headers
const authLink = setContext((_, { headers }) => {
  const apiKey = process.env.NEXT_PUBLIC_SUBGRAPH_API_KEY;

  return {
    headers: {
      ...headers,
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    }
  }
});

// Create Apollo Client with auth link
export const subgraphClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// GraphQL Queries

export const GET_USER_TRANSACTIONS = gql`
  query GetUserTransactions($user: String!, $first: Int = 20, $skip: Int = 0, $orderBy: String = "timestamp", $orderDirection: String = "desc") {
    transactions(
      where: { user_: { address: $user } }
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      txId
      user {
        id
        address
      }
      token {
        id
        address
        symbol
        decimals
      }
      amount
      amountSpent
      fee
      status
      timestamp
      blockNumber
      crossChain
      crossChainTransfer {
        id
        messageId
        destinationChain
        status
      }
    }
  }
`;

export const GET_USER_CROSS_CHAIN_TRANSFERS = gql`
  query GetUserCrossChainTransfers($user: String!, $first: Int = 20, $skip: Int = 0) {
    crossChainTransfers(
      where: { user_: { address: $user } }
      first: $first
      skip: $skip
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      messageId
      user {
        id
        address
      }
      token {
        id
        address
        symbol
        decimals
      }
      amount
      destinationChain
      status
      timestamp
      blockNumber
      transaction {
        id
        txId
        amount
        status
        timestamp
      }
    }
  }
`;

export const GET_ALL_TRANSACTIONS = gql`
  query GetAllTransactions($first: Int = 100, $skip: Int = 0) {
    transactions(
      first: $first
      skip: $skip
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      txId
      user {
        id
        address
      }
      token {
        id
        address
        symbol
        decimals
      }
      amount
      amountSpent
      fee
      status
      timestamp
      blockNumber
      crossChain
      crossChainTransfer {
        id
        messageId
        destinationChain
        status
      }
    }
  }
`;

export const GET_ALL_CROSS_CHAIN_TRANSFERS = gql`
  query GetAllCrossChainTransfers($first: Int = 100, $skip: Int = 0) {
    crossChainTransfers(
      first: $first
      skip: $skip
      orderBy: "timestamp"
      orderDirection: "desc"
    ) {
      id
      messageId
      user {
        id
        address
      }
      token {
        id
        address
        symbol
        decimals
      }
      amount
      destinationChain
      status
      timestamp
      blockNumber
      transaction {
        id
        txId
        amount
        status
        timestamp
      }
    }
  }
`;

export const GET_PROTOCOL_STATS = gql`
  query GetProtocolStats {
    protocolStats(first: 1) {
      id
      totalTransactions
      totalCrossChainTransfers
      totalVolumeUSD
      uniqueUsers
      totalGasUsed
      lastUpdated
    }
  }
`;

export const GET_CHAIN_STATS = gql`
  query GetChainStats($chainId: String) {
    chainStats(where: { chainId: $chainId }) {
      id
      chainId
      totalTransactions
      totalCrossChainTransfers
      totalVolumeUSD
      uniqueUsers
      lastUpdated
    }
  }
`;

export const GET_DAILY_STATS = gql`
  query GetDailyStats($date: String) {
    dailyStats(where: { date: $date }) {
      id
      date
      totalTransactions
      totalCrossChainTransfers
      totalVolumeUSD
      uniqueUsers
      gasUsed
    }
  }
`;

export const GET_CROSS_CHAIN_ROUTES = gql`
  query GetCrossChainRoutes {
    crossChainRoutes(first: 100) {
      id
      sourceChain
      destinationChain
      totalTransfers
      totalVolume
      lastUsed
    }
  }
`;

export const GET_TOKENS = gql`
  query GetTokens($first: Int = 50) {
    tokens(first: $first) {
      id
      address
      symbol
      decimals
      totalTransactions
      totalVolume
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($first: Int = 100, $skip: Int = 0) {
    users(
      first: $first
      skip: $skip
      orderBy: "totalTransactions"
      orderDirection: "desc"
    ) {
      id
      address
      totalTransactions
      totalCrossChainTransfers
      totalVolumeUSD
      firstTransactionTimestamp
      lastTransactionTimestamp
    }
  }
`;

// Helper function to handle GraphQL errors
export const handleGraphQLError = (error: ApolloError | unknown): string => {
  if (error && typeof error === 'object' && 'networkError' in error) {
    const apolloError = error as ApolloError;
    if (apolloError.networkError) {
      return `Network error: ${apolloError.networkError.message}`;
    }
    if (apolloError.graphQLErrors && apolloError.graphQLErrors.length > 0) {
      return `GraphQL error: ${apolloError.graphQLErrors[0].message}`;
    }
    return `Unknown error: ${apolloError.message || 'An unexpected error occurred'}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Service class for easier usage
export class SubgraphService {
  static async getUserTransactions(userAddress: string, options?: {
    first?: number;
    skip?: number;
    orderBy?: string;
    orderDirection?: string;
  }) {
    try {
      const { data } = await subgraphClient.query({
        query: GET_USER_TRANSACTIONS,
        variables: {
          user: userAddress.toLowerCase(),
          first: options?.first || 20,
          skip: options?.skip || 0,
          orderBy: options?.orderBy || "timestamp",
          orderDirection: options?.orderDirection || "desc"
        },
        fetchPolicy: 'cache-first',
      });

      // Add fallback for undefined data
      if (!data || !data.transactions) {
        console.warn('Subgraph returned undefined data for user transactions');
        return [];
      }

      return data.transactions;
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw new Error(handleGraphQLError(error));
    }
  }

  static async getUserCrossChainTransfers(userAddress: string, options?: {
    first?: number;
    skip?: number;
  }) {
    try {
      const { data } = await subgraphClient.query({
        query: GET_USER_CROSS_CHAIN_TRANSFERS,
        variables: {
          user: userAddress.toLowerCase(),
          first: options?.first || 20,
          skip: options?.skip || 0
        },
        fetchPolicy: 'cache-first',
      });

      // Add fallback for undefined data
      if (!data || !data.crossChainTransfers) {
        console.warn('Subgraph returned undefined data for user crossChainTransfers');
        return [];
      }

      return data.crossChainTransfers;
    } catch (error) {
      console.error('Error fetching user cross-chain transfers:', error);
      throw new Error(handleGraphQLError(error));
    }
  }

  static async getAllTransactions(options?: { first?: number; skip?: number }) {
    try {
      const { data } = await subgraphClient.query({
        query: GET_ALL_TRANSACTIONS,
        variables: {
          first: options?.first || 100,
          skip: options?.skip || 0
        },
        fetchPolicy: 'cache-first',
      });

      // Add fallback for undefined data
      if (!data || !data.transactions) {
        console.warn('Subgraph returned undefined data for transactions');
        return [];
      }

      return data.transactions;
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw new Error(handleGraphQLError(error));
    }
  }

  static async getAllCrossChainTransfers(options?: { first?: number; skip?: number }) {
    try {
      const { data } = await subgraphClient.query({
        query: GET_ALL_CROSS_CHAIN_TRANSFERS,
        variables: {
          first: options?.first || 100,
          skip: options?.skip || 0
        },
        fetchPolicy: 'cache-first',
      });

      // Add fallback for undefined data
      if (!data || !data.crossChainTransfers) {
        console.warn('Subgraph returned undefined data for crossChainTransfers');
        return [];
      }

      return data.crossChainTransfers;
    } catch (error) {
      console.error('Error fetching all cross-chain transfers:', error);
      throw new Error(handleGraphQLError(error));
    }
  }

  static async getProtocolStats() {
    try {
      const { data } = await subgraphClient.query({
        query: GET_PROTOCOL_STATS,
        fetchPolicy: 'cache-first',
      });
      return data.protocolStats[0] || null;
    } catch (error) {
      console.error('Error fetching protocol stats:', error);
      throw new Error(handleGraphQLError(error));
    }
  }

  static async getChainStats(chainId: string) {
    try {
      const { data } = await subgraphClient.query({
        query: GET_CHAIN_STATS,
        variables: { chainId },
        fetchPolicy: 'cache-first',
      });
      return data.chainStats;
    } catch (error) {
      console.error('Error fetching chain stats:', error);
      throw new Error(handleGraphQLError(error));
    }
  }

  static async getDailyStats(date: string) {
    try {
      const { data } = await subgraphClient.query({
        query: GET_DAILY_STATS,
        variables: { date },
        fetchPolicy: 'cache-first',
      });
      return data.dailyStats[0] || null;
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      throw new Error(handleGraphQLError(error));
    }
  }

  static async getCrossChainRoutes() {
    try {
      const { data } = await subgraphClient.query({
        query: GET_CROSS_CHAIN_ROUTES,
        fetchPolicy: 'cache-first',
      });
      return data.crossChainRoutes;
    } catch (error) {
      console.error('Error fetching cross-chain routes:', error);
      throw new Error(handleGraphQLError(error));
    }
  }

  static async getTokens(first?: number) {
    try {
      const { data } = await subgraphClient.query({
        query: GET_TOKENS,
        variables: { first: first || 50 },
        fetchPolicy: 'cache-first',
      });
      return data.tokens;
    } catch (error) {
      console.error('Error fetching tokens:', error);
      throw new Error(handleGraphQLError(error));
    }
  }

  static async getUsers(options?: { first?: number; skip?: number }) {
    try {
      const { data } = await subgraphClient.query({
        query: GET_USERS,
        variables: {
          first: options?.first || 100,
          skip: options?.skip || 0
        },
        fetchPolicy: 'cache-first',
      });
      return data.users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error(handleGraphQLError(error));
    }
  }
}

export default SubgraphService;
