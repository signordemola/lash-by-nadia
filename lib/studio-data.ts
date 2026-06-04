export const currentYear = new Date().getFullYear()

export type Service = {
  slug: string
  name: string
  duration: number
  price: number
  deposit: number
  description: string
}

export const services: Service[] = [
  {
    slug: "classic",
    name: "Classic Set",
    duration: 90,
    price: 65,
    deposit: 20,
    description:
      "One extension per natural lash. A refined, mascara-finish enhancement.",
  },
  {
    slug: "hybrid",
    name: "Hybrid Set",
    duration: 120,
    price: 80,
    deposit: 25,
    description:
      "A mix of classic and volume fans. Textured, wispy, light on the lid.",
  },
  {
    slug: "volume",
    name: "Volume Set",
    duration: 150,
    price: 95,
    deposit: 30,
    description: "Handmade fans for density and depth. Built lash by lash.",
  },
  {
    slug: "fill",
    name: "Lash Fill",
    duration: 60,
    price: 45,
    deposit: 15,
    description: "Top-up within three weeks of your last set.",
  },
  {
    slug: "removal",
    name: "Lash Removal",
    duration: 30,
    price: 20,
    deposit: 0,
    description: "Safe, gentle removal of any extensions.",
  },
]

export const policy = [
  { window: "48 hours or more", outcome: "Full deposit refunded" },
  { window: "24–48 hours", outcome: "Deposit held as credit for next visit" },
  { window: "Under 24 hours", outcome: "Deposit forfeited" },
  { window: "No-show", outcome: "Deposit forfeited, account flagged" },
  { window: "15+ minutes late", outcome: "Appointment may be cancelled" },
]
