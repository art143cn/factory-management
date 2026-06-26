"use client";

import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/": "工作台",
  "/dashboard/system-docs": "体系文件管理",
  "/dashboard/projects": "项目管理",
  "/dashboard/progress": "重点进度跟踪",
  "/dashboard/party-affairs": "党务管理",
  "/dashboard/performance": "绩效管理",
};

export function Header() {
  const pathname = usePathname();
  const title = titles[pathname] || "厂务管理系统";

  return (
    <header className="flex h-14 items-center justify-between border-b bg-sidebar/60 backdrop-blur-xl px-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium">
          管
        </div>
      </div>
    </header>
  );
}
