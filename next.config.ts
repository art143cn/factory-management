import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "bcryptjs"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 让 Prisma 7 生成的客户端可以使用 node: 前缀导入
      config.externals = [
        ...(Array.isArray(config.externals)
          ? config.externals
          : config.externals
            ? [config.externals]
            : []),
        /@prisma\/client/,
        /@prisma\/adapter-pg/,
        /node:crypto/,
        /node:fs/,
        /node:path/,
        /node:os/,
        /node:module/,
        /node:url/,
        /node:process/,
      ];
    }
    return config;
  },
};

export default nextConfig;
