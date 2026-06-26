import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@rollingsg.cn" },
    update: {},
    create: {
      name: "管理员",
      email: "admin@rollingsg.cn",
      password: await bcrypt.hash("admin123", 10),
      role: "admin",
    },
  });

  console.log("✔ 管理员账号已创建:", admin.email);

  await prisma.user.upsert({
    where: { email: "zhang@rollingsg.cn" },
    update: {},
    create: {
      name: "张工",
      email: "zhang@rollingsg.cn",
      password: await bcrypt.hash("zhang123", 10),
      role: "user",
    },
  });

  await prisma.user.upsert({
    where: { email: "li@rollingsg.cn" },
    update: {},
    create: {
      name: "李工",
      email: "li@rollingsg.cn",
      password: await bcrypt.hash("li123", 10),
      role: "user",
    },
  });

  console.log("✔ 测试用户已创建");
}

main()
  .catch((e) => {
    console.error("Seed 失败:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
