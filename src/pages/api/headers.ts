// pages/api/headers.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const LARAVEL_API = process.env.LARAVEL_API_URL; // contoh: https://productevent.royalprogress.com/api

  try {
    let url = `${LARAVEL_API}/headers`;

    // ===============================
    // HANDLE ID DI URL PATH (PUT/DELETE/GET SINGLE)
    // ===============================
    if (
      req.method === "PUT" ||
      req.method === "DELETE" ||
      (req.method === "GET" && req.query.id)
    ) {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID is required" });

      // kalau array misal ?id[]=10
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

    if (["POST", "PUT", "DELETE"].includes(req.method || "")) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // ===============================
    // FETCH TO LARAVEL
    // ===============================
    const response = await fetch(url, fetchOptions);
    const text = await response.text();

    // ===============================
    // PARSE JSON, fallback kalau Laravel balikin HTML
    // ===============================
    try {
      const data = JSON.parse(text);
      return res.status(response.status).json(data);
    } catch {
      console.error("Raw Laravel response:", text);
      return res
        .status(500)
        .json({ error: "Invalid response from Laravel API", raw: text });
    }
  } catch (err) {
    console.error("Error proxying headers API:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
