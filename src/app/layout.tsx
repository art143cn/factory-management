import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "厂务管理系统",
  description: "体系文件管理 · 项目管理 · 重点进度跟踪 · 党务管理 · 绩效管理",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
