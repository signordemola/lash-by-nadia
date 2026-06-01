import type { Metadata } from "next"
import { BookingLanding } from "@/components/booking/booking-landing"

export const metadata: Metadata = {
  title: "Lash by Nadia — Solo Lash Artistry in East London",
  description:
    "Hand-built lash sets in Bethnal Green. Classic, hybrid, volume, fills, and removal. Book with a deposit, two hours of stillness, one fibre at a time.",
  openGraph: {
    title: "Lash by Nadia",
    description:
      "Solo lash artistry in East London. Book your treatment online.",
    url: "https://lashbynadia.co.uk",
    type: "website",
  },
}

export default function HomePage() {
  return <BookingLanding />
}
