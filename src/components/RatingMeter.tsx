"use client";

import React from "react";

interface RatingMeterProps {
  label: string;
  value: number;
  max?: number;
  icon?: React.ReactNode;
  showNumeric?: boolean;
  size?: "sm" | "md";
}

export const RatingMeter: React.FC<RatingMeterProps> = ({
  label,
  value,
  max = 5.0,
  icon,
  showNumeric = true,
  size = "md",
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const heightClass = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[#26334D] font-medium flex items-center gap-1.5">
          {icon && <span className="text-[#58667E]">{icon}</span>}
          {label}
        </span>
        {showNumeric && (
          <span className="font-semibold text-[#0E1A2E] tabular-nums text-xs">
            {value.toFixed(1)}{" "}
            <span className="text-[#58667E] font-normal">/ {max.toFixed(1)}</span>
          </span>
        )}
      </div>
      <div className={`w-full bg-[#0E1A2E]/10 rounded-sm overflow-hidden ${heightClass}`}>
        <div
          className="h-full rounded-sm bg-[#0E1A2E] transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
