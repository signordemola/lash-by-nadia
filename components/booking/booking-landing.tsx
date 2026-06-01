"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLenis } from "lenis/react"
import { services, policy } from "@/lib/studio-data"
import { LashMark } from "@/components/shared/lash-mark"
import { SmoothScroll } from "@/components/shared/smooth-scroll"

export function BookingLanding() {
  const [selected, setSelected] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const router = useRouter()

  useLenis(({ scroll }) => setScrollY(scroll))

  const selectedService = services.find((s) => s.slug === selected)

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-background text-foreground selection:bg-accent/20 selection:text-accent">
        {/* Hero */}
        <section className="relative h-svh min-h-160 w-full overflow-hidden text-background">
          <div className="absolute inset-0 animate-hero-zoom will-change-transform">
            <Image
              src="/hero-lashes.jpg"
              alt="A single eye in profile, lashes built one fibre at a time"
              fill
              priority
              className="object-cover"
              style={{ transform: `translate3d(0, ${scrollY * 0.25}px, 0)` }}
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-foreground/85 via-foreground/30 to-foreground/40" />
          <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-foreground/40 to-transparent" />

          <nav className="relative z-10">
            <div className="mx-auto flex max-w-7xl animate-fade-up items-center justify-between p-6">
              <Link href="/" className="group flex items-center gap-3">
                <LashMark size={26} className="text-background" />
                <span className="block">
                  <span className="mb-1 block font-mono text-[9px] leading-none tracking-[0.3em] uppercase opacity-60">
                    Bethnal Green · E2
                  </span>
                  <span className="block text-[15px] leading-none font-bold tracking-tight uppercase">
                    Lash by Nadia
                  </span>
                </span>
              </Link>
              <div className="hidden items-center gap-8 text-background/90 md:flex">
                <a
                  href="#services"
                  className="link-underline text-sm font-medium"
                >
                  Services
                </a>
                <a
                  href="#policy"
                  className="link-underline text-sm font-medium"
                >
                  Etiquette
                </a>
                <a
                  href="#booking"
                  className="rounded-sm bg-background px-5 py-2.5 text-xs font-medium tracking-[0.18em] text-foreground uppercase transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Book a slot
                </a>
              </div>
            </div>
          </nav>

          <div className="relative z-10 mx-auto flex h-[calc(100svh-92px)] min-h-137 max-w-7xl flex-col justify-end px-6 pb-12 md:pb-20">
            <div className="max-w-[34ch] animate-fade-up [animation-delay:120ms]">
              <span className="mb-6 inline-flex items-center gap-2.5 font-mono text-[10px] tracking-[0.3em] uppercase">
                <span className="size-1.5 animate-pulse-dot rounded-full bg-accent" />
                Now booking · June
              </span>
              <h1 className="text-[44px] leading-[0.94] font-bold tracking-[-0.02em] text-balance sm:text-6xl md:text-7xl">
                The geometry
                <br />
                of the <span className="text-accent italic">eye.</span>
              </h1>
              <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-background/80 md:text-base">
                Solo lash artistry in East London. Hand-built sets, two hours of
                stillness, one fibre at a time.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#booking"
                  className="group inline-flex items-center gap-3 rounded-sm bg-background px-7 py-4 text-xs font-medium tracking-[0.18em] text-foreground uppercase transition-colors duration-300 hover:bg-accent hover:text-accent-foreground"
                >
                  See available slots
                  <span
                    aria-hidden
                    className="transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </a>
                <a
                  href="#services"
                  className="link-underline text-xs tracking-[0.18em] text-background/80 uppercase hover:text-background"
                >
                  Services & pricing
                </a>
              </div>
            </div>

            <div className="mt-12 grid animate-fade-up grid-cols-2 gap-6 border-t border-background/15 pt-6 font-mono text-[10px] tracking-[0.2em] text-background/70 uppercase [animation-delay:280ms] md:grid-cols-4">
              <span>Est. 2023</span>
              <span>By appointment only</span>
              <span className="hidden md:block">Hypoallergenic adhesive</span>
              <span className="hidden md:block md:text-right">
                Tue – Sat, 10 – 18
              </span>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-6">
          {/* Services + Booking */}
          <section id="services" className="py-20 md:py-28">
            <div className="mb-12 flex animate-fade-up flex-col gap-3 md:mb-16 md:flex-row md:items-baseline md:justify-between">
              <div>
                <span className="mb-3 block font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                  01: Choose
                </span>
                <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                  Select your treatment.
                </h2>
              </div>
              <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase md:max-w-[20ch] md:text-right">
                Small deposit holds the slot. Refundable up to 48h before.
              </span>
            </div>

            <div id="booking" className="animate-fade-up space-y-2.5">
              {services.map((s, i) => {
                const isSelected = selected === s.slug
                return (
                  <button
                    type="button"
                    key={s.slug}
                    onClick={() => {
                      setSelected(isSelected ? null : s.slug)
                      setConfirming(false)
                    }}
                    className={`group relative flex w-full flex-col rounded-sm border p-6 text-left transition-all duration-500 md:flex-row md:items-center md:p-7 ${
                      isSelected
                        ? "border-accent bg-foreground text-background shadow-[0_20px_60px_-30px_rgba(0,0,0,0.4)]"
                        : "border-border bg-card hover:translate-x-1 hover:border-foreground/40"
                    }`}
                    style={{
                      transitionDelay: isSelected ? "0ms" : `${i * 20}ms`,
                    }}
                  >
                    <span
                      className={`absolute top-0 left-0 h-full w-0.5 origin-top transition-all duration-500 ${
                        isSelected
                          ? "scale-y-100 bg-accent"
                          : "scale-y-0 bg-foreground group-hover:scale-y-100"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-3">
                        <span className="text-xl font-bold tracking-tight">
                          {s.name}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase ${
                            isSelected
                              ? "bg-background/10 text-background/70"
                              : "bg-foreground/5 text-muted-foreground"
                          }`}
                        >
                          {s.duration} min
                        </span>
                      </div>
                      <p
                        className={`max-w-prose text-sm ${
                          isSelected
                            ? "text-background/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {s.description}
                      </p>
                    </div>
                    <div className="mt-5 flex shrink-0 items-center gap-6 md:mt-0 md:ml-8 md:gap-8">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-2xl tracking-tighter">
                          £{s.price}
                        </span>
                        <span
                          className={`mt-0.5 font-mono text-[10px] tracking-wider uppercase ${
                            isSelected
                              ? "text-background/50"
                              : "text-muted-foreground"
                          }`}
                        >
                          {s.deposit ? `£${s.deposit} deposit` : "No deposit"}
                        </span>
                      </div>
                      <span
                        className={`rounded-sm px-4 py-2 text-[10px] font-medium tracking-[0.2em] uppercase transition-colors ${
                          isSelected
                            ? "bg-accent text-accent-foreground"
                            : "bg-foreground text-background group-hover:bg-accent"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedService && (
              <div
                key={selectedService.slug + String(confirming)}
                className="mt-8 animate-fade-up overflow-hidden rounded-sm border border-accent/40 bg-accent/4"
              >
                {!confirming ? (
                  <div className="flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-8">
                    <div>
                      <span className="mb-2 block font-mono text-[10px] tracking-[0.22em] text-accent uppercase">
                        02: Confirm
                      </span>
                      <p className="text-lg font-bold tracking-tight md:text-xl">
                        {selectedService.name} · £{selectedService.price}
                        <span className="text-muted-foreground">
                          {" "}
                          , pick a date & time next.
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedService) {
                          router.push(`/${selectedService.slug}`)
                        }
                      }}
                      className="shrink-0 rounded-sm bg-foreground px-7 py-4 text-xs font-medium tracking-[0.18em] whitespace-nowrap text-background uppercase transition-colors hover:bg-accent"
                    >
                      Continue →
                    </button>
                  </div>
                ) : (
                  <div className="animate-fade-up p-7 md:p-10">
                    <div className="mb-6 flex items-center gap-3">
                      <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                        <span className="relative inline-flex size-2 rounded-full bg-accent" />
                      </span>
                      <span className="font-mono text-[10px] tracking-[0.22em] text-accent uppercase">
                        Holding {selectedService.name} for you
                      </span>
                    </div>
                    <h3 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
                      Choose a date this week.
                    </h3>
                    <p className="mb-6 max-w-[44ch] text-sm text-muted-foreground">
                      Live availability. You&apos;ll confirm with a £
                      {selectedService.deposit} card deposit on the next step.
                    </p>
                    <div className="mb-8 grid grid-cols-3 gap-2 md:grid-cols-6">
                      {[
                        "Tue 9",
                        "Wed 10",
                        "Thu 11",
                        "Fri 12",
                        "Sat 13",
                        "Mon 15",
                      ].map((d, i) => (
                        <button
                          type="button"
                          key={d}
                          disabled={i === 2}
                          className="rounded-sm border border-border bg-background p-3 font-mono text-xs tracking-wider uppercase transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:line-through disabled:opacity-30"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                      {["10:00", "12:30", "14:30", "16:00", "17:30"].map(
                        (t) => (
                          <button
                            type="button"
                            key={t}
                            className="rounded-sm border border-border bg-background p-3 font-mono text-xs transition-colors hover:bg-foreground hover:text-background"
                          >
                            {t}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* The Studio */}
          <section className="grid animate-fade-up gap-10 border-t border-border py-20 md:grid-cols-12 md:gap-16 md:py-28">
            <div className="md:col-span-4">
              <span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                02: The Room
              </span>
            </div>
            <div className="space-y-6 md:col-span-8">
              <p className="text-2xl leading-[1.2] font-bold tracking-tight text-pretty md:text-[32px]">
                A private room inside a shared beauty suite on Cambridge Heath
                Road. No music, no chatter, just{" "}
                <span className="text-accent italic">
                  two hours of stillness
                </span>
                , and lashes built one fibre at a time.
              </p>
              <p className="max-w-[60ch] text-base leading-relaxed text-pretty text-muted-foreground">
                Two minutes from Bethnal Green Overground. Tea and a blanket on
                arrival. Hypoallergenic adhesive as standard, patch test
                available on request.
              </p>
            </div>
          </section>

          {/* Policy */}
          <section
            id="policy"
            className="grid animate-fade-up gap-10 border-t border-border py-20 md:grid-cols-12 md:gap-16 md:py-28"
          >
            <div className="md:col-span-4">
              <span className="mb-6 block font-mono text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                03: Studio Etiquette
              </span>
              <h3 className="text-2xl leading-snug font-bold tracking-tight text-pretty md:text-[28px]">
                A small studio runs on mutual respect for time.
              </h3>
            </div>
            <div className="md:col-span-8">
              <dl className="divide-y divide-border border-y border-border">
                {policy.map((p) => (
                  <div
                    key={p.window}
                    className="group -mx-2 grid grid-cols-12 items-baseline gap-6 rounded-sm px-2 py-5 transition-colors hover:bg-muted/30"
                  >
                    <dt className="col-span-12 font-mono text-sm tracking-tight text-foreground sm:col-span-4">
                      {p.window}
                    </dt>
                    <dd className="col-span-12 text-sm leading-relaxed text-muted-foreground sm:col-span-8">
                      {p.outcome}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        </main>

        <footer className="mt-12 bg-foreground px-6 py-16 text-background">
          <div className="mx-auto grid max-w-7xl items-start gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <div className="mb-5 flex items-center gap-3">
                <LashMark size={28} className="text-background" />
                <span className="text-base font-bold tracking-tight uppercase">
                  Lash by Nadia
                </span>
              </div>
              <p className="max-w-[28ch] text-sm leading-relaxed opacity-80">
                Cambridge Heath Road, Bethnal Green, London E2.
                <span className="mt-1 block opacity-60">
                  Entrance via the teal doors.
                </span>
              </p>
            </div>
            <div className="md:col-span-3">
              <span className="mb-3 block font-mono text-[10px] tracking-[0.25em] uppercase opacity-50">
                Hours
              </span>
              <p className="text-sm leading-relaxed opacity-90">
                Tue – Sat, 10:00 – 18:00
                <br />
                <span className="opacity-60">By appointment only</span>
              </p>
            </div>
            <div className="md:col-span-5 md:text-right">
              <span className="mb-3 block font-mono text-[10px] tracking-[0.25em] uppercase opacity-50">
                Get in touch
              </span>
              <div className="flex gap-6 md:justify-end">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-xs tracking-[0.2em] uppercase transition-colors hover:text-accent"
                >
                  Instagram
                </a>
                <a
                  href="https://wa.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-xs tracking-[0.2em] uppercase transition-colors hover:text-accent"
                >
                  WhatsApp
                </a>
              </div>
              <Link
                href="/login"
                className="mt-10 inline-block font-mono text-[10px] tracking-[0.2em] uppercase opacity-40 transition-opacity hover:opacity-100"
              >
                Owner login
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-3 border-t border-background/10 pt-6 font-mono text-[10px] tracking-[0.2em] uppercase opacity-40 md:flex-row md:justify-between">
            <span>© 2026 Lash by Nadia · Made in London</span>
            <span>
              <Link href="/portal" className="underline hover:opacity-100">
                Client portal
              </Link>
              {" · "}
              <Link href="/dashboard" className="underline hover:opacity-100">
                Owner dashboard
              </Link>
            </span>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  )
}
