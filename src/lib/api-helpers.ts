import { NextRequest, NextResponse } from "next/server";
import { jwtDecrypt } from "jose";

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

  // Read session cookie directly from request headers
  const cookieHeader = request.headers.get("cookie") || "";
  let sessionToken = "";

  for (const cookie of cookieHeader.split("; ")) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith("__Secure-next-auth.session-token=")) {
      sessionToken = trimmed.slice("__Secure-next-auth.session-token=".length);
      break;
    }
    if (trimmed.startsWith("next-auth.session-token=")) {
      sessionToken = trimmed.slice("next-auth.session-token=".length);
      break;
    }
  }

  if (!sessionToken) {
    console.error("No session cookie found in request headers. Cookie header:", cookieHeader.substring(0, 100));
    throw new Error("未登录");
  }

  try {
    // NextAuth v5 encrypts the JWT as a JWE (dir key management)
    // The key is SHA-256 hash of NEXTAUTH_SECRET
    const secret = process.env.NEXTAUTH_SECRET || "";
    if (!secret) {
      console.error("NEXTAUTH_SECRET not set");
      throw new Error("未登录");
    }

    const keyBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
    const key = new Uint8Array(keyBytes);

    const { payload } = await jwtDecrypt(sessionToken, key);
    return {
      id: (payload.sub as string) || "",
      name: (payload.name as string) || "",
      email: (payload.email as string) || "",
      role: (payload.role as string) || "user",
    };
  } catch (e) {
    console.error("JWT decryption failed:", e);
    throw new Error("未登录");
  }
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
