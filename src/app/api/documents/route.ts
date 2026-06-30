import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { apiSuccess, apiError, requireAuth, handlePrismaError } from "@/lib/api-helpers";

const BUCKET_NAME = "documents";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
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

async function uploadFile(file: File): Promise<{ url: string; size: number }> {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return { url: urlData.publicUrl, size: file.size };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const contentType = request.headers.get("content-type") || "";

    let title: string;
    let category: string;
    let content: string;
    let version: string;
    let status: string;
    let fileUrl: string | null = null;
    let fileSize: number | null = null;

    if (contentType.includes("multipart/form-data")) {
      // ——— FormData mode (includes file) ———
      const formData = await request.formData();
      title = (formData.get("title") as string) || "";
      category = (formData.get("category") as string) || "管理制度";
      content = (formData.get("content") as string) || "";
      version = (formData.get("version") as string) || "v1.0";
      status = (formData.get("status") as string) || "draft";

      const file = formData.get("file") as File | null;
      if (file && file.size > 0) {
        if (file.size > 50 * 1024 * 1024) {
          return apiError(new Error("文件大小不能超过 50MB"), 400);
        }
        const result = await uploadFile(file);
        fileUrl = result.url;
        fileSize = result.size;
      }
    } else {
      // ——— JSON mode (no file) ———
      const body = await request.json();
      title = body.title;
      category = body.category ?? "管理制度";
      content = body.content ?? "";
      version = body.version ?? "v1.0";
      status = body.status ?? "draft";
      fileUrl = body.fileUrl || null;
      fileSize = body.fileSize || null;
    }

    const document = await prisma.document.create({
      data: {
        title,
        category,
        content,
        version,
        status,
        fileUrl,
        fileSize,
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
    await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError(new Error("缺少 id 参数"), 400);

    const contentType = request.headers.get("content-type") || "";

    let title: string | undefined;
    let category: string | undefined;
    let content: string | undefined;
    let version: string | undefined;
    let status: string | undefined;
    let fileUrl: string | null | undefined;
    let fileSize: number | null | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = (formData.get("title") as string) || undefined;
      category = (formData.get("category") as string) || undefined;
      content = (formData.get("content") as string) || undefined;
      version = (formData.get("version") as string) || undefined;
      status = (formData.get("status") as string) || undefined;

      const file = formData.get("file") as File | null;
      const keepFile = formData.get("keepFile") as string | null;

      if (keepFile === "true") {
        // Keep existing file — don't change fileUrl/fileSize
        fileUrl = undefined;
        fileSize = undefined;
      } else if (file && file.size > 0) {
        if (file.size > 50 * 1024 * 1024) {
          return apiError(new Error("文件大小不能超过 50MB"), 400);
        }
        const result = await uploadFile(file);
        fileUrl = result.url;
        fileSize = result.size;
      } else {
        // Remove file
        fileUrl = null;
        fileSize = null;
      }
    } else {
      const body = await request.json();
      title = body.title;
      category = body.category;
      content = body.content;
      version = body.version;
      status = body.status;
      fileUrl = body.fileUrl !== undefined ? body.fileUrl || null : undefined;
      fileSize = body.fileSize !== undefined ? body.fileSize || null : undefined;
    }

    const data: Record<string, unknown> = {};
    if (title !== undefined) data.title = title;
    if (category !== undefined) data.category = category;
    if (content !== undefined) data.content = content;
    if (version !== undefined) data.version = version;
    if (status !== undefined) data.status = status;
    if (fileUrl !== undefined) data.fileUrl = fileUrl;
    if (fileSize !== undefined) data.fileSize = fileSize;

    const document = await prisma.document.update({
      where: { id },
      data,
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    return apiSuccess(document);
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

    await prisma.document.delete({ where: { id } });
    return apiSuccess({ message: "删除成功" });
  } catch (e) {
    return handlePrismaError(e);
  }
}
