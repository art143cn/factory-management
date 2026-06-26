import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, requireAuth, handlePrismaError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const performance = await prisma.performance.findUnique({
        where: { id },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      if (!performance) {
        return apiError(new Error("记录不存在"), 404);
      }
      return apiSuccess(performance);
    }

    const userId = searchParams.get("userId");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const status = searchParams.get("status");
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (year) where.year = parseInt(year, 10);
    if (month) where.month = parseInt(month, 10);
    if (status) where.status = status;

    const performances = await prisma.performance.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "desc" }],
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(performances);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const performance = await prisma.performance.create({
      data: {
        userId: body.userId ?? user.id,
        year: body.year,
        month: body.month,
        score: body.score ?? 0,
        kpis: body.kpis,
        comment: body.comment,
        status: body.status ?? "draft",
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(performance, 201);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError(new Error("缺少 id 参数"), 400);

    const body = await request.json();
    const performance = await prisma.performance.update({
      where: { id },
      data: {
        ...(body.userId !== undefined && { userId: body.userId }),
        ...(body.year !== undefined && { year: body.year }),
        ...(body.month !== undefined && { month: body.month }),
        ...(body.score !== undefined && { score: body.score }),
        ...(body.kpis !== undefined && { kpis: body.kpis }),
        ...(body.comment !== undefined && { comment: body.comment }),
        ...(body.status !== undefined && { status: body.status }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(performance);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError(new Error("缺少 id 参数"), 400);

    await prisma.performance.delete({ where: { id } });
    return apiSuccess({ message: "删除成功" });
  } catch (e) {
    return handlePrismaError(e);
  }
}
