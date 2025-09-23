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
    ],
  },
  // Enable React Strict Mode
  reactStrictMode: true,
  // Internationalized Routing
  i18n: {
    locales: ['en', 'fr', 'sw', 'ha', 'ar'],
    defaultLocale: 'en',
  },
  
}

module.exports = {
  webpack: (config) => {
    config.resolve.fallback = { 
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      indexedDB: require.resolve('fake-indexeddb')
    }
    return config
  }
}