import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({ take: 5 });
  console.log("用户数量:", users.length);
  users.forEach((u) => console.log(u.email, u.role));
  await prisma.$disconnect();
}
main();
