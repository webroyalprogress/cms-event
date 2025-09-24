// pages/api/external/events.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import slugify from "slugify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 🔒 Auth pakai Bearer Token
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const isValid = await bcrypt.compare(token, process.env.API_BEARER_TOKEN_HASH!);
  if (!isValid) return res.status(401).json({ error: "Unauthorized" });

  try {
    switch (req.method) {
      case "GET": {
        const events = await prisma.event.findMany();
        return res.status(200).json(events);
      }

      case "POST": {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Name is required" });

        const slug = slugify(name, { lower: true, strict: true });

        const event = await prisma.event.create({
          data: { name, slug },
        });
        return res.status(201).json(event);
      }

      case "PUT": {
        const { id, name } = req.body;
        if (!id || !name) return res.status(400).json({ error: "ID and name required" });

        const slug = slugify(name, { lower: true, strict: true });

        const event = await prisma.event.update({
          where: { id: Number(id) },
          data: { name, slug },
        });
        return res.status(200).json(event);
      }

      case "DELETE": {
        const { id } = req.query;
        if (!id) return res.status(400).json({ error: "ID required" });

        await prisma.event.delete({ where: { id: Number(id) } });
        return res.status(200).json({ message: "Deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error("External Events API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
