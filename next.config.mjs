/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "7076bb96d38b123ec74a7843bc674a94.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-736ef3be77f045e8ba550ae958fe7e1b.r2.dev",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://202.10.48.195:8080/api'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
