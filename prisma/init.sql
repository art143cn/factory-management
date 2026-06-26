-- 厂务管理系统 - 数据库初始化脚本
-- 在 Supabase SQL Editor 中运行此脚本

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 用户表
CREATE TABLE "User" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    avatar TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 文档表
CREATE TABLE "Document" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT 'v1.0',
    status TEXT NOT NULL DEFAULT 'draft',
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "authorId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 项目表
CREATE TABLE "Project" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    priority TEXT NOT NULL DEFAULT 'medium',
    "startDate" TIMESTAMPTZ,
    "endDate" TIMESTAMPTZ,
    progress INTEGER NOT NULL DEFAULT 0,
    "managerId" TEXT NOT NULL REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 任务表
CREATE TABLE "Task" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    "assigneeId" TEXT NOT NULL REFERENCES "User"(id),
    "projectId" TEXT NOT NULL REFERENCES "Project"(id),
    "dueDate" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 里程碑表
CREATE TABLE "Milestone" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    "targetDate" TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending',
    "projectId" TEXT NOT NULL REFERENCES "Project"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 党员表
CREATE TABLE "PartyMember" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    gender TEXT,
    "birthDate" TIMESTAMPTZ,
    "joinPartyAt" TIMESTAMPTZ,
    position TEXT,
    education TEXT,
    phone TEXT,
    "userId" TEXT NOT NULL UNIQUE REFERENCES "User"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 党务活动表
CREATE TABLE "PartyActivity" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    location TEXT,
    content TEXT,
    "memberId" TEXT NOT NULL REFERENCES "PartyMember"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 学习记录表
CREATE TABLE "PartyStudy" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    duration INTEGER,
    content TEXT,
    score INTEGER,
    "memberId" TEXT NOT NULL REFERENCES "PartyMember"(id),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 绩效表
CREATE TABLE "Performance" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    score DOUBLE PRECISION NOT NULL DEFAULT 0,
    kpis JSONB,
    comment TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
