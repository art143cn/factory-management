import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, requireAuth, handlePrismaError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const activity = await prisma.partyActivity.findUnique({
        where: { id },
        include: { member: { include: { user: { select: { id: true, name: true, email: true } } } } },
      });
      if (!activity) {
        return apiError(new Error("记录不存在"), 404);
      }
      return apiSuccess(activity);
    }

    const type = searchParams.get("type");
    const memberId = searchParams.get("memberId");
    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (memberId) where.memberId = memberId;

    const activities = await prisma.partyActivity.findMany({
      where,
      orderBy: { date: "desc" },
      include: { member: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    return apiSuccess(activities);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const activity = await prisma.partyActivity.create({
      data: {
        title: body.title,
        type: body.type,
        date: new Date(body.date),
        location: body.location,
        content: body.content,
        memberId: body.memberId,
      },
      include: { member: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    return apiSuccess(activity, 201);
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
    const activity = await prisma.partyActivity.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.memberId !== undefined && { memberId: body.memberId }),
      },
      include: { member: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    return apiSuccess(activity);
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

    await prisma.partyActivity.delete({ where: { id } });
    return apiSuccess({ message: "删除成功" });
  } catch (e) {
    return handlePrismaError(e);
  }
}
