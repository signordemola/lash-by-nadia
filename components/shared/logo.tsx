import Link from "next/link"
import { cn } from "@/lib/utils"

type LogoProps = {
  size?: number
  className?: string
  asLink?: boolean
  color?: string
}

export function LogoMark({
  size = 32,
  color = "#8B5A5A",
  className,
}: {
  size?: number
  color?: string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 40 C 20 52, 44 52, 58 40"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12 40 L 9 30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18 42 L 15 30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 43 L 22 28"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M32 43.5 L 32 24"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M40 43 L 42 28"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M46 42 L 49 30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M52 40 L 55 30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({
  size = 36,
  className,
  asLink = true,
  color,
}: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} color={color} />
      <span className="flex flex-col leading-none">
        <span
          className="mt-0.5 text-[0.625rem] tracking-[0.25em] uppercase"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            color: color ?? "#D4A5A5",
            fontWeight: 500,
          }}
        >
          by Nadia
        </span>
      </span>
    </span>
  )

  if (!asLink) return content

  return (
    <Link
      href="/"
      className="inline-flex items-center"
      aria-label="Lash by Nadia — home"
    >
      {content}
    </Link>
  )
}

export default Logo
