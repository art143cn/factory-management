import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  FolderKanban,
  GanttChart,
  Flag,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const modules = [
  {
    title: "体系文件管理",
    description: "管理制度、操作规程、技术文件等体系文档的发布与存档",
    href: "/dashboard/system-docs",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "项目管理",
    description: "厂区建设项目全生命周期管理",
    href: "/dashboard/projects",
    icon: FolderKanban,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "重点进度跟踪",
    description: "关键项目里程碑与进度实时监控",
    href: "/dashboard/progress",
    icon: GanttChart,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "党务管理",
    description: "党组织活动、党员信息、学习记录管理",
    href: "/dashboard/party-affairs",
    icon: Flag,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    title: "绩效管理",
    description: "部门与个人绩效考核、目标管理",
    href: "/dashboard/performance",
    icon: BarChart3,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

const stats = [
  { label: "进行中项目", value: "12", icon: TrendingUp, color: "text-blue-500" },
  { label: "待办审批", value: "8", icon: AlertCircle, color: "text-amber-500" },
  { label: "已完成", value: "45", icon: CheckCircle2, color: "text-emerald-500" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
                <Icon size={18} className={s.color} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  {s.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Module cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">功能模块</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <Link key={m.href} href={m.href}>
                <Card className="cursor-pointer transition-all duration-200 hover:shadow-mac-lg hover:-translate-y-0.5">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className={`rounded-mac p-2 ${m.bg}`}>
                      <Icon size={22} className={m.color} />
                    </div>
                    <CardTitle className="text-base">{m.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{m.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
