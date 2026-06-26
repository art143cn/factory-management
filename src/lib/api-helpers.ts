import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { auth } from "@/auth";

export function apiError(error: unknown, status = 500) {
  console.error(error);
  const message = error instanceof Error ? error.message : "服务器内部错误";
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("未登录");
  }
  return session.user;
}

export function handlePrismaError(error: unknown) {
  if (error instanceof Error && "code" in error) {
    const prismaError = error as { code: string; meta?: { target?: string[] } };
    if (prismaError.code === "P2025") {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 });
    }
    if (prismaError.code === "P2002") {
      return NextResponse.json(
        { error: "数据冲突，该记录已存在" },
        { status: 409 }
      );
    }
  }
  return apiError(error);
}
