import { verify } from "argon2"

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await verify(hash, password)
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
