import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, requireAuth, handlePrismaError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const project = await prisma.project.findUnique({
        where: { id },
        include: { manager: { select: { id: true, name: true, email: true } } },
      });
      if (!project) {
        return apiError(new Error("记录不存在"), 404);
      }
      return apiSuccess(project);
    }

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const projects = await prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { manager: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(projects);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        status: body.status ?? "pending",
        priority: body.priority ?? "medium",
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        progress: body.progress ?? 0,
        managerId: user.id!,
      },
      include: { manager: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(project, 201);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError(new Error("缺少 id 参数"), 400);

    const body = await request.json();
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: new Date(body.endDate) }),
        ...(body.progress !== undefined && { progress: body.progress }),
      },
      include: { manager: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(project);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError(new Error("缺少 id 参数"), 400);

    await prisma.project.delete({ where: { id } });
    return apiSuccess({ message: "删除成功" });
  } catch (e) {
    return handlePrismaError(e);
  }
}
