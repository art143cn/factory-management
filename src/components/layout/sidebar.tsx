"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  GanttChart,
  Flag,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const mainNav: NavItem[] = [
  { title: "工作台", href: "/", icon: LayoutDashboard },
  { title: "体系文件管理", href: "/dashboard/system-docs", icon: FileText },
  { title: "项目管理", href: "/dashboard/projects", icon: FolderKanban },
  { title: "重点进度跟踪", href: "/dashboard/progress", icon: GanttChart },
  { title: "党务管理", href: "/dashboard/party-affairs", icon: Flag },
  { title: "绩效管理", href: "/dashboard/performance", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-16 flex-col border-r bg-sidebar/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-14 items-center justify-center border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-mac bg-primary font-bold text-primary-foreground text-xs">
          厂
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col items-center gap-1 px-2 py-4">
        <TooltipProvider delayDuration={0}>
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-mac transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="ml-2">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Version */}
      <div className="border-t px-2 py-3">
        <div className="text-center text-[10px] text-muted-foreground">
          v0.1
        </div>
      </div>
    </aside>
  );
}
