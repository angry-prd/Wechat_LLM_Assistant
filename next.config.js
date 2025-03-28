/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // 解决react-syntax-highlighter的导入问题
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    return config;
  },

}

module.exports = {
  ...nextConfig,
  // 设置开发服务器端口为3000
  env: {
    PORT: "3000"
  }
}