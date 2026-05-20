interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 36, className }: LogoMarkProps) {
  const id = "ppGrad";
  const gid = "ppGlow";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Pitner PP"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D4A0" />
          <stop offset="100%" stopColor="#00B386" />
        </linearGradient>
        <filter id={gid} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0.83  0 0 0 0 0.63  0 0 0 0.7 0" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* First P — left, slightly overlaps second */}
      <path
        d="M6 28 L6 10 Q6 7 9 7 L15 7 Q20 7 20 12.5 Q20 18 15 18 L9 18 L9 28 Z
           M9 10 L9 15 L14.5 15 Q17 15 17 12.5 Q17 10 14.5 10 Z"
        fill={`url(#${id})`}
        filter={`url(#${gid})`}
      />

      {/* Second P — right, shifted, creates interlock feel */}
      <path
        d="M16 28 L16 10 Q16 7 19 7 L25 7 Q30 7 30 12.5 Q30 18 25 18 L19 18 L19 28 Z
           M19 10 L19 15 L24.5 15 Q27 15 27 12.5 Q27 10 24.5 10 Z"
        fill={`url(#${id})`}
        filter={`url(#${gid})`}
        opacity="0.85"
      />

      {/* Connecting ligature stroke — single-stroke feel */}
      <path
        d="M9 18 Q13 22 16 18"
        stroke={`url(#${id})`}
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
        filter={`url(#${gid})`}
      />
    </svg>
  );
}
