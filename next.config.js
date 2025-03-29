/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config) => {
    // 解决react-syntax-highlighter的导入问题
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    return config;
  },
  // 设置开发服务器端口为3000
  env: {
    PORT: "3000"
  },
  // 确保CSS正确应用
  compiler: {
    styledComponents: true,
  },
  // 确保路由正确工作
  trailingSlash: false
}

module.exports = nextConfig;