import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { comparePassword, signAccessToken, signRefreshToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await comparePassword(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = await signAccessToken({ id: user.id, email: user.email });
    const refreshToken = await signRefreshToken({ id: user.id });

    return res.status(200).json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    console.error("LOGIN API ERROR:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
