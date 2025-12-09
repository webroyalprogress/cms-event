// src/pages/api/products.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";
import { verifyAccessToken } from "@/lib/auth";

// ===== Helper Auth =====
async function checkAuth(req: NextApiRequest) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = header.split(" ")[1];

  try {
    return await verifyAccessToken(token);
  } catch {
    throw new Error("Unauthorized");
  }
}

// ===== Helper: Remove sensitive fields =====
function sanitizeProduct(product: any) {
  const { categoryId, ...rest } = product;
  return {
    ...rest,
    categorySlug: product.category?.slug || null,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 🔐 Wajib pakai token
    await checkAuth(req);

    switch (req.method) {
      // =====================================
      // GET ALL PRODUCTS
      // =====================================
      case "GET": {
        const products = await prisma.product.findMany({
          include: { category: true },
          orderBy: { createdAt: "desc" },
        });

        return res.status(200).json(products.map(sanitizeProduct));
      }

      // =====================================
      // CREATE PRODUCT
      // =====================================
      case "POST": {
        const { name, price, description, image, categorySlug } = req.body;

        if (!name || price == null || !description || !categorySlug) {
          return res.status(400).json({
            error: "Name, price, description, and categorySlug are required",
          });
        }

        const category = await prisma.category.findUnique({
          where: { slug: categorySlug },
        });

        if (!category) {
          return res.status(400).json({ error: "Invalid category slug" });
        }

        // Generate slug unik
        let slug = slugify(name, { lower: true, strict: true });

        const existing = await prisma.product.findUnique({ where: { slug } });
        if (existing) {
          slug = `${slug}-${Date.now()}`;
        }

        const product = await prisma.product.create({
          data: {
            name,
            price: Number(price),
            description,
            slug,
            excerpt: description.slice(0, 100),
            image: image || null,
            categoryId: category.id,
          },
          include: { category: true },
        });

        return res.status(201).json(sanitizeProduct(product));
      }

      // =====================================
      // UPDATE PRODUCT
      // =====================================
      case "PUT": {
        const { id, name, price, description, image, categorySlug } = req.body;

        if (!id || !name || price == null || !description || !categorySlug) {
          return res.status(400).json({
            error: "ID, name, price, description, and categorySlug are required",
          });
        }

        const category = await prisma.category.findUnique({
          where: { slug: categorySlug },
        });

        if (!category) {
          return res.status(400).json({ error: "Invalid category slug" });
        }

        // Generate slug baru + unique check
        let slug = slugify(name, { lower: true, strict: true });

        const exists = await prisma.product.findFirst({
          where: {
            slug,
            NOT: { id: Number(id) },
          },
        });

        if (exists) slug = `${slug}-${Date.now()}`;

        const product = await prisma.product.update({
          where: { id: Number(id) },
          data: {
            name,
            price: Number(price),
            description,
            slug,
            excerpt: description.slice(0, 100),
            image: image || null,
            categoryId: category.id,
          },
          include: { category: true },
        });

        return res.status(200).json(sanitizeProduct(product));
      }

      // =====================================
      // DELETE PRODUCT
      // =====================================
      case "DELETE": {
        const { id } = req.query;

        if (!id) return res.status(400).json({ error: "ID required" });

        const productId = Array.isArray(id) ? Number(id[0]) : Number(id);

        // Cek apakah product exist sebelum delete
        const exists = await prisma.product.findUnique({
          where: { id: productId },
        });

        if (!exists) {
          return res.status(404).json({ error: "Product not found" });
        }

        await prisma.product.delete({
          where: { id: productId },
        });

        return res.status(200).json({ message: "Product deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err: any) {
    console.error("Products API error:", err);

    if (err.message === "Unauthorized") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (err.code === "P2025") {
      // Prisma not found error
      return res.status(404).json({ error: "Record not found" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}
