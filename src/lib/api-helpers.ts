import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";

export function apiError(error: unknown, status = 500) {
  console.error(error);
  const message = error instanceof Error ? error.message : "服务器内部错误";
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function requireAuth() {
  // Method 1: Use getToken — reads JWT directly from cookie, most reliable
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const token = await getToken({
      req: {
        headers: { cookie: cookieHeader } as Record<string, string>,
      },
    });
    if (token?.sub) {
      return {
        id: token.sub,
        name: token.name ?? "",
        email: token.email ?? "",
        role: (token as any).role ?? "user",
      };
    }
  } catch {
    // fall through to auth()
  }

  // Method 2: Use NextAuth auth() as fallback
  try {
    const session = await auth();
    if (session?.user?.id) {
      return session.user;
    }
  } catch {
    // fall through to error
  }

  throw new Error("未登录");
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
