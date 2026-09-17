"use client";

import React, { useState } from "react";
import { FacultyMember } from "@/types";
import {
  Star,
  MapPin,
  Mail,
  Plus,
  Check,
  ChevronRight,
  PenTool,
} from "lucide-react";
import { FacultyAvatar } from "./FacultyAvatar";

interface FacultyCardProps {
  faculty: FacultyMember;
  onViewDetails: (faculty: FacultyMember) => void;
  onWriteReview: (faculty: FacultyMember) => void;
  rank?: number;
  rankVariant?: "top" | "lowest";
  showActions?: boolean;
}

export const FacultyCard: React.FC<FacultyCardProps> = ({
  faculty,
  onViewDetails,
  onWriteReview,
  rank,
  rankVariant = "top",
  showActions = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const isRated = faculty.reviewCount > 0 && faculty.rating > 0;

  return (
    <article
      onClick={() => onViewDetails(faculty)}
      className="group relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 sm:gap-6 rounded-lg border border-[#0E1A2E]/10 bg-white p-4 sm:p-5 shadow-xs hover:border-[#0E1A2E]/30 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Left & Middle: Photo + Essential Details */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
        {/* Official Faculty Portrait Picture or Distinguished Academic Avatar */}
        <div className="relative h-24 w-20 sm:h-28 sm:w-24 shrink-0 rounded-md overflow-hidden border border-[#0E1A2E]/12 bg-[#F0F2F5] shadow-xs">
          <FacultyAvatar faculty={faculty} />

          {/* Leave indicator ribbon */}
          {faculty.onLeave && (
            <span className="absolute bottom-0 inset-x-0 bg-[#0E1A2E]/90 text-white text-[9px] font-medium py-0.5 text-center z-10">
              On Leave
            </span>
          )}
        </div>

        {/* Essential Academic Information */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Rank badge, Name, Initials */}
          <div className="flex items-center gap-2 flex-wrap">
            {rank && isRated && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold font-mono text-white ${
                  rankVariant === "lowest" ? "bg-[#8B2635]" : "bg-[#0E1A2E]"
                }`}
              >
                #{rank}
              </span>
            )}
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#0E1A2E] group-hover:text-[#16233B] transition-colors truncate">
              {faculty.name}
            </h3>
            <span className="rounded bg-[#F0F2F5] border border-[#0E1A2E]/10 px-1.5 py-0.2 text-xs font-semibold text-[#0E1A2E] shrink-0 font-mono">
              {faculty.initials}
            </span>
          </div>

          {/* Designation & Role */}
          <p className="text-xs text-[#58667E] mt-0.5">
            <span className="font-medium text-[#26334D]">{faculty.designation}</span>
            {faculty.role && (
              <span className="text-[#9B6E18] font-medium"> &bull; {faculty.role}</span>
            )}
          </p>

          {/* Email */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#58667E] mt-2">
            <span className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs">
              <Mail className="h-3.5 w-3.5 text-[#58667E] shrink-0" />
              <span>{faculty.email}</span>
            </span>
          </div>

          {/* Essential Research Field Badges (Concise) */}
          {faculty.researchInterests.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {faculty.researchInterests.slice(0, 2).map((topic, i) => (
                <span
                  key={i}
                  className="rounded bg-[#F7F8FA] border border-[#0E1A2E]/10 px-2 py-0.5 text-[11px] text-[#26334D]"
                >
                  {topic}
                </span>
              ))}
              {faculty.researchInterests.length > 2 && (
                <span className="text-[11px] text-[#58667E]">
                  +{faculty.researchInterests.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Rating Overview & Profile Button */}
      <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-[#0E1A2E]/10 md:pl-6 shrink-0">
        {/* Rating Score Badge */}
        <div className="text-left md:text-right">
          {isRated ? (
            <div>
              <div className="flex items-center md:justify-end gap-1.5">
                <Star className="h-4 w-4 fill-[#8B2635] text-[#8B2635]" />
                <span className="text-xl sm:text-2xl font-serif font-bold text-[#0D1B2A] tabular-nums">
                  {faculty.rating.toFixed(1)}
                </span>
                <span className="text-xs text-[#58667E]">/ 5.0</span>
              </div>
              <span className="text-xs text-[#58667E] block mt-0.5">
                {faculty.reviewCount} student {faculty.reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          ) : (
            <div>
              <span className="inline-flex items-center rounded border border-[#0D1B2A]/15 bg-[#F7F8FA] px-2 py-0.5 text-xs font-medium text-[#58667E]">
                Unrated
              </span>
              <span className="text-[11px] text-[#58667E] block mt-0.5">
                0 evaluations yet
              </span>
            </div>
          )}
        </div>

        {/* Action Controls (Visible during search or if showActions is true) */}
        {showActions ? (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick Rate */}
            <button
              onClick={() => onWriteReview(faculty)}
              className="inline-flex items-center gap-1 rounded border border-[#0D1B2A]/20 bg-white px-2.5 py-1.5 text-xs font-medium text-[#0D1B2A] hover:bg-[#8B2635] hover:text-[#EDE6DA] hover:border-[#8B2635] transition-colors cursor-pointer"
              title="Write evaluation"
            >
              <Plus className="h-3 w-3" />
              <span>Rate</span>
            </button>

            {/* View Profile CTA */}
            <button
              onClick={() => onViewDetails(faculty)}
              className="inline-flex items-center gap-1 rounded bg-[#0D1B2A] hover:bg-[#1B2E44] px-3.5 py-1.5 text-xs font-semibold text-[#EDE6DA] transition-colors cursor-pointer"
            >
              <span>Profile</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#EDE6DA]" />
            </button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1 text-xs text-[#58667E] group-hover:text-[#0E1A2E] transition-colors">
            <span>View Profile & Reviews</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        )}
      </div>
    </article>
  );
};
