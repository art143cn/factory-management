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
  GanttChart,
  Target,
  TrendingUp,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  ListTodo,
  Flag,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  startDate?: string;
  endDate?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigneeId?: string;
  projectId: string;
  dueDate?: string;
}

interface Milestone {
  id: string;
  name: string;
  description?: string;
  targetDate?: string;
  completedAt?: string;
  status: string;
  projectId: string;
}

const taskStatusBadge = (s: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    todo: { label: "待办", variant: "secondary" },
    in_progress: { label: "进行中", variant: "default" },
    done: { label: "已完成", variant: "outline" },
  };
  const m = map[s] ?? { label: s, variant: "secondary" };
  return <Badge variant={m.variant}>{m.label}</Badge>;
};

const milestoneStatusBadge = (s: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    pending: { label: "待完成", variant: "secondary" },
    completed: { label: "已完成", variant: "default" },
    delayed: { label: "已延期", variant: "destructive" },
  };
  const m = map[s] ?? { label: s, variant: "secondary" };
  return <Badge variant={m.variant}>{m.label}</Badge>;
};

const progressColor = (v: number) => {
  if (v >= 80) return "bg-emerald-500";
  if (v >= 40) return "bg-amber-500";
  return "bg-blue-500";
};

const emptyTaskForm = { title: "", description: "", status: "todo", priority: "medium", dueDate: "" };
const emptyMilestoneForm = { name: "", description: "", targetDate: "", status: "pending" };

