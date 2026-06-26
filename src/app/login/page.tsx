"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setLocalError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLocalError("邮箱或密码错误，请重试");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm shadow-mac-lg">
      <CardHeader className="items-center text-center pb-2">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-mac-xl bg-primary font-bold text-primary-foreground text-lg">
          厂
        </div>
        <CardTitle className="text-xl">厂务管理系统</CardTitle>
        <CardDescription>请登录您的账号</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(error || localError) && (
            <div className="rounded-mac bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {localError || "登录失败，请重试"}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              邮箱 / 工号
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱或工号"
              className="w-full rounded-mac border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full rounded-mac border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "登录中..." : "登 录"}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            测试账号：admin@rollingsg.cn / admin123
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-gray-100 p-4">
      <Suspense fallback={<div className="text-muted-foreground">加载中...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
