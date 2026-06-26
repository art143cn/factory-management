"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  BookOpen,
  ClipboardCheck,
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Upload,
  Download,
  AlertCircle,
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  category: string;
  content: string;
  version: string;
  status: string;
  fileUrl?: string | null;
  fileSize?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORIES = [
  { value: "管理制度", label: "管理制度", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "操作规程", label: "操作规程", icon: ClipboardCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { value: "技术文件", label: "技术文件", icon: FileText, color: "text-violet-500", bg: "bg-violet-500/10" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
];

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    draft: { label: "草稿", variant: "secondary" },
    published: { label: "已发布", variant: "default" },
    archived: { label: "已归档", variant: "outline" },
  };
  const s = map[status] ?? { label: status, variant: "secondary" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
};

const emptyForm = { title: "", category: "管理制度", content: "", version: "v1.0", status: "draft" };

const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

export default function SystemDocsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Dialog form state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Document | null>(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocs(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const filtered = docs.filter((d) => {
    if (activeCategory && d.category !== activeCategory) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // ——— Dialog open/close ———

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (doc: Document) => {
    setEditing(doc);
    setForm({
      title: doc.title,
      category: doc.category,
      content: doc.content,
      version: doc.version,
      status: doc.status,
    });
    setSelectedFile(null);
    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setError("");
    setSaving(false);
  };

  // ——— Save (create or update) — single request with file ———

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError("请输入文件标题");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("category", form.category);
      fd.append("content", form.content);
      fd.append("version", form.version);
      fd.append("status", form.status);

      if (selectedFile) {
        fd.append("file", selectedFile);
      } else if (editing && editing.fileUrl && !selectedFile) {
        // Editing and keeping existing file — tell API to not change it
        fd.append("keepFile", "true");
      }

      const url = editing ? `/api/documents?id=${editing.id}` : "/api/documents";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, { method, body: fd });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `请求失败 (${res.status})`);
        return;
      }

      // Success
      closeDialog();
      await fetchDocs();
    } catch {
      setError("网络异常，请重试");
    } finally {
      setSaving(false);
    }
  };

  // ——— Delete ———

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/documents?id=${deleting.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteDialogOpen(false);
        setDeleting(null);
        await fetchDocs();
      }
    } catch {
      // silent
    }
  };

  const categoryCount = (cat: string) => docs.filter((d) => d.category === cat).length;

  return (
    <div className="space-y-6">
      {/* ——— Page Header ——— */}
      <div className="flex items-center justify-between">
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
        <Button onClick={openCreate}>
          <Plus size={16} className="mr-1.5" />
          新建
        </Button>
      </div>

      {/* ——— Category Filter Cards ——— */}
      <div className="grid gap-4 md:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.value;
          return (
            <Card
              key={cat.value}
              className={`cursor-pointer transition-all duration-200 hover:shadow-mac-lg ${
                isActive ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setActiveCategory(isActive ? null : cat.value)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className={`rounded-mac p-2 ${cat.bg}`}>
                  <Icon size={20} className={cat.color} />
                </div>
                <span className="text-2xl font-bold">{categoryCount(cat.value)}</span>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">{cat.label}</CardTitle>
                <CardDescription>
                  {isActive ? "点击取消筛选" : "点击筛选"}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ——— Search & Table ——— */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>文件列表</CardTitle>
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索文件标题..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              暂无文件数据
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>类别</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>文件</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="w-[100px]">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{doc.category}</Badge>
                    </TableCell>
                    <TableCell>{doc.version}</TableCell>
                    <TableCell>
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Download size={14} />
                          {doc.fileSize ? formatFileSize(doc.fileSize) : "下载"}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{statusBadge(doc.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {doc.updatedAt
                        ? new Date(doc.updatedAt).toLocaleDateString("zh-CN")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(doc)}>
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeleting(doc);
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

      {/* ——— Create / Edit Dialog ——— */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) closeDialog();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑文件" : "新建文件"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">文件标题 <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="请输入文件标题"
              />
            </div>

            {/* Category + Version */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">类别</Label>
                <Select
                  id="category"
                  options={CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">版本号</Label>
                <Input
                  id="version"
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  placeholder="v1.0"
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid gap-2">
              <Label htmlFor="status">状态</Label>
              <Select
                id="status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              />
            </div>

            {/* File Upload */}
            <div className="grid gap-2">
              <Label>上传文件</Label>
              <div className="flex items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 rounded-mac border border-input bg-background px-3 py-2 text-sm hover:bg-accent">
                  <Upload size={16} />
                  选择文件
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {selectedFile ? (
                  <span className="text-sm text-muted-foreground">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </span>
                ) : editing?.fileUrl ? (
                  <span className="text-sm text-muted-foreground">已有文件（不选则保留）</span>
                ) : (
                  <span className="text-sm text-muted-foreground">可选</span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="grid gap-2">
              <Label htmlFor="content">内容</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="请输入文件内容（可选）"
                rows={8}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-1.5 rounded-mac bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
              {saving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
              {saving ? "保存中..." : editing ? "保存修改" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ——— Delete Confirmation Dialog ——— */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要删除「{deleting?.title}」吗？此操作不可撤销。
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
