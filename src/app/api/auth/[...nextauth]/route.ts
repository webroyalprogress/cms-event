import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const GET = (req: Request) => NextAuth(authOptions)(req);
export const POST = (req: Request) => NextAuth(authOptions)(req);
