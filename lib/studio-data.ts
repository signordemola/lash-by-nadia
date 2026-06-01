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

export const demoAppointment = {
  token: "demo",
  clientName: "Amara Okonkwo",
  service: services[1],
  startsAt: "Thursday 12 June 2026, 14:30",
  endsAt: "16:30",
  depositPaid: 25,
  status: "Confirmed" as const,
  hoursUntil: 73,
}

export const todayAppointments = [
  {
    time: "10:00",
    client: "Priya Shah",
    service: "Hybrid Set",
    duration: 120,
    status: "completed" as const,
    deposit: 25,
  },
  {
    time: "12:30",
    client: "Maya Lindqvist",
    service: "Volume Set",
    duration: 150,
    status: "in_session" as const,
    deposit: 30,
  },
  {
    time: "15:30",
    client: "Amara Okonkwo",
    service: "Classic Set",
    duration: 90,
    status: "confirmed" as const,
    deposit: 20,
  },
  {
    time: "17:30",
    client: "Yuki Tanaka",
    service: "Lash Fill",
    duration: 60,
    status: "confirmed" as const,
    deposit: 15,
  },
]

export const weekOverview = [
  { day: "Mon", date: 8, count: 0, blocked: true },
  { day: "Tue", date: 9, count: 3 },
  { day: "Wed", date: 10, count: 4 },
  { day: "Thu", date: 11, count: 4, today: true },
  { day: "Fri", date: 12, count: 5 },
  { day: "Sat", date: 13, count: 6 },
  { day: "Sun", date: 14, count: 0, blocked: true },
]

export const recentClients = [
  {
    name: "Amara Okonkwo",
    email: "amara@example.com",
    visits: 8,
    lastVisit: "3 weeks ago",
    flagged: false,
  },
  {
    name: "Priya Shah",
    email: "priya.s@example.com",
    visits: 12,
    lastVisit: "Today",
    flagged: false,
  },
  {
    name: "Maya Lindqvist",
    email: "maya.l@example.com",
    visits: 4,
    lastVisit: "Today",
    flagged: false,
  },
  {
    name: "Sofia Reyes",
    email: "sofia.r@example.com",
    visits: 2,
    lastVisit: "5 weeks ago",
    flagged: true,
  },
  {
    name: "Yuki Tanaka",
    email: "yuki@example.com",
    visits: 6,
    lastVisit: "Today",
    flagged: false,
  },
  {
    name: "Eleanor Cho",
    email: "e.cho@example.com",
    visits: 1,
    lastVisit: "2 days ago",
    flagged: false,
  },
]

export const revenue = {
  monthGross: 2845,
  monthBookings: 38,
  noShows: 2,
  depositsHeld: 320,
}