export default function ProgressPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasksMap, setTasksMap] = useState<Record<string, Task[]>>({});
  const [milestonesMap, setMilestonesMap] = useState<Record<string, Milestone[]>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Task dialog state
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskSaving, setTaskSaving] = useState(false);

  // Milestone dialog state
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [milestoneProjectId, setMilestoneProjectId] = useState("");
  const [milestoneForm, setMilestoneForm] = useState(emptyMilestoneForm);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestoneSaving, setMilestoneSaving] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingType, setDeletingType] = useState<"task" | "milestone" | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ id: string; name: string } | null>(null);

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

  const fetchTasks = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`);
      if (res.ok) {
        const data = await res.json();
        setTasksMap((prev) => ({
          ...prev,
          [projectId]: Array.isArray(data) ? data : data.data ?? [],
        }));
      }
    } catch {
      // silent
    }
  }, []);

  const fetchMilestones = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/milestones`);
      if (res.ok) {
        const data = await res.json();
        setMilestonesMap((prev) => ({
          ...prev,
          [projectId]: Array.isArray(data) ? data : data.data ?? [],
        }));
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const toggleExpand = (id: string) => {
    const next = !expanded[id];
    setExpanded({ ...expanded, [id]: next });
    if (next) {
      if (!tasksMap[id]) fetchTasks(id);
      if (!milestonesMap[id]) fetchMilestones(id);
    }
  };

  // Task CRUD
  const openCreateTask = (projectId: string) => {
    setTaskProjectId(projectId);
    setEditingTask(null);
    setTaskForm(emptyTaskForm);
    setTaskDialogOpen(true);
  };

  const openEditTask = (task: Task) => {
    setTaskProjectId(task.projectId);
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
    });
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async () => {
    setTaskSaving(true);
    try {
      const url = editingTask
        ? `/api/projects/${taskProjectId}/tasks?id=${editingTask.id}`
        : `/api/projects/${taskProjectId}/tasks`;
      const method = editingTask ? "PUT" : "POST";
      const body = editingTask ? { ...taskForm, projectId: taskProjectId } : { ...taskForm, projectId: taskProjectId };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setTaskDialogOpen(false);
        setTaskForm(emptyTaskForm);
        setEditingTask(null);
        await fetchTasks(taskProjectId);
      }
    } catch {
      // silent
    } finally {
      setTaskSaving(false);
    }
  };

  // Milestone CRUD
  const openCreateMilestone = (projectId: string) => {
    setMilestoneProjectId(projectId);
    setEditingMilestone(null);
    setMilestoneForm(emptyMilestoneForm);
    setMilestoneDialogOpen(true);
  };

  const openEditMilestone = (m: Milestone) => {
    setMilestoneProjectId(m.projectId);
    setEditingMilestone(m);
    setMilestoneForm({
      name: m.name,
      description: m.description ?? "",
      targetDate: m.targetDate ? m.targetDate.split("T")[0] : "",
      status: m.status,
    });
    setMilestoneDialogOpen(true);
  };

  const handleSaveMilestone = async () => {
    setMilestoneSaving(true);
    try {
      const url = editingMilestone
        ? `/api/projects/${milestoneProjectId}/milestones?id=${editingMilestone.id}`
        : `/api/projects/${milestoneProjectId}/milestones`;
      const method = editingMilestone ? "PUT" : "POST";
      const body = editingMilestone
        ? { ...milestoneForm, projectId: milestoneProjectId }
        : { ...milestoneForm, projectId: milestoneProjectId };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setMilestoneDialogOpen(false);
        setMilestoneForm(emptyMilestoneForm);
        setEditingMilestone(null);
        await fetchMilestones(milestoneProjectId);
      }
    } catch {
      // silent
    } finally {
      setMilestoneSaving(false);
    }
  };

  // Delete
  const confirmDelete = (type: "task" | "milestone", item: { id: string; name: string }) => {
    setDeletingType(type);
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingItem || !deletingType) return;
    const projectId = deletingType === "task" ? taskProjectId : milestoneProjectId;
    const endpoint =
      deletingType === "task"
        ? `/api/projects/${projectId}/tasks?id=${deletingItem.id}`
        : `/api/projects/${projectId}/milestones?id=${deletingItem.id}`;
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        setDeleteDialogOpen(false);
        setDeletingItem(null);
        setDeletingType(null);
        if (deletingType === "task") {
          await fetchTasks(projectId);
        } else {
          await fetchMilestones(projectId);
        }
      }
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              项目总数
            </CardTitle>
            <GanttChart size={16} className="text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均进度
            </CardTitle>
            <TrendingUp size={16} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.length > 0
                ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
                : 0}
              <span className="text-sm font-normal text-muted-foreground">%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              延期风险
            </CardTitle>
            <AlertCircle size={16} className="text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {projects.filter((p) => p.status === "abnormal").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          暂无项目数据
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader
                className="cursor-pointer select-none"
                onClick={() => toggleExpand(project.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {expanded[project.id] ? (
                      <ChevronDown size={18} className="text-muted-foreground" />
                    ) : (
                      <ChevronRight size={18} className="text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      {project.description && (
                        <CardDescription>{project.description}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-muted sm:w-32">
                        <div
                          className={`h-2 rounded-full transition-all ${progressColor(project.progress)}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{project.progress}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateTask(project.id);
                        }}
                        title="添加任务"
                      >
                        <ListTodo size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateMilestone(project.id);
                        }}
                        title="添加里程碑"
                      >
                        <Flag size={15} />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {expanded[project.id] && (
                <CardContent>
                  <div className="space-y-4">
                    {/* Tasks Section */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-medium flex items-center gap-1.5">
                          <ListTodo size={14} className="text-blue-500" />
                          任务列表
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCreateTask(project.id)}
                        >
                          <Plus size={14} className="mr-1" />
                          添加
                        </Button>
                      </div>
                      {tasksMap[project.id] ? (
                        tasksMap[project.id].length === 0 ? (
                          <p className="text-xs text-muted-foreground py-1">暂无任务</p>
                        ) : (
                          <div className="space-y-1.5">
                            {tasksMap[project.id].map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between rounded-mac border bg-muted/30 px-3 py-2 text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  {task.status === "done" ? (
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                  ) : (
                                    <ListTodo size={14} className="text-muted-foreground" />
                                  )}
                                  <span className={task.status === "done" ? "line-through text-muted-foreground" : ""}>
                                    {task.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {task.dueDate && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(task.dueDate).toLocaleDateString("zh-CN")}
                                    </span>
                                  )}
                                  {taskStatusBadge(task.status)}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => openEditTask(task)}
                                  >
                                    <Pencil size={12} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => confirmDelete("task", { id: task.id, name: task.title })}
                                  >
                                    <Trash2 size={12} className="text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2 py-1">
                          <Loader2 size={14} className="animate-spin text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">加载中...</span>
                        </div>
                      )}
                    </div>

                    {/* Milestones Section */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="text-sm font-medium flex items-center gap-1.5">
                          <Target size={14} className="text-amber-500" />
                          里程碑
                        </h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCreateMilestone(project.id)}
                        >
                          <Plus size={14} className="mr-1" />
                          添加
                        </Button>
                      </div>
                      {milestonesMap[project.id] ? (
                        milestonesMap[project.id].length === 0 ? (
                          <p className="text-xs text-muted-foreground py-1">暂无里程碑</p>
                        ) : (
                          <div className="space-y-1.5">
                            {milestonesMap[project.id].map((m) => (
                              <div
                                key={m.id}
                                className="flex items-center justify-between rounded-mac border bg-muted/30 px-3 py-2 text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  {m.status === "completed" ? (
                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                  ) : m.status === "delayed" ? (
                                    <AlertCircle size={14} className="text-red-500" />
                                  ) : (
                                    <Target size={14} className="text-amber-500" />
                                  )}
                                  <span>{m.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {m.targetDate && (
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(m.targetDate).toLocaleDateString("zh-CN")}
                                    </span>
                                  )}
                                  {milestoneStatusBadge(m.status)}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => openEditMilestone(m)}
                                  >
                                    <Pencil size={12} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => confirmDelete("milestone", { id: m.id, name: m.name })}
                                  >
                                    <Trash2 size={12} className="text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2 py-1">
                          <Loader2 size={14} className="animate-spin text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">加载中...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? "编辑任务" : "新建任务"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskTitle">任务标题</Label>
              <Input
                id="taskTitle"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="请输入任务标题"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskDesc">描述</Label>
              <Textarea
                id="taskDesc"
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="任务描述（可选）"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="taskStatus">状态</Label>
                <Select
                  id="taskStatus"
                  options={[
                    { value: "todo", label: "待办" },
                    { value: "in_progress", label: "进行中" },
                    { value: "done", label: "已完成" },
                  ]}
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskPriority">优先级</Label>
                <Select
                  id="taskPriority"
                  options={[
                    { value: "low", label: "低" },
                    { value: "medium", label: "中" },
                    { value: "high", label: "高" },
                    { value: "urgent", label: "紧急" },
                  ]}
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskDue">截止日期</Label>
              <Input
                id="taskDue"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveTask} disabled={taskSaving || !taskForm.title}>
              {taskSaving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
              {editingTask ? "保存修改" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingMilestone ? "编辑里程碑" : "新建里程碑"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="msName">里程碑名称</Label>
              <Input
                id="msName"
                value={milestoneForm.name}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, name: e.target.value })}
                placeholder="请输入里程碑名称"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="msDesc">描述</Label>
              <Textarea
                id="msDesc"
                value={milestoneForm.description}
                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                placeholder="里程碑描述（可选）"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="msTarget">目标日期</Label>
                <Input
                  id="msTarget"
                  type="date"
                  value={milestoneForm.targetDate}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, targetDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="msStatus">状态</Label>
                <Select
                  id="msStatus"
                  options={[
                    { value: "pending", label: "待完成" },
                    { value: "completed", label: "已完成" },
                    { value: "delayed", label: "已延期" },
                  ]}
                  value={milestoneForm.status}
                  onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMilestoneDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveMilestone} disabled={milestoneSaving || !milestoneForm.name}>
              {milestoneSaving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
              {editingMilestone ? "保存修改" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            确定要删除{(deletingType === "task" ? "任务" : "里程碑")}「{deletingItem?.name}」吗？此操作不可撤销。
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
