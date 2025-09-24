import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.redirect("/admin/login"); // kalau mau redirect
    // atau kalau mau JSON:
    // return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    switch (req.method) {
      case "GET": {
        const productEvents = await prisma.productEvent.findMany({
          include: { product: true, event: true },
        });
        return res.status(200).json(productEvents);
      }

      case "POST": {
        const body = req.body;
        if (!body.productId || !body.eventId) {
          return res.status(400).json({ error: "Missing productId or eventId" });
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
        const body = req.body;
        if (!body.id || !body.productId || !body.eventId) {
          return res.status(400).json({ error: "Missing id, productId or eventId" });
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
        const body = req.body;
        if (!body.id) {
          return res.status(400).json({ error: "Missing id" });
        }

        await prisma.productEvent.delete({ where: { id: body.id } });
        return res.status(200).json({ message: "Relation deleted" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
