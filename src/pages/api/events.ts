// pages/api/events.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import slugify from "slugify";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  try {
    switch (req.method) {
      // 🔹 GET semua event untuk CMS
      case "GET": {
        const events = await prisma.event.findMany({
          orderBy: { createdAt: "desc" },
        });

        // Convert date ke ISO string supaya konsisten di frontend
        const formatted = events.map((e) => ({
          ...e,
          startDate: e.startDate ? e.startDate.toISOString() : null,
          endDate: e.endDate ? e.endDate.toISOString() : null,
        }));

        return res.status(200).json(formatted);
      }

      // 🔹 CREATE event
      case "POST": {
        const { name, startDate, endDate } = req.body;
        if (!name || !startDate || !endDate)
          return res.status(400).json({ error: "Name, startDate and endDate are required" });

        const slug = slugify(name, { lower: true, strict: true });

        // Convert datetime-local input ke UTC
        const parseToUTC = (dateStr: string) => {
          const d = new Date(dateStr);
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        };

        const event = await prisma.event.create({
          data: {
            name,
            slug,
            startDate: parseToUTC(startDate),
            endDate: parseToUTC(endDate),
          },
        });

        return res.status(201).json({
          ...event,
          startDate: event.startDate?.toISOString(),
          endDate: event.endDate?.toISOString(),
        });
      }

      // 🔹 UPDATE event
      case "PUT": {
        const { id, name, startDate, endDate } = req.body;
        if (!id || !name || !startDate || !endDate)
          return res.status(400).json({ error: "ID, name, startDate and endDate are required" });

        const slug = slugify(name, { lower: true, strict: true });

        const parseToUTC = (dateStr: string) => {
          const d = new Date(dateStr);
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        };

        const event = await prisma.event.update({
          where: { id: Number(id) },
          data: {
            name,
            slug,
            startDate: parseToUTC(startDate),
            endDate: parseToUTC(endDate),
          },
        });

        return res.status(200).json({
          ...event,
          startDate: event.startDate?.toISOString(),
          endDate: event.endDate?.toISOString(),
        });
      }

      // 🔹 DELETE event
      case "DELETE": {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: "ID required" });

        await prisma.event.delete({ where: { id: Number(id) } });
        return res.status(200).json({ message: "Deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err) {
    console.error("CMS Events API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
