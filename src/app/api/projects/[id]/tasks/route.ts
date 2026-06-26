import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, requireAuth, handlePrismaError } from "@/lib/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");

    if (taskId) {
      const task = await prisma.task.findFirst({
        where: { id: taskId, projectId: id },
        include: { assignee: { select: { id: true, name: true, email: true } } },
      });
      if (!task) {
        return apiError(new Error("记录不存在"), 404);
      }
      return apiSuccess(task);
    }

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const where: Record<string, unknown> = { projectId: id };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(tasks);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status ?? "todo",
        priority: body.priority ?? "medium",
        assigneeId: body.assigneeId,
        projectId: id,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(task, 201);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");
    if (!taskId) return apiError(new Error("缺少 id 参数"), 400);

    const body = await request.json();
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.assigneeId !== undefined && { assigneeId: body.assigneeId }),
        ...(body.dueDate !== undefined && { dueDate: new Date(body.dueDate) }),
      },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(task);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");
    if (!taskId) return apiError(new Error("缺少 id 参数"), 400);

    await prisma.task.delete({ where: { id: taskId } });
    return apiSuccess({ message: "删除成功" });
  } catch (e) {
    return handlePrismaError(e);
  }
}
