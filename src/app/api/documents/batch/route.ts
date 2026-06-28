import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import { apiSuccess, apiError, requireAuth, handlePrismaError } from "@/lib/api-helpers";

const BUCKET_NAME = "documents";

async function uploadFile(file: File): Promise<{ url: string; size: number; name: string }> {
  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET_NAME)) {
    await supabase.storage.createBucket(BUCKET_NAME, { public: true });
  }

  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) throw new Error(`存储上传失败: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  return { url: urlData.publicUrl, size: file.size, name: file.name };
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const category = (formData.get("category") as string) || "管理制度";
    const version = (formData.get("version") as string) || "v1.0";
    const status = (formData.get("status") as string) || "draft";

    if (!files.length) {
      return apiError(new Error("请选择要上传的文件"), 400);
    }

    // Validate all files first
    for (const file of files) {
      if (!file.name) {
        return apiError(new Error("存在无文件名的文件"), 400);
      }
      if (file.size > 50 * 1024 * 1024) {
        return apiError(new Error(`"${file.name}" 超过 50MB 大小限制`), 400);
      }
    }

    // Upload all files and create documents in parallel
    const results = await Promise.allSettled(
      files.map(async (file) => {
        const title = file.name.replace(/\.[^.]+$/, "");
        const { url, size } = await uploadFile(file);

        return prisma.document.create({
          data: {
            title,
            category,
            content: "",
            version,
            status,
            fileUrl: url,
            fileSize: size,
            authorId: user.id!,
          },
          select: { id: true, title: true, fileUrl: true, fileSize: true, category: true, status: true, createdAt: true },
        });
      })
    );

    const succeeded: unknown[] = [];
    const failed: { fileName: string; error: string }[] = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        succeeded.push(result.value);
      } else {
        failed.push({
          fileName: files[i].name,
          error: result.reason?.message || "未知错误",
        });
      }
    });

    return apiSuccess(
      {
        total: files.length,
        successCount: succeeded.length,
        failCount: failed.length,
        succeeded,
        failed,
      },
      201
    );
  } catch (e) {
    return handlePrismaError(e);
  }
}
