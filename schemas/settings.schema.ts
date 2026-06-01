import { z } from "zod"

export const UpdateServiceSchema = z.object({
  price: z.number().int().positive(),
  deposit: z.number().int().min(0),
})

export const BlockDateSchema = z.object({
  date: z.string().min(1),
  reason: z.string().optional(),
})

export const WeeklyAvailabilitySchema = z.array(
  z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
    isActive: z.boolean(),
  })
)

export type UpdateService = z.infer<typeof UpdateServiceSchema>
export type BlockDate = z.infer<typeof BlockDateSchema>
export type WeeklyAvailability = z.infer<typeof WeeklyAvailabilitySchema>
