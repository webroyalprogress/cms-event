import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET": {
        const products = await prisma.product.findMany({
          include: { events: true },
        });
        return res.status(200).json(products);
      }

      case "POST": {
        const body = req.body;
        if (!body.name || !body.price) {
          return res.status(400).json({ error: "Name and price are required" });
        }

        const product = await prisma.product.create({
          data: {
            name: body.name,
            price: body.price,
          },
        });
        return res.status(201).json(product);
      }

      case "PUT": {
        const body = req.body;
        if (!body.id || !body.name || !body.price) {
          return res.status(400).json({ error: "ID, name, and price are required" });
        }

        const product = await prisma.product.update({
          where: { id: body.id },
          data: {
            name: body.name,
            price: body.price,
          },
        });
        return res.status(200).json(product);
      }

      case "DELETE": {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: "ID required" });
        }

        await prisma.product.delete({
          where: { id: Number(id) },
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
