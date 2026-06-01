import { LashMark } from "@/components/shared/lash-mark"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  showLocation?: boolean
}

export function StudioLogo({ className, showLocation = false }: Props) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LashMark size={22} />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium tracking-[-0.01em]">
          Lash by Nadia
        </span>
        {showLocation && (
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Bethnal Green · E2
          </span>
        )}
      </div>
    </div>
  )
}
