// src/pages/api/auth/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { parseCookies, verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = parseCookies(req);
  const access = cookies["access_token"];
  if (!access) return res.status(401).json({ message: "No token" });

  try {
    const decoded = await verifyAccessToken(access);
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
      select: { id: true, email: true, name: true },
    });
    if (!user) return res.status(401).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
}
