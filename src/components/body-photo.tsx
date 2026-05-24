"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

const MINT = "#00D4A0";

interface Zone {
  id: string;
  label: string;
  available: boolean;
  dotX: number;
  dotY: number;
  labelX: number;
  labelY: number;
  side: "left" | "right";
}

const zones: Zone[] = [
  {
    id: "krc",
    label: "Krk & šíje",
    available: true,
    dotX: 150, dotY: 38,
    labelX: 243, labelY: 38,
    side: "right",
  },
  {
    id: "ramena",
    label: "Ramena",
    available: false,
    dotX: 150, dotY: 68,
    labelX: 57, labelY: 68,
    side: "left",
  },
  {
    id: "zada",
    label: "Záda",
    available: true,
    dotX: 150, dotY: 118,
    labelX: 243, labelY: 118,
    side: "right",
  },
  {
    id: "kycle",
    label: "Kyčle",
    available: false,
    dotX: 150, dotY: 170,
    labelX: 57, labelY: 170,
    side: "left",
  },
  {
    id: "kolena",
    label: "Kolena",
    available: false,
    dotX: 150, dotY: 218,
    labelX: 243, labelY: 218,
    side: "right",
  },
];

export { zones };

export function BodyPhoto() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  function handleClick(zone: Zone) {
    if (zone.available) router.push(`/klinika/${zone.id}`);
  }

  return (
    <div className="relative w-full select-none">
      <Image
        src="/brand/panáček klinika_result.webp"
        alt="Interaktivní mapa těla"
        width={600}
        height={600}
        className="w-full h-auto"
        priority
      />
      <svg
        viewBox="0 0 300 300"
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        {zones.map((zone) => {
          const isHovered = hovered === zone.id;
          const lineEndX = zone.side === "right" ? zone.labelX - 36 : zone.labelX + 36;

          return (
            <g
              key={zone.id}
              style={{ pointerEvents: "all", cursor: zone.available ? "pointer" : "default" }}
              onClick={() => handleClick(zone)}
              onMouseEnter={() => setHovered(zone.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Connecting line */}
              <line
                x1={zone.dotX + (zone.side === "right" ? 5 : -5)}
                y1={zone.dotY}
                x2={lineEndX}
                y2={zone.labelY}
                stroke={isHovered ? MINT : zone.available ? "rgba(0,212,160,0.45)" : "rgba(255,255,255,0.18)"}
                strokeWidth={1}
                strokeDasharray={isHovered ? "0" : "3 3"}
              />

              {/* Dot */}
              <circle
                cx={zone.dotX}
                cy={zone.dotY}
                r={isHovered ? 5 : 4}
                fill={isHovered ? MINT : zone.available ? "rgba(0,212,160,0.85)" : "rgba(255,255,255,0.28)"}
                style={{ filter: isHovered ? `drop-shadow(0 0 5px ${MINT})` : "none" }}
              />

              {/* Pill background */}
              <rect
                x={zone.labelX - 34}
                y={zone.labelY - 10}
                width={68}
                height={21}
                rx={10.5}
                fill={isHovered ? "rgba(0,212,160,0.18)" : "rgba(0,0,0,0.55)"}
                stroke={isHovered ? MINT : zone.available ? "rgba(0,212,160,0.38)" : "rgba(255,255,255,0.12)"}
                strokeWidth={1}
              />

              {/* Label text */}
              <text
                x={zone.labelX}
                y={zone.labelY + 4}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight={isHovered ? "700" : "500"}
                fill={isHovered ? MINT : zone.available ? "rgba(0,212,160,0.95)" : "rgba(255,255,255,0.38)"}
                fontFamily="system-ui, sans-serif"
              >
                {zone.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
