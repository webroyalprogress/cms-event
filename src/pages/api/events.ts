// src/pages/api/events.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

type EventPayload = {
  id?: number;
  name: string;
  startDate: string;
  endDate: string;
};

// Convert datetime-local input ke UTC
const parseToUTC = (dateStr: string) => {
  const d = new Date(dateStr);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        // Ambil semua events (Prisma infer type otomatis)
        const events = await prisma.event.findMany({
          orderBy: { createdAt: "desc" },
        });

        // Map ke ISO string untuk startDate & endDate
        const formatted = events.map((e: typeof events[number]) => ({
          ...e,
          startDate: e.startDate?.toISOString() ?? null,
          endDate: e.endDate?.toISOString() ?? null,
        }));

        return res.status(200).json(formatted);
      }

      case "POST": {
        const { name, startDate, endDate } = req.body as EventPayload;

        if (!name || !startDate || !endDate)
          return res
            .status(400)
            .json({ error: "Name, startDate and endDate are required" });

        const slug = slugify(name, { lower: true, strict: true });

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

      case "PUT": {
        const { id, name, startDate, endDate } =
          req.body as EventPayload & { id?: number };

        if (!id || !name || !startDate || !endDate)
          return res
            .status(400)
            .json({ error: "ID, name, startDate and endDate are required" });

        const slug = slugify(name, { lower: true, strict: true });

        const event = await prisma.event.update({
          where: { id },
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

      case "DELETE": {
        const { id } = req.body as { id?: number };
        if (!id) return res.status(400).json({ error: "ID required" });

        await prisma.event.delete({ where: { id } });
        return res.status(200).json({ message: "Deleted successfully" });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (err: any) {
    console.error("Events API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
