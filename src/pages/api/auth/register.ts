// src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: "Email already used" });

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, name, password: hashed },
    select: { id: true, email: true, name: true },
  });

  res.status(201).json({ user });
}
