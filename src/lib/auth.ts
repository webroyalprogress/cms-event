import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const { email, password } = credentials as {
          email: string
          password: string
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
