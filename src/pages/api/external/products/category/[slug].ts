// pages/api/external/products/category/[slug].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 🔒 Auth pakai Bearer Token
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const isValid = await bcrypt.compare(token, process.env.API_BEARER_TOKEN_HASH!);
  if (!isValid) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { slug } = req.query;
    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Category slug required" });
    }

    // Cari category berdasarkan slug
    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) return res.status(404).json({ error: "Category not found" });

    // Cari produk berdasarkan categoryId
    const products = await prisma.product.findMany({
      where: { categoryId: category.id },
      include: {
        category: true,
        events: { include: { event: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format response biar mirip API external product
    const data = products.map((p) => ({
      ...p,
      categoryId: undefined, // jangan expose id
      categorySlug: p.category?.slug || null,
    }));

    return res.status(200).json(data);
  } catch (err) {
    console.error("Products by category API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
