import { z } from "zod"

export const SelectServiceSchema = z.object({
  serviceSlug: z.string().min(1),
})

export const SelectSlotSchema = z.object({
  date: z.string().min(1),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
})

export const NewClientSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  phone: z.string().min(1),
  allergies: z.string().optional(),
  referralSource: z.string().optional(),
})

export const ReturningClientLookupSchema = z.object({
  email: z.email(),
})

export const PolicyAgreementSchema = z.object({
  agreed: z.literal(true),
})

export const CreateBookingSchema = z.object({
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

export type SelectService = z.infer<typeof SelectServiceSchema>
export type SelectSlot = z.infer<typeof SelectSlotSchema>
export type NewClient = z.infer<typeof NewClientSchema>
export type ReturningClientLookup = z.infer<typeof ReturningClientLookupSchema>
export type PolicyAgreement = z.infer<typeof PolicyAgreementSchema>
export type CreateBooking = z.infer<typeof CreateBookingSchema>
