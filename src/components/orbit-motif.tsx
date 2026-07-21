interface OrbitMotifProps {
  className?: string;
  compact?: boolean;
}

export function OrbitMotif({ className = "", compact = false }: OrbitMotifProps) {
  const ticks = Array.from({ length: 10 }, (_, index) => index * 36);

  return (
    <svg
      aria-hidden="true"
      className={`orbit-motif ${compact ? "orbit-motif--compact" : ""} ${className}`}
      viewBox="0 0 320 320"
      role="presentation"
    >
      <g className="orbit-motif__ticks">
        {ticks.map((angle, index) => (
          <rect
            className="orbit-motif__tick"
            key={angle}
            x="154"
            y="14"
            width="12"
            height="34"
            rx="6"
            style={{ animationDelay: `${index * 38}ms` }}
            transform={`rotate(${angle} 160 160)`}
          />
        ))}
      </g>
      <path className="orbit-motif__diamond" d="M160 112 208 160 160 208 112 160z" />
      <path className="orbit-motif__facet" d="m160 112 14 48-14 48-14-48z" />
    </svg>
  );
}

