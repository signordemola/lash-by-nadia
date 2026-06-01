import { cn } from "@/lib/utils"

type Variant = "default" | "accent" | "destructive"

const variantStyles: Record<Variant, string> = {
  default: "bg-muted text-muted-foreground",
  accent: "bg-accent/15 text-accent",
  destructive: "bg-destructive/15 text-destructive",
}

type Props = {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export function StatusBadge({
  children,
  variant = "default",
  className,
}: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-3 py-1 font-mono text-[10px] tracking-[0.15em] uppercase",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
