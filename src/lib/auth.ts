import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // pastiin ada input
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = String(credentials.email)
        const password = String(credentials.password)

        // cari user di database
        const user = await prisma.user.findUnique({
          where: { email }, // sudah pasti string
        })

        if (!user) return null

        // cek password
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? undefined,
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id
      return token
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user = {
          ...session.user,
          id: token.id as string,
        }
      }
      return session
    },
  },
} satisfies Parameters<typeof NextAuth>[0]
