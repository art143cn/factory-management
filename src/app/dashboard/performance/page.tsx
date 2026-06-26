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
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Target,
  Users,
} from "lucide-react";

interface Performance {
  id: string;
  userId?: string;
  year: number;
  month: number;
  score: number;
  kpis?: string;
  comment?: string;
  status: string;
  createdAt?: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;

const YEARS = Array.from({ length: 5 }, (_, i) => ({
  value: String(CURRENT_YEAR - i),
  label: `${CURRENT_YEAR - i}年`,
}));

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}月`,
}));

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "submitted", label: "已提交" },
  { value: "approved", label: "已审核" },
];

const statusBadge = (s: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    draft: { label: "草稿", variant: "secondary" },
    submitted: { label: "已提交", variant: "default" },
    approved: { label: "已审核", variant: "outline" },
  };
  const m = map[s] ?? { label: s, variant: "secondary" };
  return <Badge variant={m.variant}>{m.label}</Badge>;
};

const scoreColor = (s: number) => {
  if (s >= 90) return "text-emerald-500";
  if (s >= 70) return "text-blue-500";
  if (s >= 60) return "text-amber-500";
  return "text-red-500";
};

const emptyForm = {
  year: CURRENT_YEAR,
  month: CURRENT_MONTH,
  score: 0,
  kpis: "",
  comment: "",
  status: "draft",
};

export default function PerformancePage() {
  const [records, setRecords] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Performance | null>(null);
  const [deleting, setDeleting] = useState<Performance | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("year", String(selectedYear));
      if (selectedMonth) params.set("month", String(selectedMonth));
      const res = await fetch(`/api/performances?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = editing ? `/api/performances?id=${editing.id}` : "/api/performances";
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
        await fetchRecords();
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
      const res = await fetch(`/api/performances?id=${deleting.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteDialogOpen(false);
        setDeleting(null);
        await fetchRecords();
      }
    } catch {
      // silent
    }
  };

  const openEdit = (r: Performance) => {
    setEditing(r);
    setForm({
      year: r.year,
      month: r.month,
      score: r.score,
      kpis: r.kpis ?? "",
      comment: r.comment ?? "",
      status: r.status,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const monthPrev = () => {
    if (selectedMonth === null) {
      setSelectedMonth(CURRENT_MONTH);
    } else if (selectedMonth === 1) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const monthNext = () => {
    if (selectedMonth === null) {
      setSelectedMonth(CURRENT_MONTH);
    } else if (selectedMonth === 12) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const avgScore = records.length > 0
    ? Math.round(records.reduce((s, r) => s + r.score, 0) / records.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>
              <Plus size={16} className="mr-1.5" />
              新建
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editing ? "编辑绩效记录" : "新建绩效记录"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="year">年份</Label>
                  <Select
                    id="year"
                    options={YEARS}
                    value={String(form.year)}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="month">月份</Label>
                  <Select
                    id="month"
                    options={MONTHS}
                    value={String(form.month)}
                    onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="score">考核得分</Label>
                  <Input
                    id="score"
                    type="number"
                    min={0}
                    max={100}
                    value={form.score}
                    onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    id="status"
                    options={STATUS_OPTIONS}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kpis">KPI 指标</Label>
                <Textarea
                  id="kpis"
                  value={form.kpis}
                  onChange={(e) => setForm({ ...form, kpis: e.target.value })}
                  placeholder="KPI 考核指标及完成情况（可选）"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comment">综合评价</Label>
                <Textarea
                  id="comment"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="综合评价意见（可选）"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
                {editing ? "保存修改" : "创建"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month Selector + Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-mac border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={String(selectedYear)}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {YEARS.map((y) => (
              <option key={y.value} value={y.value}>{y.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 rounded-mac border bg-card px-1 py-1 shadow-sm">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={monthPrev}>
              <ChevronLeft size={15} />
            </Button>
            <span className="min-w-[60px] text-center text-sm font-medium">
              {selectedMonth ? `${selectedMonth}月` : "全部"}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={monthNext}>
              <ChevronRight size={15} />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => { setSelectedMonth(null); }}
          >
            显示全部
          </Button>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Target size={15} className="text-muted-foreground" />
            <span>记录 <strong>{records.length}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={15} className="text-blue-500" />
            <span>平均分 <strong className={scoreColor(avgScore)}>{avgScore}</strong></span>
          </div>
        </div>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>绩效记录</CardTitle>
          <CardDescription>
            {selectedYear}年{selectedMonth ? `${selectedMonth}月` : ""} 绩效考核数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无绩效记录
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>考核周期</TableHead>
                  <TableHead>得分</TableHead>
                  <TableHead>KPI 指标</TableHead>
                  <TableHead>综合评价</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.year}年{r.month}月
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className={scoreColor(r.score)} />
                        <span className={`font-bold ${scoreColor(r.score)}`}>
                          {r.score}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {r.kpis || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                      {r.comment || "-"}
                    </TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleting(r);
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

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要删除 {deleting?.year}年{deleting?.month}月的绩效记录吗？此操作不可撤销。
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
