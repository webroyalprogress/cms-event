// pages/api/logos.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const LARAVEL_API = process.env.LARAVEL_API_URL; // contoh: https://cms.example.com/api

  try {
    let url = `${LARAVEL_API}/logos`; // default endpoint

    // kalo ada id di URL (PUT/DELETE)
    if (req.method === "PUT" || req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID is required" });
      url += `/${id}`;
    }

    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: ["POST", "PUT", "DELETE"].includes(req.method || "")
        ? JSON.stringify(req.body)
        : undefined,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Error proxying logos API:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
