import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      // =======================
      // GET all products
      // =======================
      case "GET": {
        const products = await prisma.product.findMany({
          include: { category: true }, // biar slug category ikut keluar
          orderBy: { createdAt: "desc" },
        });

        // ubah categoryId jadi categorySlug di response
        const data = products.map((p) => ({
          ...p,
          categoryId: undefined, // jangan expose id
          categorySlug: p.category?.slug || null,
        }));

        return res.status(200).json(data);
      }

      // =======================
      // CREATE product
      // =======================
      case "POST": {
        const { name, price, description, image, categorySlug } = req.body;

        if (!name || price == null || !description || !categorySlug) {
          return res.status(400).json({
            error: "Name, price, description, and categorySlug are required",
          });
        }

        // cek kategori berdasarkan slug
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
            slug,
            excerpt: description.slice(0, 100),
            image: image || null,
            categoryId: category.id, // pakai id dari slug
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
      // UPDATE product
      // =======================
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

        const slug = slugify(name, { lower: true, strict: true });

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

        return res.status(200).json({
          ...product,
          categoryId: undefined,
          categorySlug: product.category.slug,
        });
      }

      // =======================
      // DELETE product
      // =======================
      case "DELETE": {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "ID required" });

        const productId = Array.isArray(id) ? Number(id[0]) : Number(id);

        await prisma.product.delete({
          where: { id: productId },
        });

        return res.status(200).json({ message: "Product deleted" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error("Products API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
