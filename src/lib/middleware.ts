import type { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import bcrypt from "bcryptjs";

export function withBearerToken(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isValid = await bcrypt.compare(token, process.env.API_BEARER_TOKEN_HASH!);
    if (!isValid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return handler(req, res);
  };
}
