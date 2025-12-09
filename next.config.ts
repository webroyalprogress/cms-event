/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**", // boleh sesuaikan folder tertentu kalau mau lebih ketat
      },
      {
        protocol: "https",
        hostname: "cmsdev.royalprogress.com",
        port: "",
        pathname: "/**", // boleh sesuaikan folder tertentu kalau mau lebih ketat
      }
    ],
  },
};

export default nextConfig;
