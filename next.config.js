/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { domains: ["cdn.sanity.io", "cdn-icons-png.flaticon.com"] },
  api: { domains: ["https://nv2022141202-1rktq8gj.uc.gateway.dev"] },
};

module.exports = nextConfig;
