type Props = {
  className?: string
  size?: number
}

export function LashMark({ className, size = 28 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
        <path d="M4 19 Q16 11 28 19" />
        <line x1="6.5" y1="19.2" x2="5.5" y2="24" />
        <line x1="9.5" y1="17.2" x2="8.8" y2="22.5" />
        <line x1="12.7" y1="15.8" x2="12.7" y2="22" />
        <line x1="16" y1="15.4" x2="16" y2="22" />
        <line x1="19.3" y1="15.8" x2="19.3" y2="22" />
        <line x1="22.5" y1="17.2" x2="23.2" y2="22.5" />
        <line x1="25.5" y1="19.2" x2="26.5" y2="24" />
      </g>
    </svg>
  )
}
