// src/lib/auth.ts
import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify, JWTPayload } from "jose";
import type { NextApiRequest } from "next";

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
const ACCESS_EXP = "15m";
const REFRESH_EXP = "30d";

// password
export const hashPassword = (pw: string) => hash(pw, 10);
export const comparePassword = (pw: string, hashPw: string) => compare(pw, hashPw);

// JWT
export const signAccessToken = async (payload: Record<string, any>) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(ACCESS_EXP)
    .sign(ACCESS_SECRET);

export const signRefreshToken = async (payload: Record<string, any>) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(REFRESH_EXP)
    .sign(REFRESH_SECRET);

export const verifyAccessToken = async (token: string): Promise<JWTPayload> =>
  (await jwtVerify(token, ACCESS_SECRET)).payload;

export const verifyRefreshToken = async (token: string): Promise<JWTPayload> =>
  (await jwtVerify(token, REFRESH_SECRET)).payload;

// helper: parse cookies
export function parseCookies(req: NextApiRequest) {
  const raw = req.headers.cookie;
  if (!raw) return {};
  return Object.fromEntries(
    raw.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    })
  );
}
