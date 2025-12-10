// src/pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Set-Cookie", [
    `accessToken=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
    `refresh_token=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`,
  ]);
  res.status(200).json({ ok: true });
}
