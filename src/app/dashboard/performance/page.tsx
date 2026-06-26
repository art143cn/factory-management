import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Target, TrendingUp, Users } from "lucide-react";

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-mac bg-violet-500/10 p-2">
          <BarChart3 size={24} className="text-violet-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">绩效管理</h1>
          <p className="text-sm text-muted-foreground">
            部门与个人绩效考核、目标管理
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="rounded-mac bg-violet-500/10 p-2 w-fit">
              <Target size={20} className="text-violet-500" />
            </div>
            <CardTitle className="text-base">目标管理</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              部门年度目标制定、分解与跟踪管理
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-mac bg-emerald-500/10 p-2 w-fit">
              <TrendingUp size={20} className="text-emerald-500" />
            </div>
            <CardTitle className="text-base">考核评分</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              多维度考核体系，KPI 指标量化评分
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-mac bg-blue-500/10 p-2 w-fit">
              <Users size={20} className="text-blue-500" />
            </div>
            <CardTitle className="text-base">个人绩效</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              员工个人绩效档案、月度/季度考核汇总
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
