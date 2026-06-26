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
  Flag,
  Users,
  BookOpen,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Phone,
  GraduationCap,
  MapPin,
  Clock,
  Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────

interface PartyMember {
  id: string;
  name: string;
  gender?: string;
  birthDate?: string;
  joinPartyAt?: string;
  position?: string;
  education?: string;
  phone?: string;
  userId?: string;
  createdAt?: string;
}

interface PartyActivity {
  id: string;
  title: string;
  type: string;
  date: string;
  location?: string;
  content?: string;
  memberId?: string;
  createdAt?: string;
}

interface PartyStudy {
  id: string;
  title: string;
  date: string;
  duration?: number;
  content?: string;
  score?: number;
  memberId?: string;
  createdAt?: string;
}

// ─── Constants ────────────────────────────────────────

const GENDER_OPTIONS = [
  { value: "男", label: "男" },
  { value: "女", label: "女" },
];

const ACTIVITY_TYPES = [
  { value: "三会一课", label: "三会一课" },
  { value: "主题党日", label: "主题党日" },
  { value: "民主生活会", label: "民主生活会" },
  { value: "其他", label: "其他" },
];

const EDUCATION_OPTIONS = [
  { value: "高中", label: "高中" },
  { value: "大专", label: "大专" },
  { value: "本科", label: "本科" },
  { value: "硕士", label: "硕士" },
  { value: "博士", label: "博士" },
];

const emptyMemberForm = {
  name: "",
  gender: "男",
  birthDate: "",
  joinPartyAt: "",
  position: "",
  education: "",
  phone: "",
};

const emptyActivityForm = {
  title: "",
  type: "三会一课",
  date: new Date().toISOString().split("T")[0],
  location: "",
  content: "",
};

const emptyStudyForm = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  duration: 60,
  content: "",
  score: 0,
};

// ─── Tab Component ────────────────────────────────────

const TABS = [
  { key: "members", label: "党员信息", icon: Users, color: "text-red-500" },
  { key: "activities", label: "组织活动", icon: Calendar, color: "text-amber-500" },
  { key: "studies", label: "学习记录", icon: BookOpen, color: "text-blue-500" },
];

// ─── Page ─────────────────────────────────────────────

