import React from "react";
import Image from "next/image";

interface EwuLogoProps {
  variant?: "full" | "crest";
  className?: string;
  theme?: "light" | "dark" | "badge";
  size?: "sm" | "md" | "lg";
}

export const EwuLogo: React.FC<EwuLogoProps> = ({
  variant = "full",
  className = "",
  theme = "dark",
  size = "md",
}) => {
  if (variant === "crest") {
    // Square / crest emblem
    const dims = size === "sm" ? 28 : size === "lg" ? 48 : 36;
    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 overflow-hidden rounded bg-white p-1 shadow-xs border border-[#0E1A2E]/10 ${className}`}
        style={{ width: dims, height: dims }}
        title="East West University Official Crest"
      >
        <Image
          src="/ewu-logo.svg"
          alt="East West University Crest"
          width={dims}
          height={dims}
          className="h-full w-full object-contain"
          priority
        />
      </div>
    );
  }

  // Full Horizontal EWU Logo
  const heightClasses =
    size === "sm" ? "h-6" : size === "lg" ? "h-10" : "h-8";

  if (theme === "badge") {
    return (
      <div className={`inline-flex items-center rounded bg-white px-2.5 py-1 shadow-xs border border-white/20 ${className}`}>
        <Image
          src="/ewu-logo.png"
          alt="East West University Logo"
          width={180}
          height={36}
          className={`${heightClasses} w-auto object-contain`}
          priority
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Image
        src="/ewu-logo.png"
        alt="East West University Logo"
        width={220}
        height={44}
        className={`${heightClasses} w-auto object-contain ${
          theme === "light" ? "brightness-0 invert drop-shadow-xs" : ""
        }`}
        priority
      />
    </div>
  );
};
