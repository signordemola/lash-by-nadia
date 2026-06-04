import { createHash, timingSafeEqual } from "crypto"

export function verifyPassword(password: string, hash: string): boolean {
  const inputHash = createHash("sha256").update(password).digest("hex")
  try {
    return timingSafeEqual(Buffer.from(inputHash), Buffer.from(hash))
  } catch {
    return false
  }
}

export function hasOwnerSession(request: Request): boolean {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .find((c) => c.trim().startsWith("owner-token="))
  return cookie?.includes("valid") ?? false
}
