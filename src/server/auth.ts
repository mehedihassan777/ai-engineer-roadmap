import { createHash, timingSafeEqual } from "node:crypto";

/** Compares two secrets in constant time (hashing first makes both buffers the same length). */
export function tokenMatches(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

/** The token from an `Authorization: Bearer <token>` header, or null. */
export function readBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header);
  return match ? match[1] : null;
}
