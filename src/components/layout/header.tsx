"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

type RoutePath =
  | "/dashboard"
  | "/dashboard/system-docs"
  | "/dashboard/projects"
  | "/dashboard/progress"
  | "/dashboard/party-affairs"
  | "/dashboard/performance";

const titles: Record<RoutePath, string> = {
  "/dashboard": "工作台",
  "/dashboard/system-docs": "体系文件管理",
  "/dashboard/projects": "项目管理",
  "/dashboard/progress": "重点进度跟踪",
  "/dashboard/party-affairs": "党务管理",
  "/dashboard/performance": "绩效管理",
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const title = titles[pathname as RoutePath] || "厂务管理系统";
  const userName = session?.user?.name || "用户";
  const initial = userName.charAt(0);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-sidebar/60 backdrop-blur-xl px-6">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-mac px-2 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
          <div
            role="img"
            aria-label={userName}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-medium"
          >
            {initial}
          </div>
          <span className="hidden sm:inline">{userName}</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-mac px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          退出
        </button>
      </div>
    </header>
  );
}
