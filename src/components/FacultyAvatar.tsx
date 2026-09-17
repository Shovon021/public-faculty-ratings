"use client";

import React, { useState } from "react";
import { FacultyMember } from "@/types";

interface FacultyAvatarProps {
  faculty: FacultyMember;
  className?: string;
}

export const FacultyAvatar: React.FC<FacultyAvatarProps> = ({
  faculty,
  className = "",
}) => {
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const hasPhoto = Boolean(faculty.avatarUrl) && !imageFailed;

  if (hasPhoto && faculty.avatarUrl) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#D9D9D9] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={faculty.avatarUrl}
          alt={faculty.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  // Fallback: Exact neutral avatar from user's provided 2nd image
  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#D9D9D9] flex items-center justify-center select-none ${className}`}
      title={`${faculty.name} (${faculty.initials})`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/default-avatar.png"
        alt={faculty.name}
        className="h-full w-full object-cover"
      />
    </div>
  );
};
