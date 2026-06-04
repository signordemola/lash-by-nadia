import { z } from "zod"

export const NewClientSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z
    .string()
    .min(1)
    .regex(/^[\d\s+\-().]{7,}$/, "Please enter a valid phone number"),
  allergies: z.string().optional(),
  referralSource: z.string().optional(),
})

export const ReturningClientLookupSchema = z.object({
  email: z.email(),
})

export const CreateBookingSchema = z.object({
  holdToken: z.string().min(1),
  serviceSlug: z.string().min(1),
  date: z.string().min(1),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
  allergies: z.string().optional(),
  referralSource: z.string().optional(),
  policyAgreed: z.literal(true),
})
