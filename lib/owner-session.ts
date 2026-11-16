import { createHash, randomBytes } from "crypto"
import { prisma } from "@/lib/db"
import { OWNER_SESSION_TTL_SECONDS } from "@/lib/owner-session-cookie"

const hashToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex")

const expiryCutoff = (now: Date): Date =>
  new Date(now.getTime() - OWNER_SESSION_TTL_SECONDS * 1000)

export const createOwnerSession = async (
  now: Date = new Date()
): Promise<string> => {
  const token = randomBytes(32).toString("base64url")
  await prisma.ownerSession.deleteMany({
    where: { createdAt: { lte: expiryCutoff(now) } },
  })
  await prisma.ownerSession.create({
    data: { id: hashToken(token), createdAt: now },
  })
  return token
}

export const isOwnerSessionValid = async (
  token: string | undefined,
  now: Date = new Date()
): Promise<boolean> => {
  if (!token) return false
  const session = await prisma.ownerSession.findUnique({
    where: { id: hashToken(token) },
  })
  if (!session) return false
  return session.createdAt > expiryCutoff(now)
}

export const deleteOwnerSession = async (
  token: string | undefined
): Promise<void> => {
  if (!token) return
  await prisma.ownerSession.deleteMany({ where: { id: hashToken(token) } })
}
