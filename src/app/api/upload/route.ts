import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAuth } from "@/lib/api-helpers";

const BUCKET_NAME = "documents";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过 50MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      if (error.message?.includes("bucket") || error.message?.includes("not found")) {
        return NextResponse.json(
          {
            error:
              `存储桶 "${BUCKET_NAME}" 不存在。请在 Supabase Dashboard > Storage 中手动创建名为 "${BUCKET_NAME}" 的公开存储桶，然后重试。`,
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: urlData.publicUrl,
      name: file.name,
      size: file.size,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "上传失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
