"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Zone {
  id: string;
  label: string;
  available: boolean;
  shape: React.ReactNode;
  labelX: number;
  labelY: number;
  dotX: number;
  dotY: number;
  side: "left" | "right";
}

const MINT = "#00D4A0";
const BODY_FILL = "oklch(0.22 0.05 168)";
const ZONE_DEFAULT = "oklch(0.35 0.08 168 / 0.0)";
const ZONE_HOVER = "#00D4A0";

export function BodyMap() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  const zones: Zone[] = [
    {
      id: "krc",
      label: "Krk & šíje",
      available: true,
      shape: <ellipse cx="150" cy="88" rx="13" ry="11" />,
      dotX: 150, dotY: 88,
      labelX: 210, labelY: 88,
      side: "right",
    },
    {
      id: "ramena",
      label: "Ramena",
      available: false,
      shape: <ellipse cx="150" cy="115" rx="52" ry="13" />,
      dotX: 150, dotY: 115,
      labelX: 60, labelY: 108,
      side: "left",
    },
    {
      id: "zada",
      label: "Záda",
      available: true,
      shape: <rect x="118" y="128" width="64" height="58" rx="10" />,
      dotX: 150, dotY: 157,
      labelX: 215, labelY: 157,
      side: "right",
    },
    {
      id: "kycle",
      label: "Kyčle",
      available: false,
      shape: <rect x="110" y="202" width="80" height="32" rx="10" />,
      dotX: 150, dotY: 218,
      labelX: 55, labelY: 218,
      side: "left",
    },
    {
      id: "kolena",
      label: "Kolena",
      available: false,
      shape: <><ellipse cx="131" cy="318" rx="17" ry="13" /><ellipse cx="169" cy="318" rx="17" ry="13" /></>,
      dotX: 150, dotY: 318,
      labelX: 215, labelY: 318,
      side: "right",
    },
  ];

  function handleClick(zone: Zone) {
    if (zone.available) router.push(`/klinika/${zone.id}`);
  }

  return (
    <svg
      viewBox="0 0 300 440"
      className="w-full max-w-xs mx-auto select-none"
      aria-label="Interaktivní mapa těla"
    >
      {/* Silueta – hlava */}
      <circle cx="150" cy="48" r="28" fill={BODY_FILL} />
      {/* Krk */}
      <rect x="138" y="74" width="24" height="18" fill={BODY_FILL} />
      {/* Trup */}
      <path
        d="M 98 110 Q 80 118 82 188 L 110 210 L 190 210 L 218 188 Q 220 118 202 110 L 164 100 L 136 100 Z"
        fill={BODY_FILL}
      />
      {/* Levá paže */}
      <path
        d="M 98 110 Q 72 140 68 215 L 82 216 Q 86 148 106 118 Z"
        fill={BODY_FILL}
      />
      {/* Pravá paže */}
      <path
        d="M 202 110 Q 228 140 232 215 L 218 216 Q 214 148 194 118 Z"
        fill={BODY_FILL}
      />
      {/* Levé stehno */}
      <rect x="112" y="210" width="34" height="90" rx="8" fill={BODY_FILL} />
      {/* Pravé stehno */}
      <rect x="154" y="210" width="34" height="90" rx="8" fill={BODY_FILL} />
      {/* Levé lýtko */}
      <rect x="114" y="302" width="30" height="80" rx="8" fill={BODY_FILL} />
      {/* Pravé lýtko */}
      <rect x="156" y="302" width="30" height="80" rx="8" fill={BODY_FILL} />
      {/* Levé chodidlo */}
      <ellipse cx="129" cy="388" rx="20" ry="9" fill={BODY_FILL} />
      {/* Pravé chodidlo */}
      <ellipse cx="171" cy="388" rx="20" ry="9" fill={BODY_FILL} />

      {/* Klikatelné zóny */}
      {zones.map((zone) => {
        const isHovered = hovered === zone.id;
        const color = isHovered ? ZONE_HOVER : "transparent";
        const opacity = isHovered ? 0.25 : 0;

        return (
          <g
            key={zone.id}
            onClick={() => handleClick(zone)}
            onMouseEnter={() => setHovered(zone.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: zone.available ? "pointer" : "default" }}
          >
            {/* Barevná zóna */}
            <g fill={isHovered ? ZONE_HOVER : "transparent"} fillOpacity={isHovered ? 0.22 : 0} stroke={isHovered ? ZONE_HOVER : zone.available ? "oklch(0.55 0.1 168)" : "oklch(0.35 0.05 168)"} strokeWidth={isHovered ? 2 : 1.5}>
              {zone.shape}
            </g>

            {/* Spojovací linie */}
            <line
              x1={zone.dotX}
              y1={zone.dotY}
              x2={zone.side === "right" ? zone.labelX - 38 : zone.labelX + 38}
              y2={zone.labelY}
              stroke={isHovered ? MINT : zone.available ? "oklch(0.5 0.1 168)" : "oklch(0.35 0.05 168)"}
              strokeWidth={1}
              strokeDasharray={isHovered ? "0" : "3 3"}
            />

            {/* Dot na těle */}
            <circle
              cx={zone.dotX}
              cy={zone.dotY}
              r={isHovered ? 4 : 3}
              fill={isHovered ? MINT : zone.available ? "oklch(0.6 0.15 168)" : "oklch(0.4 0.05 168)"}
            />

            {/* Label */}
            <text
              x={zone.labelX}
              y={zone.labelY - 4}
              textAnchor={zone.side === "right" ? "start" : "end"}
              fontSize="11"
              fontWeight={isHovered ? "700" : "500"}
              fill={isHovered ? MINT : zone.available ? "oklch(0.85 0.05 168)" : "oklch(0.5 0.03 168)"}
              fontFamily="system-ui, sans-serif"
            >
              {zone.label}
            </text>
            {!zone.available && (
              <text
                x={zone.labelX}
                y={zone.labelY + 9}
                textAnchor={zone.side === "right" ? "start" : "end"}
                fontSize="9"
                fill="oklch(0.45 0.03 168)"
                fontFamily="system-ui, sans-serif"
              >
                brzy
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
