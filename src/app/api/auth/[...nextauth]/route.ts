import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// NextAuth handler
const authHandler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // pastikan credentials ada
        if (!credentials?.email || !credentials?.password) return null;

        // destructure dengan tipe agar TypeScript yakin ini string
        const { email, password } = credentials as { email: string; password: string };

        // ambil user dari DB
        const user = await prisma.user.findUnique({
          where: { email },
        });
        if (!user) return null;

        // cek password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // return user object (NextAuth user)
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login", // redirect ke login kalau belum signin
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// export handler sebagai GET dan POST
export { authHandler as GET, authHandler as POST };
