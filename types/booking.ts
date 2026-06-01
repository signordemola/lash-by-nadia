export type SlotOption = {
  startsAt: Date
  endsAt: Date
  time: string
}

export type CancellationOutcome = "refund" | "credit" | "forfeit"
