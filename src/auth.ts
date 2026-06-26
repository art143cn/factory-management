import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// 临时用户数据 — 后续可接入数据库
const users = [
  {
    id: "1",
    name: "管理员",
    email: "admin@rollingsg.cn",
    password: bcrypt.hashSync("admin123", 10),
    role: "admin" as const,
  },
  {
    id: "2",
    name: "张工",
    email: "zhang@rollingsg.cn",
    password: bcrypt.hashSync("zhang123", 10),
    role: "user" as const,
  },
  {
    id: "3",
    name: "李工",
    email: "li@rollingsg.cn",
    password: bcrypt.hashSync("li123", 10),
    role: "user" as const,
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱 / 工号", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = users.find((u) => u.email === credentials.email);
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
