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
        const productEvents = await prisma.productEvent.findMany({
          include: { product: true, event: true },
        });
        return res.status(200).json(productEvents);
      }

      case "POST": {
        const { productId, eventId } = req.body;
        if (!productId || !eventId) {
          return res.status(400).json({ error: "Missing productId or eventId" });
        }

        const productEvent = await prisma.productEvent.create({
          data: {
            productId: Number(productId),
            eventId: Number(eventId),
          },
        });
        return res.status(201).json(productEvent);
      }

      case "PUT": {
        const { id, productId, eventId } = req.body;
        if (!id || !productId || !eventId) {
          return res.status(400).json({ error: "Missing id, productId or eventId" });
        }

        const productEvent = await prisma.productEvent.update({
          where: { id: Number(id) },
          data: {
            productId: Number(productId),
            eventId: Number(eventId),
          },
        });
        return res.status(200).json(productEvent);
      }

      case "DELETE": {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ error: "Missing id" });
        }

        await prisma.productEvent.delete({
          where: { id: Number(id) },
        });
        return res.status(200).json({ message: "Relation deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
