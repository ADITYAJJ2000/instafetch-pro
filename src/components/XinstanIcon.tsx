export function XinstanIcon({ className }: { className?: string }) {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="xinstanGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF5EDF" />
          <stop offset="50%" stopColor="#8A5CFF" />
          <stop offset="100%" stopColor="#FF9F43" />
        </linearGradient>
      </defs>
      {/* Outer Glow */}
      <rect
        x="4"
        y="4"
        width="64"
        height="64"
        rx="18"
        stroke="url(#xinstanGradient)"
        strokeWidth="3"
      />
      {/* Inner Camera Frame */}
      <rect
        x="14"
        y="14"
        width="44"
        height="44"
        rx="14"
        fill="url(#xinstanGradient)"
        opacity="0.12"
      />
      {/* Download Arrow */}
      <path
        d="M36 22V40"
        stroke="url(#xinstanGradient)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M28 34L36 42L44 34"
        stroke="url(#xinstanGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base Line */}
      <line
        x1="26"
        y1="46"
        x2="46"
        y2="46"
        stroke="url(#xinstanGradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
