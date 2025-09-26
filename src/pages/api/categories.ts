// pages/api/categories.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { createdAt: "asc" },
      });
      return res.status(200).json(categories);
    } catch (err) {
      console.error("Categories API error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
