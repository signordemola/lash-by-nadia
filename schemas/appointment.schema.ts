import { z } from "zod"

export const RescheduleSchema = z.object({
  token: z.string().min(1),
  date: z.string().min(1),
  time: z.string().regex(/^\d{2}:\d{2}$/),
})

export const CancelSchema = z.object({
  token: z.string().min(1),
})

export const NoShowSchema = z.object({
  appointmentId: z.string().min(1),
})

export type Reschedule = z.infer<typeof RescheduleSchema>
export type Cancel = z.infer<typeof CancelSchema>
export type NoShow = z.infer<typeof NoShowSchema>
