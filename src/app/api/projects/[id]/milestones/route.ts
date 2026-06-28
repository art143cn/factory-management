import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, requireAuth, handlePrismaError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("id");

    if (milestoneId) {
      const milestone = await prisma.milestone.findFirst({
        where: { id: milestoneId, projectId: id },
      });
      if (!milestone) {
        return apiError(new Error("记录不存在"), 404);
      }
      return apiSuccess(milestone);
    }

    const status = searchParams.get("status");
    const where: Record<string, unknown> = { projectId: id };
    if (status) where.status = status;

    const milestones = await prisma.milestone.findMany({
      where,
      orderBy: { targetDate: "asc" },
    });
    return apiSuccess(milestones);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const milestone = await prisma.milestone.create({
      data: {
        name: body.name,
        description: body.description,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
        completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
        status: body.status ?? "pending",
        projectId: id,
      },
    });
    return apiSuccess(milestone, 201);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("id");
    if (!milestoneId) return apiError(new Error("缺少 id 参数"), 400);

    const body = await request.json();
    const milestone = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.targetDate !== undefined && { targetDate: new Date(body.targetDate) }),
        ...(body.completedAt !== undefined && { completedAt: new Date(body.completedAt) }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });
    return apiSuccess(milestone);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const milestoneId = searchParams.get("id");
    if (!milestoneId) return apiError(new Error("缺少 id 参数"), 400);

    await prisma.milestone.delete({ where: { id: milestoneId } });
    return apiSuccess({ message: "删除成功" });
  } catch (e) {
    return handlePrismaError(e);
  }
}
