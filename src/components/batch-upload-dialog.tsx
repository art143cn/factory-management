"use client";

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Trash2,
} from "lucide-react";

export interface UploadFileEntry {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

interface BatchUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  categories: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
}

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
];

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

let idCounter = 0;
const nextId = () => `file-${++idCounter}-${Date.now()}`;

export default function BatchUploadDialog({
  open,
  onOpenChange,
  onComplete,
  categories,
  statusOptions,
}: BatchUploadDialogProps) {
  const [files, setFiles] = useState<UploadFileEntry[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [category, setCategory] = useState(categories[0]?.value || "管理制度");
  const [version, setVersion] = useState("v1.0");
  const [status, setStatus] = useState("draft");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const entries: UploadFileEntry[] = Array.from(newFiles).map((file) => ({
      id: nextId(),
      file,
      status: "pending" as const,
    }));
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleStartUpload = async () => {
    if (files.length === 0 || uploading) return;

    setUploading(true);

    // Mark all as uploading
    setFiles((prev) => prev.map((f) => ({ ...f, status: "uploading" as const, error: undefined })));

    const fd = new FormData();
    files.forEach((entry) => fd.append("files", entry.file));
    fd.append("category", category);
    fd.append("version", version);
    fd.append("status", status);

    try {
      const res = await fetch("/api/documents/batch", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        // All failed
        setFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: "error" as const,
            error: data.error || `请求失败 (${res.status})`,
          }))
        );
        setUploading(false);
        return;
      }

      // Mark individual results
      const failedMap = new Map<string, string>();
      if (data.failed) {
        for (const f of data.failed as { fileName: string; error: string }[]) {
          failedMap.set(f.fileName, f.error);
        }
      }

      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: failedMap.has(f.file.name) ? ("error" as const) : ("success" as const),
          error: failedMap.get(f.file.name),
        }))
      );

      if (data.successCount > 0) {
        onComplete();
      }
    } catch {
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: "error" as const,
          error: "网络异常，请重试",
        }))
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    onOpenChange(false);
  };

  const resetAndClose = () => {
    setFiles([]);
    setDragOver(false);
    setUploading(false);
    onOpenChange(false);
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const hasResult = successCount > 0 || errorCount > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>批量上传文件</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* ——— Common Settings ——— */}
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>类别</Label>
              <Select
                options={categories}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>版本号</Label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v1.0" />
            </div>
            <div className="grid gap-1.5">
              <Label>状态</Label>
              <Select
                options={statusOptions || STATUS_OPTIONS}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
          </div>

          {/* ——— Drag & Drop Zone ——— */}
          {!uploading && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative flex cursor-pointer flex-col items-center justify-center rounded-mac border-2 border-dashed p-8 transition-colors ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <div className={`rounded-full p-3 transition-colors ${dragOver ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                <Upload size={28} />
              </div>
              <p className="mt-3 text-sm font-medium">
                {dragOver ? "松开鼠标上传文件" : "拖拽文件到此处，或点击选择文件"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">支持所有文件格式，单文件最大 50MB</p>
            </div>
          )}

          {/* ——— File List ——— */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  共 {files.length} 个文件
                  {hasResult && (
                    <span className="ml-2 text-muted-foreground font-normal">
                      · {successCount} 成功
                      {errorCount > 0 && <span className="text-destructive"> · {errorCount} 失败</span>}
                    </span>
                  )}
                </span>
                {!uploading && !hasResult && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearAll}>
                    <Trash2 size={12} className="mr-1" />
                    清空
                  </Button>
                )}
              </div>

              <div className="max-h-[240px] space-y-1.5 overflow-y-auto pr-1">
                {files.map((entry) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 rounded-mac border p-2.5 text-sm transition-colors ${
                      entry.status === "error"
                        ? "border-destructive/20 bg-destructive/5"
                        : entry.status === "success"
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30"
                          : "border-border"
                    }`}
                  >
                    {/* Status icon */}
                    <div className="flex-shrink-0">
                      {entry.status === "uploading" ? (
                        <Loader2 size={16} className="animate-spin text-primary" />
                      ) : entry.status === "success" ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : entry.status === "error" ? (
                        <AlertCircle size={16} className="text-destructive" />
                      ) : (
                        <FileText size={16} className="text-muted-foreground" />
                      )}
                    </div>

                    {/* File info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{entry.file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(entry.file.size)}</p>
                    </div>

                    {/* Error or remove */}
                    {entry.status === "error" && entry.error && (
                      <span className="max-w-[160px] flex-shrink-0 truncate text-xs text-destructive">
                        {entry.error}
                      </span>
                    )}

                    {!uploading && entry.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => removeFile(entry.id)}
                      >
                        <X size={14} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t pt-4">
          <Button variant="outline" onClick={resetAndClose} disabled={uploading}>
            {hasResult ? "完成" : "取消"}
          </Button>
          {!hasResult && (
            <Button
              onClick={handleStartUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="mr-1.5 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload size={16} className="mr-1.5" />
                  开始上传 ({files.filter((f) => f.status === "pending").length} 个)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
