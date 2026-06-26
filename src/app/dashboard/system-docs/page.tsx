import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookOpen, ClipboardCheck } from "lucide-react";

export default function SystemDocsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-mac bg-blue-500/10 p-2">
          <FileText size={24} className="text-blue-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">体系文件管理</h1>
          <p className="text-sm text-muted-foreground">
            管理制度、操作规程、技术文件的集中管理
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="rounded-mac bg-blue-500/10 p-2 w-fit">
              <BookOpen size={20} className="text-blue-500" />
            </div>
            <CardTitle className="text-base">管理制度</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              厂区行政管理、安全生产、质量管控等制度文件
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-mac bg-emerald-500/10 p-2 w-fit">
              <ClipboardCheck size={20} className="text-emerald-500" />
            </div>
            <CardTitle className="text-base">操作规程</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              设备操作、工艺流程、应急处置等标准化操作规程
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="rounded-mac bg-violet-500/10 p-2 w-fit">
              <FileText size={20} className="text-violet-500" />
            </div>
            <CardTitle className="text-base">技术文件</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              工艺图纸、设备手册、维护指南等技术资料
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
