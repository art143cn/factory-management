import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://lkqjzquymzfetfarzixv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcWp6cXV5bXpmZXRmYXJ6aXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NDIzMDMsImV4cCI6MjA5ODAxODMwM30.l5Xi6zBRyc-PXFHsIpOUitKqr3mu2wiRutEG426Gga8"
);

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

        try {
          const { data, error } = await supabase
            .from("User")
            .select("id, name, email, password, role")
            .eq("email", credentials.email as string)
            .single();

          if (error || !data) return null;

          const isValid = await bcrypt.compare(
            credentials.password as string,
            data.password
          );
          if (!isValid) return null;

          return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role ?? "user",
          };
        } catch {
          return null;
        }
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
