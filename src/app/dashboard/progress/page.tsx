import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GanttChart, Target, TrendingUp, Clock } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-mac bg-amber-500/10 p-2">
          <GanttChart size={24} className="text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">重点进度跟踪</h1>
          <p className="text-sm text-muted-foreground">
            关键项目里程碑与进度实时监控
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="rounded-mac bg-amber-500/10 p-2 w-fit">
              <Target size={20} className="text-amber-500" />
            </div>
            <CardTitle className="text-base">关键里程碑</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              追踪重点项目的关键节点完成情况
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-mac bg-blue-500/10 p-2 w-fit">
              <TrendingUp size={20} className="text-blue-500" />
            </div>
            <CardTitle className="text-base">进度看板</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              可视化展示各项目当前进度百分比
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-mac bg-red-500/10 p-2 w-fit">
              <Clock size={20} className="text-red-500" />
            </div>
            <CardTitle className="text-base">延期预警</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              自动识别延期风险并及时预警通知
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
