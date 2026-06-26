import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag, Users, BookOpen, Calendar } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "党务管理 · 厂务管理系统",
};

export default function PartyAffairsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-mac bg-red-500/10 p-2">
          <Flag size={24} className="text-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">党务管理</h1>
          <p className="text-sm text-muted-foreground">
            党组织活动、党员信息、学习记录管理
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="rounded-mac bg-red-500/10 p-2 w-fit">
              <Users size={20} className="text-red-500" />
            </div>
            <CardTitle className="text-base">党员信息</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              党员基本信息、组织关系、党费缴纳记录
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-mac bg-amber-500/10 p-2 w-fit">
              <Calendar size={20} className="text-amber-500" />
            </div>
            <CardTitle className="text-base">组织活动</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              三会一课、主题党日、民主生活会等活动记录
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-mac bg-blue-500/10 p-2 w-fit">
              <BookOpen size={20} className="text-blue-500" />
            </div>
            <CardTitle className="text-base">学习记录</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              党员学习笔记、考试记录、培训档案
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
