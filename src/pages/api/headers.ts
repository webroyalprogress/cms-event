import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const LARAVEL_API = process.env.LARAVEL_API_URL;

  try {
    let url = `${LARAVEL_API}/headers`;
    if (req.method === "PUT" || req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "ID is required" });
      url += `/${id}`;
    }

    const response = await fetch(url, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: ["POST","PUT","DELETE"].includes(req.method||"") ? JSON.stringify(req.body) : undefined,
    });

    const text = await response.text();
    try {
      const data = JSON.parse(text); // pastikan JSON
      return res.status(response.status).json(data);
    } catch {
      console.log("Raw Laravel response:", text);
      return res.status(500).json({ error: "Invalid response from Laravel API", raw: text });
    }
  } catch (err) {
    console.error("Error proxying headers API:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
