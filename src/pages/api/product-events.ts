// src/pages/api/product-events.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/auth";

// tipe untuk body request
type ProductEventPayload = {
  id?: number;
  productId?: number;
  eventId?: number;
};

// helper: cek auth
async function checkAuth(req: NextApiRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    throw new Error("Unauthorized");

  const token = authHeader.split(" ")[1];
  try {
    return await verifyAccessToken(token);
  } catch {
    throw new Error("Unauthorized");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // cek JWT
    await checkAuth(req);

    const body: ProductEventPayload = req.body;

    switch (req.method) {
      case "GET": {
        const productEvents = await prisma.productEvent.findMany({
          include: { product: true, event: true },
        });
        return res.status(200).json(productEvents);
      }

      case "POST": {
        if (!body.productId || !body.eventId) {
          return res
            .status(400)
            .json({ error: "Missing productId or eventId" });
        }

        const productEvent = await prisma.productEvent.create({
          data: {
            productId: body.productId,
            eventId: body.eventId,
          },
        });

        return res.status(201).json(productEvent);
      }

      case "PUT": {
        if (!body.id || !body.productId || !body.eventId) {
          return res
            .status(400)
            .json({ error: "Missing id, productId or eventId" });
        }

        const productEvent = await prisma.productEvent.update({
          where: { id: body.id },
          data: {
            productId: body.productId,
            eventId: body.eventId,
          },
        });

        return res.status(200).json(productEvent);
      }

      case "DELETE": {
        // 🔥 FIX UTAMA — ambil ID dari query, bukan body
        const id = Number(req.query.id);

        if (!id) {
          return res.status(400).json({ error: "Missing id" });
        }

        await prisma.productEvent.delete({
          where: { id },
        });

        return res.status(200).json({ message: "Relation deleted" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err: any) {
    console.error("Product Events API error:", err);
    return res
      .status(err.message === "Unauthorized" ? 401 : 500)
      .json({ error: err.message || "Internal server error" });
  }
}
