import React from "react";

interface RiskGaugeProps {
  value: number; // 0-100
  label?: string;
  size?: number; // px
}

const circumference = (r: number) => 2 * Math.PI * r;

export function RiskGauge({ value, label = "Risk Score", size = 120 }: RiskGaugeProps) {
  const radius = (size - 16) / 2; // padding for stroke
  const strokeWidth = 10;
  const circ = circumference(radius);
  const clamped = Math.max(0, Math.min(100, value || 0));
  const offset = circ * (1 - clamped / 100);

  // color by value: green->yellow->red
  const hue = 120 - (clamped * 120) / 100; // 120 (green) to 0 (red)
  const strokeColor = `hsl(${hue} 90% 45%)`;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width={size} height={size} className="block">
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {/* track */}
          <circle
            r={radius}
            fill="none"
            stroke="hsl(var(--muted-foreground) / 0.2)"
            strokeWidth={strokeWidth}
          />
          {/* progress */}
          <circle
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform="rotate(-90)"
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-semibold"
            fontSize={size * 0.22}
          >
            {Math.round(clamped)}
          </text>
        </g>
      </svg>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export default RiskGauge;
