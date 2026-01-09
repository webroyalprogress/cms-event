// pages/api/logos.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const LARAVEL_API = process.env.LARAVEL_API_URL; // https://productevent.royalprogress.com/api

  try {
    let url = `${LARAVEL_API}/logos`;

    // ===============================
    // HANDLE ID IN URL PATH
    // ===============================
    if (req.method === "PUT" || req.method === "DELETE" || (req.method === "GET" && req.query.id)) {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID is required" });
      const idStr = Array.isArray(id) ? id[0] : id;
      url += `/${idStr}`;
    }

    // ===============================
    // PREPARE FETCH OPTIONS
    // ===============================
    const fetchOptions: RequestInit = {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${process.env.LARAVEL_API_TOKEN}`, // aktifin kalau perlu
      },
    };

    // BODY hanya untuk POST / PUT
    if (req.method === "POST" || req.method === "PUT") {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // ===============================
    // FETCH TO LARAVEL
    // ===============================
    const response = await fetch(url, fetchOptions);
    const text = await response.text();

    // PARSE JSON, fallback kalau Laravel balikin HTML
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Laravel API returned non-JSON:", text);
      return res.status(response.status).json({ error: text || "Internal server error" });
    }

    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Error proxying logos API:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
