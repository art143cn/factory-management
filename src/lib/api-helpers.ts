import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";

export function apiError(error: unknown, status = 500) {
  console.error(error);
  const message = error instanceof Error ? error.message : "服务器内部错误";
  return NextResponse.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export async function requireAuth(request?: NextRequest) {
  if (!request) throw new Error("未登录");

  // Use getToken with explicit secureCookie=true and secret.
  // secureCookie MUST be true on Vercel (HTTPS gives __Secure- cookie prefix).
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: true,
    });
    if (token?.sub) {
      return {
        id: token.sub,
        name: token.name ?? "",
        email: token.email ?? "",
        role: (token as any).role ?? "user",
      };
    }
  } catch (e) {
    console.error("getToken with secureCookie failed:", e);
  }

  // Fallback: try without secureCookie (e.g. localhost dev)
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: false,
    });
    if (token?.sub) {
      return {
        id: token.sub,
        name: token.name ?? "",
        email: token.email ?? "",
        role: (token as any).role ?? "user",
      };
    }
  } catch (e) {
    console.error("getToken without secureCookie failed:", e);
  }

  // Last resort: NextAuth auth()
  try {
    const session = await auth();
    if (session?.user?.id) {
      return session.user;
    }
  } catch (e) {
    console.error("auth() failed:", e);
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
