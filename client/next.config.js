/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud', // <-- ADDED THIS
      },
    ],
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Internationalized Routing
  // Note: Static exports (if you use them) don't support i18n, but standard Next.js does.
  // If you get an error about i18n, remove this block.
  // i18n: {
  //   locales: ['en', 'fr', 'sw', 'ha', 'ar'],
  //   defaultLocale: 'en',
  // },

  // Webpack config merged here
  webpack: (config) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      // Only keep this if you actually installed 'fake-indexeddb'
      // indexedDB: require.resolve('fake-indexeddb') 
    }
    return config
  }
}

module.exports = nextConfig