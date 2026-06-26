import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, requireAuth, handlePrismaError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const member = await prisma.partyMember.findUnique({
        where: { id },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      if (!member) {
        return apiError(new Error("记录不存在"), 404);
      }
      return apiSuccess(member);
    }

    const gender = searchParams.get("gender");
    const position = searchParams.get("position");
    const where: Record<string, unknown> = {};
    if (gender) where.gender = gender;
    if (position) where.position = position;

    const members = await prisma.partyMember.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(members);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const member = await prisma.partyMember.create({
      data: {
        name: body.name,
        gender: body.gender,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        joinPartyAt: body.joinPartyAt ? new Date(body.joinPartyAt) : undefined,
        position: body.position,
        education: body.education,
        phone: body.phone,
        userId: body.userId,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(member, 201);
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
    const member = await prisma.partyMember.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.birthDate !== undefined && { birthDate: new Date(body.birthDate) }),
        ...(body.joinPartyAt !== undefined && { joinPartyAt: new Date(body.joinPartyAt) }),
        ...(body.position !== undefined && { position: body.position }),
        ...(body.education !== undefined && { education: body.education }),
        ...(body.phone !== undefined && { phone: body.phone }),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(member);
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

    await prisma.partyMember.delete({ where: { id } });
    return apiSuccess({ message: "删除成功" });
  } catch (e) {
    return handlePrismaError(e);
  }
}
