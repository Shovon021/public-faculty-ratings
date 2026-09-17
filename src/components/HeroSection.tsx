"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { FacultyMember } from "@/types";
import { Search, X, Star } from "lucide-react";

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  facultyList: FacultyMember[];
  onViewFaculty: (faculty: FacultyMember) => void;
  reviewCount: number;
  avgDeptRating: string | null;
  onSearchSubmit?: () => void;
}

interface StreamCard {
  id: string;
  name: string;
  designation: string;
  avatarUrl?: string;
  rating: number;
  layer: "fg" | "mid" | "bg";
  leftPercent: number; // horizontal placement across stream area
  durationSec: number; // speed of ascent
  delaySec: number; // negative start delay for continuous stream
  rotationDeg: number; // natural organic tilt
}

export function HeroSection({
  searchQuery,
  onSearchChange,
  facultyList,
  onViewFaculty,
  reviewCount,
  onSearchSubmit,
}: HeroSectionProps) {
  // Map of prominent faculty members with portraits from official department directory
  const facultyMap = useMemo(() => {
    const map = new Map<string, FacultyMember>();
    facultyList.forEach((f) => map.set(f.id, f));
    return map;
  }, [facultyList]);

  // 10 multi-depth faculty stream cards with staggered negative delays
  const streamCards: StreamCard[] = useMemo(
    () => [
      // --- FOREGROUND CARDS (Navy #1B2E44 panels with 1px border #2D4564, burgundy stars) ---
      {
        id: "dshr",
        name: "Dr. Shamim H Ripon",
        designation: "Professor",
        avatarUrl: facultyMap.get("dshr")?.avatarUrl,
        rating: 4.8,
        layer: "fg",
        leftPercent: 36,
        durationSec: 18,
        delaySec: -2,
        rotationDeg: -1.5,
      },
      {
        id: "wasif",
        name: "Dr. Ahmed Wasif Reza",
        designation: "Professor & Dean",
        avatarUrl: facultyMap.get("wasif")?.avatarUrl,
        rating: 4.9,
        layer: "fg",
        leftPercent: 4,
        durationSec: 20,
        delaySec: -11,
        rotationDeg: 2,
      },
      {
        id: "mhakhan",
        name: "Dr. Md. Mozammel Huq Azad Khan",
        designation: "Professor",
        avatarUrl: facultyMap.get("mhakhan")?.avatarUrl,
        rating: 4.8,
        layer: "fg",
        leftPercent: 58,
        durationSec: 19,
        delaySec: -15,
        rotationDeg: 1,
      },

      // --- MIDDLE CARDS (Medium size, 70-80% opacity) ---
      {
        id: "taskeed",
        name: "Dr. Taskeed Jabid",
        designation: "Professor",
        avatarUrl: facultyMap.get("taskeed")?.avatarUrl,
        rating: 4.8,
        layer: "mid",
        leftPercent: 18,
        durationSec: 22,
        delaySec: -6,
        rotationDeg: -2,
      },
      {
        id: "maheen",
        name: "Dr. Maheen Islam",
        designation: "Professor & Chairperson",
        avatarUrl: facultyMap.get("maheen")?.avatarUrl,
        rating: 4.9,
        layer: "mid",
        leftPercent: 46,
        durationSec: 21,
        delaySec: -16,
        rotationDeg: 2.5,
      },
      {
        id: "mrhuq",
        name: "Dr. Mohammad Rezwanul Huq",
        designation: "Associate Professor",
        avatarUrl: facultyMap.get("mrhuq")?.avatarUrl,
        rating: 4.8,
        layer: "mid",
        leftPercent: 68,
        durationSec: 23,
        delaySec: -9,
        rotationDeg: -1,
      },
      {
        id: "nawab",
        name: "Dr. Md. Nawab Yousuf Ali",
        designation: "Professor",
        avatarUrl: facultyMap.get("nawab")?.avatarUrl,
        rating: 4.7,
        layer: "mid",
        leftPercent: 1,
        durationSec: 24,
        delaySec: -18,
        rotationDeg: 1.5,
      },

      // --- BACKGROUND CARDS (35-50% opacity, slow movement) ---
      {
        id: "anis",
        name: "Dr. Anisur Rahman",
        designation: "Associate Professor & Proctor",
        avatarUrl: facultyMap.get("anis")?.avatarUrl,
        rating: 4.7,
        layer: "bg",
        leftPercent: 28,
        durationSec: 27,
        delaySec: -4,
        rotationDeg: -2.5,
      },
      {
        id: "anuppaul",
        name: "Dr. Anup Kumar Paul",
        designation: "Associate Professor",
        avatarUrl: facultyMap.get("anuppaul")?.avatarUrl,
        rating: 4.6,
        layer: "bg",
        leftPercent: 62,
        durationSec: 28,
        delaySec: -13,
        rotationDeg: 3,
      },
      {
        id: "sjahan",
        name: "Dr. Sarwar Jahan",
        designation: "Associate Professor",
        avatarUrl: facultyMap.get("sjahan")?.avatarUrl,
        rating: 4.6,
        layer: "bg",
        leftPercent: 12,
        durationSec: 26,
        delaySec: -20,
        rotationDeg: -1,
      },
    ],
    [facultyMap]
  );

  // Render individual floating card component with crisp 1px borders & NO artificial glows
  const renderFloatingCard = (card: StreamCard, isMobileBackground: boolean = false) => {
    const faculty = facultyMap.get(card.id);
    const isForeground = card.layer === "fg";
    const isMid = card.layer === "mid";

    const layerStyles = isForeground
      ? {
          zIndex: 3,
          maxOpacity: isMobileBackground ? "0.26" : "0.98",
          scale: isMobileBackground ? "0.78" : "1.04",
          border: isMobileBackground ? "border-[#2D4564]/40" : "border-[#2D4564]",
          bg: isMobileBackground ? "bg-[#1B2E44]/70" : "bg-[#1B2E44]",
          width: isMobileBackground ? "w-[205px]" : "w-[260px] sm:w-[280px]",
          imgSize: isMobileBackground ? "h-11 w-9" : "h-14 w-12 sm:h-16 sm:w-14",
        }
      : isMid
      ? {
          zIndex: 2,
          maxOpacity: isMobileBackground ? "0.18" : "0.75",
          scale: isMobileBackground ? "0.70" : "0.94",
          border: isMobileBackground ? "border-[#2D4564]/30" : "border-[#2D4564]/80",
          bg: isMobileBackground ? "bg-[#1B2E44]/50" : "bg-[#1B2E44]/90",
          width: isMobileBackground ? "w-[180px]" : "w-[230px] sm:w-[250px]",
          imgSize: isMobileBackground ? "h-10 w-8" : "h-12 w-10 sm:h-14 sm:w-12",
        }
      : {
          zIndex: 1,
          maxOpacity: isMobileBackground ? "0.12" : "0.45",
          scale: isMobileBackground ? "0.62" : "0.82",
          border: isMobileBackground ? "border-[#2D4564]/20" : "border-[#2D4564]/50",
          bg: isMobileBackground ? "bg-[#1B2E44]/30" : "bg-[#1B2E44]/70",
          width: isMobileBackground ? "w-[160px]" : "w-[200px] sm:w-[220px]",
          imgSize: isMobileBackground ? "h-9 w-7" : "h-10 w-9 sm:h-12 sm:w-10",
        };

    // Organic distribution across mobile screen width
    const mobileLeftPositions = [6, 48, 14, 52, 2, 42, 20, 58, 10, 36];
    const cardIndex = streamCards.findIndex((c) => c.id === card.id);
    const resolvedLeft = isMobileBackground
      ? `${mobileLeftPositions[cardIndex >= 0 ? cardIndex % mobileLeftPositions.length : 0]}%`
      : `${card.leftPercent}%`;

    return (
      <div
        key={isMobileBackground ? `mobile-${card.id}` : card.id}
        style={
          {
            position: "absolute",
            left: resolvedLeft,
            top: "0px",
            "--stream-duration": `${card.durationSec}s`,
            "--stream-delay": `${card.delaySec}s`,
            "--max-opacity": layerStyles.maxOpacity,
            "--rot": `${card.rotationDeg}deg`,
            "--scale": layerStyles.scale,
            zIndex: layerStyles.zIndex,
          } as React.CSSProperties
        }
        className={`animate-faculty-stream ${isMobileBackground ? "pointer-events-none select-none" : "cursor-pointer group"}`}
        onClick={() => !isMobileBackground && faculty && onViewFaculty(faculty)}
        title={!isMobileBackground && faculty ? `View ${faculty.name}` : undefined}
      >
        <div
          className={`flex items-center gap-3 rounded-xl border p-2.5 sm:p-3.5 transition-transform duration-200 ${
            isMobileBackground ? "" : "group-hover:scale-[1.02]"
          } ${layerStyles.border} ${layerStyles.bg} ${layerStyles.width}`}
        >
          {/* Faculty Photo Portrait */}
          <div
            className={`relative shrink-0 rounded-lg overflow-hidden border bg-[#0D1B2A] ${
              layerStyles.imgSize
            } ${isForeground ? "border-[#2D4564]" : "border-[#2D4564]/60"}`}
          >
            {card.avatarUrl ? (
              <Image
                src={card.avatarUrl}
                alt={card.name}
                fill
                className="object-cover object-top"
                sizes="70px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-xs text-[#EDE6DA]/40">
                {faculty?.initials || "EWU"}
              </div>
            )}
          </div>

          {/* Faculty Name, Designation & Editorial Burgundy Rating Badge */}
          <div className="min-w-0 flex-1">
            <p className="font-serif text-xs sm:text-sm font-bold text-[#EDE6DA] truncate leading-snug group-hover:text-white transition-colors">
              {card.name.replace(/^(Dr\.|Prof\.)\s*/, "")}
            </p>

            <p className="text-[11px] text-[#EDE6DA]/70 truncate mt-0.5 font-sans">
              {card.designation}
            </p>

            {/* Editorial Burgundy Star Rating (No AI gold/yellow!) */}
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md border border-[#8B2635]/50 bg-[#8B2635]/20 px-2 py-0.5">
              <div className="flex items-center gap-0.5 text-[#8B2635]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-[#8B2635] text-[#8B2635]"
                  />
                ))}
              </div>
              <span className="text-[10.5px] sm:text-[11px] font-bold text-[#EDE6DA] font-mono">
                {card.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative bg-[#0D1B2A] text-[#EDE6DA] pt-6 pb-6 sm:py-12 lg:py-16 border-b border-[#EDE6DA]/12 overflow-hidden">
      {/* Mobile Ambient Background Live Stream: subtle, elegant upward flow */}
      <div
        className="lg:hidden absolute inset-0 z-0 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Top and bottom subtle fade masks */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0D1B2A] via-[#0D1B2A]/90 to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/90 to-transparent z-10" />
        {/* Dark vignette to preserve 100% text contrast & search usability */}
        <div className="absolute inset-0 bg-[#0D1B2A]/65 z-10" />

        {/* Floating cards flowing in mobile background */}
        <div className="relative h-full w-full">
          {streamCards.map((card) => renderFloatingCard(card, true))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10 lg:items-center min-h-0 lg:min-h-[440px]">
          {/* Left Column: Solid Cream Headline + Single Burgundy Accent Word + Warm Cream Search */}
          <div className="lg:col-span-6 z-20">
            {/* Headline: Pure white (#FFFFFF) with burgundy accent word (#8B2635) */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight leading-[1.15]">
              <span className="text-white">Find &amp; Evaluate Faculty</span>{" "}
              <span className="text-[#8B2635] italic font-medium">Anonymously</span>
            </h1>

            {/* Main Objective of the Website */}
            <p className="mt-4 text-sm sm:text-base text-[#EDE6DA]/80 leading-relaxed max-w-lg font-sans">
              An independent, student-driven platform providing 100% anonymous faculty evaluations
              to help EWU students make informed section choices with confidence during advising.
            </p>

            {/* User-Friendly Warm Cream Search Box with Burgundy Focus */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onSearchSubmit) {
                  onSearchSubmit();
                } else {
                  const target = document.getElementById("faculty-directory");
                  if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }
              }}
              className="mt-7 max-w-lg"
            >
              <label htmlFor="hero-faculty-search" className="sr-only">
                Search faculty by name, initials, or research field
              </label>
              <div className="relative flex items-center rounded-xl bg-[#EDE6DA] border border-[#EDE6DA] px-4 py-3.5 shadow-sm focus-within:ring-2 focus-within:ring-[#8B2635]">
                <button
                  type="submit"
                  className="text-[#58667E] hover:text-[#0D1B2A] transition-colors shrink-0 mr-3 cursor-pointer"
                  title="Search and jump to results"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </button>
                <input
                  id="hero-faculty-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (onSearchSubmit) {
                        onSearchSubmit();
                      } else {
                        const target = document.getElementById("faculty-directory");
                        if (target) {
                          target.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }
                    }
                  }}
                  placeholder="Search faculty name, initials (MHAK, DSHR), or research field..."
                  className="w-full bg-transparent text-sm sm:text-base text-[#0D1B2A] placeholder-[#58667E] focus:outline-none font-sans"
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="p-1 text-[#58667E] hover:text-[#0D1B2A] transition-colors cursor-pointer shrink-0 ml-2"
                    title="Clear search"
                    aria-label="Clear search input"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Department Summary: Clean peer reviews stat */}
            <div className="mt-6 flex items-center gap-2 text-xs text-[#EDE6DA]/80 border-t border-[#EDE6DA]/12 pt-4 max-w-lg">
              <span>
                <strong className="text-[#EDE6DA] font-semibold">{reviewCount}</strong> Verified Peer Reviews &bull; Strictly Anonymous
              </span>
            </div>
          </div>

          {/* Right Column (DESKTOP ONLY): Interactive Live Faculty Flow */}
          <div className="hidden lg:block relative lg:col-span-6 h-[500px] w-full overflow-hidden select-none">
            {/* Top & Bottom Solid Fading Masks */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#0D1B2A] via-[#0D1B2A]/80 to-transparent z-30" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0D1B2A] via-[#0D1B2A]/80 to-transparent z-30" />

            {/* Continuous Upward Streaming Cards */}
            <div className="relative h-full w-full">
              {streamCards.map((card) => renderFloatingCard(card, false))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling Disclaimer Notice Ticker */}
      <div className="relative z-20 mt-6 sm:mt-0">
        <div className="overflow-hidden bg-white/95 border-t border-b border-[#0D1B2A]/10 py-2.5">
          <div className="animate-ticker whitespace-nowrap flex items-center gap-16">
            {[...Array(3)].map((_, copy) => (
              <span key={copy} className="inline-flex items-center gap-16 shrink-0 text-[12px] sm:text-[13px] font-medium text-[#0D1B2A] tracking-wide font-sans">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B2635] shrink-0" />
                  This is not an official university website
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B2635] shrink-0" />
                  All identities are strictly anonymous
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B2635] shrink-0" />
                  Not built to harm or disrespect any faculty member
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#8B2635] shrink-0" />
                  Free and honest student reviews shared in a professional manner
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
