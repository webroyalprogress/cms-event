import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 🔒 Auth pakai Bearer Token
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // ambil setelah "Bearer "

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const isValid = await bcrypt.compare(token, process.env.API_BEARER_TOKEN_HASH!);
  if (!isValid) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // 🚀 Lanjut CRUD
  try {
    switch (req.method) {
      case "GET": {
        const products = await prisma.product.findMany({
          include: { events: true },
        });
        return res.status(200).json(products);
      }

      case "POST": {
        const { name, price } = req.body;
        if (!name || !price) {
          return res.status(400).json({ error: "Name and price are required" });
        }

        const product = await prisma.product.create({
          data: {
            name,
            price: Number(price),
          },
        });
        return res.status(201).json(product);
      }

      case "PUT": {
        const { id, name, price } = req.body;
        if (!id || !name || !price) {
          return res.status(400).json({ error: "ID, name, and price are required" });
        }

        const product = await prisma.product.update({
          where: { id: Number(id) },
          data: {
            name,
            price: Number(price),
          },
        });
        return res.status(200).json(product);
      }

      case "DELETE": {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: "ID required" });
        }

        const productId = Array.isArray(id) ? parseInt(id[0], 10) : parseInt(id, 10);
        if (isNaN(productId)) {
          return res.status(400).json({ error: "Invalid ID" });
        }

        await prisma.product.delete({
          where: { id: productId },
        });
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
