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
  setService: (slug: string) => void
  setSlot: (date: string, time: string) => void
  setClientInfo: (info: ClientInfo) => void
  agreePolicy: () => void
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
}

export const useBookingState = create<BookingState>((set) => ({
  ...initialState,
  setService: (slug) =>
    set({ serviceSlug: slug, step: "slot", date: null, time: null }),
  setSlot: (date, time) => set({ date, time, step: "intake" }),
  setClientInfo: (info) => set({ clientInfo: info, step: "policy" }),
  agreePolicy: () => set({ policyAgreed: true, step: "payment" }),
  goToStep: (step) => set({ step }),
  reset: () => set(initialState),
}))