export default function PartyAffairsPage() {
  const [activeTab, setActiveTab] = useState("members");

  // Data
  const [members, setMembers] = useState<PartyMember[]>([]);
  const [activities, setActivities] = useState<PartyActivity[]>([]);
  const [studies, setStudies] = useState<PartyStudy[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Member form
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [editingMember, setEditingMember] = useState<PartyMember | null>(null);

  // Activity form
  const [activityForm, setActivityForm] = useState(emptyActivityForm);
  const [editingActivity, setEditingActivity] = useState<PartyActivity | null>(null);

  // Study form
  const [studyForm, setStudyForm] = useState(emptyStudyForm);
  const [editingStudy, setEditingStudy] = useState<PartyStudy | null>(null);

  // Delete
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

  const [saving, setSaving] = useState(false);

  // ─── Fetch ──────────────────────────────────────────

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/party-members");
      if (res.ok) {
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchActivities = useCallback(async () => {
    try {
      const res = await fetch("/api/party-activities");
      if (res.ok) {
        const data = await res.json();
        setActivities(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchStudies = useCallback(async () => {
    try {
      const res = await fetch("/api/party-studies");
      if (res.ok) {
        const data = await res.json();
        setStudies(Array.isArray(data) ? data : data.data ?? []);
      }
    } catch {
      // silent
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchMembers(), fetchActivities(), fetchStudies()]);
    setLoading(false);
  }, [fetchMembers, fetchActivities, fetchStudies]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Save helper ────────────────────────────────────

  const handleSave = async (endpoint: string, form: Record<string, unknown>, editing: { id: string } | null) => {
    setSaving(true);
    try {
      const url = editing ? `${endpoint}?id=${editing.id}` : endpoint;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDialogOpen(false);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (endpoint: string) => {
    if (!deleting) return;
    try {
      const res = await fetch(`${endpoint}?id=${deleting.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteDialogOpen(false);
        setDeleting(null);
        fetchAll();
      }
    } catch {
      // silent
    }
  };

  // ─── Open edit / create ────────────────────────────

  const beginMemberCreate = () => {
    setEditingMember(null);
    setMemberForm(emptyMemberForm);
    setDialogOpen(true);
  };

  const beginMemberEdit = (m: PartyMember) => {
    setEditingMember(m);
    setMemberForm({
      name: m.name,
      gender: m.gender ?? "男",
      birthDate: m.birthDate ? m.birthDate.split("T")[0] : "",
      joinPartyAt: m.joinPartyAt ? m.joinPartyAt.split("T")[0] : "",
      position: m.position ?? "",
      education: m.education ?? "",
      phone: m.phone ?? "",
    });
    setDialogOpen(true);
  };

  const beginActivityCreate = () => {
    setEditingActivity(null);
    setActivityForm(emptyActivityForm);
    setDialogOpen(true);
  };

  const beginActivityEdit = (a: PartyActivity) => {
    setEditingActivity(a);
    setActivityForm({
      title: a.title,
      type: a.type,
      date: a.date.split("T")[0],
      location: a.location ?? "",
      content: a.content ?? "",
    });
    setDialogOpen(true);
  };

  const beginStudyCreate = () => {
    setEditingStudy(null);
    setStudyForm(emptyStudyForm);
    setDialogOpen(true);
  };

  const beginStudyEdit = (s: PartyStudy) => {
    setEditingStudy(s);
    setStudyForm({
      title: s.title,
      date: s.date.split("T")[0],
      duration: s.duration ?? 60,
      content: s.content ?? "",
      score: s.score ?? 0,
    });
    setDialogOpen(true);
  };

  // ─── Render helpers ─────────────────────────────────

  const activityTypeBadge = (t: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
      "三会一课": { label: "三会一课", variant: "default" },
      "主题党日": { label: "主题党日", variant: "secondary" },
      "民主生活会": { label: "民主生活会", variant: "outline" },
    };
    const m = map[t] ?? { label: t, variant: "secondary" };
    return <Badge variant={m.variant}>{m.label}</Badge>;
  };

  const renderFormTitle = () => {
    if (activeTab === "members") return editingMember ? "编辑党员信息" : "添加党员";
    if (activeTab === "activities") return editingActivity ? "编辑活动" : "添加活动";
    return editingStudy ? "编辑学习记录" : "添加学习记录";
  };

  const handleFormSave = async () => {
    if (activeTab === "members") {
      const ok = await handleSave("/api/party-members", memberForm, editingMember);
      if (ok) { setEditingMember(null); setMemberForm(emptyMemberForm); fetchMembers(); }
    } else if (activeTab === "activities") {
      const ok = await handleSave("/api/party-activities", activityForm, editingActivity);
      if (ok) { setEditingActivity(null); setActivityForm(emptyActivityForm); fetchActivities(); }
    } else {
      const ok = await handleSave("/api/party-studies", studyForm, editingStudy);
      if (ok) { setEditingStudy(null); setStudyForm(emptyStudyForm); fetchStudies(); }
    }
  };

  const handleDeleteItem = async () => {
    if (activeTab === "members") await handleDelete("/api/party-members");
    else if (activeTab === "activities") await handleDelete("/api/party-activities");
    else await handleDelete("/api/party-studies");
  };

  const formContent = () => {
    if (activeTab === "members") {
      return (
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mName">姓名</Label>
              <Input id="mName" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} placeholder="姓名" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mGender">性别</Label>
              <Select id="mGender" options={GENDER_OPTIONS} value={memberForm.gender} onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mBirth">出生日期</Label>
              <Input id="mBirth" type="date" value={memberForm.birthDate} onChange={(e) => setMemberForm({ ...memberForm, birthDate: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mJoin">入党日期</Label>
              <Input id="mJoin" type="date" value={memberForm.joinPartyAt} onChange={(e) => setMemberForm({ ...memberForm, joinPartyAt: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mPos">职务</Label>
              <Input id="mPos" value={memberForm.position} onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })} placeholder="党内职务" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mEdu">学历</Label>
              <Select id="mEdu" options={EDUCATION_OPTIONS} value={memberForm.education} onChange={(e) => setMemberForm({ ...memberForm, education: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="mPhone">联系电话</Label>
            <Input id="mPhone" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} placeholder="手机号码" />
          </div>
        </div>
      );
    }
    if (activeTab === "activities") {
      return (
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="aTitle">活动标题</Label>
            <Input id="aTitle" value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} placeholder="请输入活动标题" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="aType">活动类型</Label>
              <Select id="aType" options={ACTIVITY_TYPES} value={activityForm.type} onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="aDate">活动日期</Label>
              <Input id="aDate" type="date" value={activityForm.date} onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="aLocation">活动地点</Label>
            <Input id="aLocation" value={activityForm.location} onChange={(e) => setActivityForm({ ...activityForm, location: e.target.value })} placeholder="活动地点（可选）" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="aContent">活动内容</Label>
            <Textarea id="aContent" value={activityForm.content} onChange={(e) => setActivityForm({ ...activityForm, content: e.target.value })} placeholder="活动内容描述（可选）" rows={4} />
          </div>
        </div>
      );
    }
    // Studies
    return (
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="sTitle">学习主题</Label>
          <Input id="sTitle" value={studyForm.title} onChange={(e) => setStudyForm({ ...studyForm, title: e.target.value })} placeholder="请输入学习主题" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sDate">学习日期</Label>
            <Input id="sDate" type="date" value={studyForm.date} onChange={(e) => setStudyForm({ ...studyForm, date: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sDuration">时长（分钟）</Label>
            <Input id="sDuration" type="number" min={0} value={studyForm.duration} onChange={(e) => setStudyForm({ ...studyForm, duration: Number(e.target.value) })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sScore">考核分数</Label>
            <Input id="sScore" type="number" min={0} max={100} value={studyForm.score} onChange={(e) => setStudyForm({ ...studyForm, score: Number(e.target.value) })} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sContent">学习内容</Label>
          <Textarea id="sContent" value={studyForm.content} onChange={(e) => setStudyForm({ ...studyForm, content: e.target.value })} placeholder="学习内容记录（可选）" rows={4} />
        </div>
      </div>
    );
  };

  // ─── Render table ───────────────────────────────────

  const renderMembersTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>姓名</TableHead>
          <TableHead>性别</TableHead>
          <TableHead>职务</TableHead>
          <TableHead>学历</TableHead>
          <TableHead>入党日期</TableHead>
          <TableHead>联系电话</TableHead>
          <TableHead className="w-[80px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="font-medium">{m.name}</TableCell>
            <TableCell>{m.gender ?? "-"}</TableCell>
            <TableCell>{m.position ?? "-"}</TableCell>
            <TableCell>{m.education ?? "-"}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {m.joinPartyAt ? new Date(m.joinPartyAt).toLocaleDateString("zh-CN") : "-"}
            </TableCell>
            <TableCell>{m.phone ?? "-"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => beginMemberEdit(m)}>
                  <Pencil size={15} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setDeleting({ id: m.id, name: m.name }); setDeleteDialogOpen(true); }}>
                  <Trash2 size={15} className="text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderActivitiesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>活动标题</TableHead>
          <TableHead>类型</TableHead>
          <TableHead>日期</TableHead>
          <TableHead>地点</TableHead>
          <TableHead className="w-[80px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((a) => (
          <TableRow key={a.id}>
            <TableCell className="font-medium">{a.title}</TableCell>
            <TableCell>{activityTypeBadge(a.type)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(a.date).toLocaleDateString("zh-CN")}
            </TableCell>
            <TableCell>{a.location ?? "-"}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => beginActivityEdit(a)}>
                  <Pencil size={15} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setDeleting({ id: a.id, name: a.title }); setDeleteDialogOpen(true); }}>
                  <Trash2 size={15} className="text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderStudiesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>学习主题</TableHead>
          <TableHead>日期</TableHead>
          <TableHead>时长</TableHead>
          <TableHead>分数</TableHead>
          <TableHead className="w-[80px]">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {studies.map((s) => (
          <TableRow key={s.id}>
            <TableCell className="font-medium">{s.title}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(s.date).toLocaleDateString("zh-CN")}
            </TableCell>
            <TableCell>{s.duration ? `${s.duration}分钟` : "-"}</TableCell>
            <TableCell>
              {s.score != null ? (
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500" />
                  {s.score}
                </span>
              ) : "-"}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => beginStudyEdit(s)}>
                  <Pencil size={15} />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => { setDeleting({ id: s.id, name: s.title }); setDeleteDialogOpen(true); }}>
                  <Trash2 size={15} className="text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  // ─── Summary stats ──────────────────────────────────

  const renderStats = () => {
    if (activeTab === "members") {
      return (
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-muted-foreground" />
            <span>共计 <strong>{members.length}</strong> 人</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone size={14} className="text-muted-foreground" />
            <span>有联系方式 <strong>{members.filter((m) => m.phone).length}</strong> 人</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap size={14} className="text-muted-foreground" />
            <span>大专以上 <strong>{members.filter((m) => m.education && ["大专", "本科", "硕士", "博士"].includes(m.education)).length}</strong> 人</span>
          </div>
        </div>
      );
    }
    if (activeTab === "activities") {
      const typeCount: Record<string, number> = {};
      activities.forEach((a) => { typeCount[a.type] = (typeCount[a.type] || 0) + 1; });
      return (
        <div className="flex items-center gap-4 text-sm">
          <span>共计 <strong>{activities.length}</strong> 次活动</span>
          {Object.entries(typeCount).map(([t, c]) => (
            <span key={t} className="text-muted-foreground">
              {t}: <strong>{c}</strong>
            </span>
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-4 text-sm">
        <span>共计 <strong>{studies.length}</strong> 次学习</span>
        {studies.length > 0 && (
          <>
            <span className="text-muted-foreground">
              平均分: <strong>{Math.round(studies.reduce((s, st) => s + (st.score ?? 0), 0) / studies.length)}</strong>
            </span>
            <span className="text-muted-foreground">
              总时长: <strong>{studies.reduce((s, st) => s + (st.duration ?? 0), 0)}</strong> 分钟
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              if (activeTab === "members") beginMemberCreate();
              else if (activeTab === "activities") beginActivityCreate();
              else beginStudyCreate();
            }}>
              <Plus size={16} className="mr-1.5" />
              新建
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{renderFormTitle()}</DialogTitle>
            </DialogHeader>
            {formContent()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleFormSave} disabled={saving || (activeTab === "members" ? !memberForm.name : activeTab === "activities" ? !activityForm.title : !studyForm.title)}>
                {saving && <Loader2 size={16} className="mr-1.5 animate-spin" />}
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-mac-lg border bg-card p-1 shadow-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-mac px-4 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Stats row */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{TABS.find((t) => t.key === activeTab)?.label}</CardTitle>
          <CardDescription>{renderStats()}</CardDescription>
        </CardHeader>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : activeTab === "members" ? (
            members.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">暂无党员信息</div>
            ) : renderMembersTable()
          ) : activeTab === "activities" ? (
            activities.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">暂无活动记录</div>
            ) : renderActivitiesTable()
          ) : (
            studies.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">暂无学习记录</div>
            ) : renderStudiesTable()
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
            确定要删除「{deleting?.name}」吗？此操作不可撤销。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
