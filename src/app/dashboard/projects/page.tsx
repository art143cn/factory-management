"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  progress: number;
  managerId?: string;
  createdAt?: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "待开始" },
  { value: "ongoing", label: "进行中" },
  { value: "completed", label: "已完成" },
  { value: "abnormal", label: "异常" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
  { value: "urgent", label: "紧急" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "待开始", color: "text-muted-foreground", bg: "bg-muted" },
  ongoing: { label: "进行中", color: "text-blue-500", bg: "bg-blue-500/10" },
  completed: { label: "已完成", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  abnormal: { label: "异常", color: "text-amber-500", bg: "bg-amber-500/10" },
};

const priorityBadge = (p: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    low: { label: "低", variant: "secondary" },
    medium: { label: "中", variant: "outline" },
    high: { label: "高", variant: "default" },
    urgent: { label: "紧急", variant: "destructive" },
  };
  const m = map[p] ?? { label: p, variant: "secondary" };
  return <Badge variant={m.variant}>{m.label}</Badge>;
};

const statusBadge = (s: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending: { label: "待开始", variant: "secondary" },
    ongoing: { label: "进行中", variant: "default" },
    completed: { label: "已完成", variant: "outline" },
    abnormal: { label: "异常", variant: "destructive" },
  };
  const m = map[s] ?? { label: s, variant: "secondary" };
  return <Badge variant={m.variant}>{m.label}</Badge>;
};

const emptyForm = {
  name: "",
  description: "",
  status: "pending",
  priority: "medium",
  startDate: "",
  endDate: "",
  progress: 0,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/api/projects?id=${editing.id}` : "/api/projects";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDialogOpen(false);
        setEditing(null);
        setForm(emptyForm);
        await fetchProjects();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/projects?id=${deleting.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteDialogOpen(false);
        setDeleting(null);
        await fetchProjects();
      }
    } catch {
      // silent
    }
  };

  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      status: p.status,
      priority: p.priority,
      startDate: p.startDate ? p.startDate.split("T")[0] : "",
      endDate: p.endDate ? p.endDate.split("T")[0] : "",
      progress: p.progress,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const statusCount = (s: string) => projects.filter((p) => p.status === s).length;

  const progressColor = (v: number) => {
    if (v >= 80) return "bg-emerald-500";
    if (v >= 40) return "bg-amber-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-mac bg-emerald-500/10 p-2">
            <FolderKanban size={24} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">项目管理</h1>
            <p className="text-sm text-muted-foreground">
              厂区建设项目全生命周期管理
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus size={16} className="mr-1.5" />
              新建
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editing ? "编辑项目" : "新建项目"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">项目名称</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="请输入项目名称"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">描述</Label>
                <Textarea
                  id="desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="项目描述（可选）"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    id="status"
                    options={STATUS_OPTIONS}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">优先级</Label>
                  <Select
                    id="priority"
                    options={PRIORITY_OPTIONS}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">开始日期</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">结束日期</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="progress">进度 ({form.progress}%)</Label>
                <Input
                  id="progress"
                  type="range"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={saving || !form.name}>
                {saving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
                {editing ? "保存修改" : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">全部项目</CardTitle>
            <FolderKanban size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">进行中</CardTitle>
            <Clock size={16} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{statusCount("ongoing")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">已完成</CardTitle>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{statusCount("completed")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">异常</CardTitle>
            <AlertTriangle size={16} className="text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{statusCount("abnormal")}</div>
          </CardContent>
        </Card>
      </div>

      {/* Project List */}
      <Card>
        <CardHeader>
          <CardTitle>项目列表</CardTitle>
          <CardDescription>点击项目名称查看详情</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无项目数据
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>项目名称</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>起止日期</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <button
                        className="font-medium text-primary hover:underline"
                        onClick={() => {
                          setSelectedProject(p);
                          setDetailDialogOpen(true);
                        }}
                      >
                        {p.name}
                      </button>
                    </TableCell>
                    <TableCell>{priorityBadge(p.priority)}</TableCell>
                    <TableCell>{statusBadge(p.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div
                            className={`h-2 rounded-full transition-all ${progressColor(p.progress)}`}
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {p.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.startDate
                        ? new Date(p.startDate).toLocaleDateString("zh-CN")
                        : "-"}{" "}
                      ~{" "}
                      {p.endDate
                        ? new Date(p.endDate).toLocaleDateString("zh-CN")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleting(p);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 size={15} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedProject?.name}</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              {selectedProject.description && (
                <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">状态</span>
                  <div className="mt-1">{statusBadge(selectedProject.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">优先级</span>
                  <div className="mt-1">{priorityBadge(selectedProject.priority)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">进度</span>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full ${progressColor(selectedProject.progress)}`}
                        style={{ width: `${selectedProject.progress}%` }}
                      />
                    </div>
                    <span className="text-xs">{selectedProject.progress}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">起止日期</span>
                  <div className="mt-1">
                    {selectedProject.startDate
                      ? new Date(selectedProject.startDate).toLocaleDateString("zh-CN")
                      : "-"}{" "}
                    ~{" "}
                    {selectedProject.endDate
                      ? new Date(selectedProject.endDate).toLocaleDateString("zh-CN")
                      : "-"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要删除项目「{deleting?.name}」吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
