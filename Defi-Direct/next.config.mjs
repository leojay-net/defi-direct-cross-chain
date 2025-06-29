// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images:{
//         domain:['res.cloudinary.com']
//     }
// };

// export default nextConfig;
// next.config.mjs
import { createCivicAuthPlugin } from "@civic/auth-web3/nextjs";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.CLIENT_ID || '',
  oauthServer: process.env.AUTH_SERVER || 'https://auth.civic.com/oauth',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  // Disable SWC minification to avoid web worker issues
  swcMinify: false,
  // Disable experimental features that might cause issues
  experimental: {
    esmExternals: false,
  },
  // Enhanced webpack configuration for Ant Design and browser-only modules
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    // Fix for Ant Design module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    // Transpile Ant Design packages
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Handle browser-only modules
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'pino-pretty': 'commonjs pino-pretty',
        'indexeddb': 'commonjs indexeddb',
      });
    }

    return config;
  },
  // Transpile Ant Design packages
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/cssinjs'],
  // Disable static generation completely
  output: 'standalone',
  // Force dynamic rendering for all pages
  staticPageGenerationTimeout: 0,
  // Add runtime configuration for browser-only features
  serverRuntimeConfig: {
    // Will only be available on the server side
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
  },
};

export default withCivicAuth(nextConfig);