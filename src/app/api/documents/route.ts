import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, requireAuth, handlePrismaError } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const document = await prisma.document.findUnique({
        where: { id },
        include: { author: { select: { id: true, name: true, email: true } } },
      });
      if (!document) {
        return apiError(new Error("记录不存在"), 404);
      }
      return apiSuccess(document);
    }

    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(documents);
  } catch (e) {
    return handlePrismaError(e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const document = await prisma.document.create({
      data: {
        title: body.title,
        category: body.category,
        content: body.content,
        version: body.version ?? "v1.0",
        status: body.status ?? "draft",
        fileUrl: body.fileUrl,
        fileSize: body.fileSize,
        authorId: user.id!,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(document, 201);
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
    const document = await prisma.document.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.version !== undefined && { version: body.version }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.fileUrl !== undefined && { fileUrl: body.fileUrl }),
        ...(body.fileSize !== undefined && { fileSize: body.fileSize }),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(document);
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

    await prisma.document.delete({ where: { id } });
    return apiSuccess({ message: "删除成功" });
  } catch (e) {
    return handlePrismaError(e);
  }
}
