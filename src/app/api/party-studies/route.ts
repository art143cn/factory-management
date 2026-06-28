import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, requireAuth, handlePrismaError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const study = await prisma.partyStudy.findUnique({
        where: { id },
        include: { member: { include: { user: { select: { id: true, name: true, email: true } } } } },
      });
      if (!study) {
        return apiError(new Error("记录不存在"), 404);
      }
      return apiSuccess(study);
    }

    const memberId = searchParams.get("memberId");
    const where: Record<string, unknown> = {};
    if (memberId) where.memberId = memberId;

    const studies = await prisma.partyStudy.findMany({
      where,
      orderBy: { date: "desc" },
      include: { member: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    return apiSuccess(studies);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const body = await request.json();
    const study = await prisma.partyStudy.create({
      data: {
        title: body.title,
        date: new Date(body.date),
        duration: body.duration,
        content: body.content,
        score: body.score,
        memberId: body.memberId,
      },
      include: { member: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    return apiSuccess(study, 201);
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
    const study = await prisma.partyStudy.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.score !== undefined && { score: body.score }),
        ...(body.memberId !== undefined && { memberId: body.memberId }),
      },
      include: { member: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });
    return apiSuccess(study);
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

    await prisma.partyStudy.delete({ where: { id } });
    return apiSuccess({ message: "删除成功" });
  } catch (e) {
    return handlePrismaError(e);
  }
}
