// pages/api/external/products/category/[slug].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth Bearer Token
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

    const category = await prisma.category.findUnique({ where: { slug } });

    if (!category) return res.status(404).json({ error: "Category not found" });

    const products = await prisma.product.findMany({
      where: { categoryId: category.id },
      include: {
        category: true,
        events: { include: { event: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // FIX: kasih tipe aman biar p tidak any
    const data = products.map((p: typeof products[number]) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      description: p.description,
      slug: p.slug,
      createdAt: p.createdAt,
      // updatedAt: p.updatedAt,
      image: p.image,
      excerpt: p.excerpt,
      categorySlug: p.category?.slug ?? null,
      events: p.events,
    }));

    return res.status(200).json(data);
  } catch (err) {
    console.error("Products by category API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
