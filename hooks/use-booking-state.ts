import { create } from "zustand"

export type BookingStep =
  | "service"
  | "slot"
  | "intake"
  | "policy"
  | "payment"
  | "complete"

export type ClientInfo = {
  name: string
  email: string
  phone: string
  allergies?: string
  referralSource?: string
}

export type BookingState = {
  step: BookingStep
  serviceSlug: string | null
  date: string | null
  time: string | null
  clientInfo: ClientInfo | null
  policyAgreed: boolean
  holdToken: string | null
  holdExpiresAt: number | null
  setService: (slug: string) => void
  setSlot: (date: string, time: string) => void
  setHold: (token: string, expiresAt: number) => void
  setClientInfo: (info: ClientInfo) => void
  agreePolicy: () => void
  releaseHold: () => void
  goToStep: (step: BookingStep) => void
  reset: () => void
}

const initialState = {
  step: "service" as BookingStep,
  serviceSlug: null as string | null,
  date: null as string | null,
  time: null as string | null,
  clientInfo: null as ClientInfo | null,
  policyAgreed: false,
  holdToken: null as string | null,
  holdExpiresAt: null as number | null,
}

export const useBookingState = create<BookingState>((set) => ({
  ...initialState,
  setService: (slug) =>
    set({ serviceSlug: slug, step: "slot", date: null, time: null }),
  setSlot: (date, time) => set({ date, time, step: "intake" }),
  setHold: (token, expiresAt) =>
    set({ holdToken: token, holdExpiresAt: expiresAt }),
  setClientInfo: (info) => set({ clientInfo: info, step: "policy" }),
  agreePolicy: () => set({ policyAgreed: true, step: "payment" }),
  releaseHold: () => set({ holdToken: null, holdExpiresAt: null }),
  goToStep: (step) => set({ step }),
  reset: () => set(initialState),
}))
