import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { nextCookies } from "better-auth/next-js"
import { prisma } from "@/lib/db"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 10,
    autoSignIn: true,
  },

  emailVerification: {
    requireEmailVerification: false,
    autoSignInAfterVerification: true,
  },

  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 4,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  rateLimit: {
    window: 60,
    max: 30,
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },

  plugins: [nextCookies()],
})
