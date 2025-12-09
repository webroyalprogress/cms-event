// pages/api/external/products.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import slugify from "slugify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Auth Bearer Token
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const isValid = await bcrypt.compare(token, process.env.API_BEARER_TOKEN_HASH!);
  if (!isValid) return res.status(401).json({ error: "Unauthorized" });

  try {
    switch (req.method) {
      // =======================
      // GET Products
      // =======================
      case "GET": {
        const { id, slug } = req.query;

        if (id) {
          const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
              category: true,
              events: { include: { event: true } },
            },
          });
          if (!product) return res.status(404).json({ error: "Product not found" });

          return res.status(200).json({
            ...product,
            categoryId: undefined,
            categorySlug: product.category?.slug || null,
          });
        }

        if (slug) {
          const product = await prisma.product.findUnique({
            where: { slug: String(slug) },
            include: {
              category: true,
              events: { include: { event: true } },
            },
          });
          if (!product) return res.status(404).json({ error: "Product not found" });

          return res.status(200).json({
            ...product,
            categoryId: undefined,
            categorySlug: product.category?.slug || null,
          });
        }

        // Fetch all products
        const products = await prisma.product.findMany({
          include: {
            category: true,
            events: { include: { event: true } },
          },
          orderBy: { createdAt: "desc" },
        });

        // ⭐ FIX: add type annotation here
        const formatted = products.map((p: typeof products[number]) => ({
          ...p,
          categoryId: undefined,
          categorySlug: p.category?.slug ?? null,
        }));

        return res.status(200).json(formatted);
      }

      // =======================
      // CREATE Product
      // =======================
      case "POST": {
        const { name, price, description, image, categorySlug } = req.body;

        if (!name || price == null || !description || !image || !categorySlug) {
          return res.status(400).json({
            error: "Name, price, description, image, and categorySlug are required",
          });
        }

        const category = await prisma.category.findUnique({
          where: { slug: categorySlug },
        });
        if (!category) {
          return res.status(400).json({ error: "Invalid category slug" });
        }

        const slug = slugify(name, { lower: true, strict: true });

        const product = await prisma.product.create({
          data: {
            name,
            price: Number(price),
            description,
            image,
            slug,
            excerpt: description.slice(0, 100),
            categoryId: category.id,
          },
          include: { category: true },
        });

        return res.status(201).json({
          ...product,
          categoryId: undefined,
          categorySlug: product.category.slug,
        });
      }

      // =======================
      // UPDATE Product
      // =======================
      case "PUT": {
        const { id, name, price, description, image, categorySlug } = req.body;

        if (!id || !name || price == null || !description || !image || !categorySlug) {
          return res.status(400).json({
            error: "ID, name, price, description, image, and categorySlug are required",
          });
        }

        const category = await prisma.category.findUnique({
          where: { slug: categorySlug },
        });
        if (!category) {
          return res.status(400).json({ error: "Invalid category slug" });
        }

        const slug = slugify(name, { lower: true, strict: true });

        const product = await prisma.product.update({
          where: { id: Number(id) },
          data: {
            name,
            price: Number(price),
            description,
            image,
            slug,
            excerpt: description.slice(0, 100),
            categoryId: category.id,
          },
          include: { category: true },
        });

        return res.status(200).json({
          ...product,
          categoryId: undefined,
          categorySlug: product.category.slug,
        });
      }

      // =======================
      // DELETE Product
      // =======================
      case "DELETE": {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "ID required" });

        const productId = Array.isArray(id) ? Number(id[0]) : Number(id);
        if (isNaN(productId)) return res.status(400).json({ error: "Invalid ID" });

        await prisma.product.delete({ where: { id: productId } });
        return res.status(200).json({ message: "Product deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error("Products API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
