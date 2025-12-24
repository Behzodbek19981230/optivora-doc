/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')

module.exports = {
  output: 'export',

  reactStrictMode: false,
  trailingSlash: true,

  images: {
    unoptimized: true
  },

  eslint: {
    ignoreDuringBuilds: true
  },

  webpack: config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      apexcharts: path.resolve(__dirname, './node_modules/apexcharts-clevision')
    }

    return config
  }
}
