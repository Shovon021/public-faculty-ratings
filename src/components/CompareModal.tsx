"use client";

import React, { useEffect } from "react";
import { FacultyMember } from "@/types";
import { RatingMeter } from "./RatingMeter";
import { EwuLogo } from "./EwuLogo";
import {
  X,
  Star,
  Sparkles,
  Scale,
  GraduationCap,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  ArrowRightLeft,
  Trash2,
  Mail,
} from "lucide-react";

interface CompareModalProps {
  facultyList: FacultyMember[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (facultyId: string) => void;
  onClearAll: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  facultyList,
  isOpen,
  onClose,
  onRemove,
  onClearAll,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#0E1A2E]/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg border border-[#0E1A2E]/20 bg-white shadow-2xl overflow-hidden text-[#26334D]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Solid Ink Navy */}
        <div className="flex items-center justify-between border-b border-[#0E1A2E] p-5 bg-[#0E1A2E] text-white">
          <div className="flex items-center gap-3">
            <EwuLogo variant="crest" size="md" />
            <div>
              <span className="text-[11px] text-[#9B6E18] font-medium block">
                East West University &bull; Academic Advising
              </span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-white">
                Faculty Section Comparison
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {facultyList.length > 0 && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 rounded border border-white/20 px-2.5 py-1 text-xs text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1 bg-[#F7F8FA]">
          {facultyList.length === 0 ? (
            <div className="py-16 text-center text-[#58667E] space-y-3">
              <ArrowRightLeft className="h-10 w-10 text-[#58667E]/50 mx-auto" />
              <p className="text-sm font-medium text-[#26334D]">
                No faculty selected for section comparison
              </p>
              <p className="text-xs text-[#58667E] max-w-sm mx-auto">
                Click the <strong>Compare</strong> button on any faculty profile card to evaluate up to 3 faculty members side-by-side.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Cards Grid */}
              <div
                className={`grid grid-cols-1 ${
                  facultyList.length === 2
                    ? "sm:grid-cols-2"
                    : facultyList.length >= 3
                    ? "sm:grid-cols-3"
                    : "sm:grid-cols-1 max-w-md mx-auto"
                } gap-4`}
              >
                {facultyList.map((f) => (
                  <div
                    key={f.id}
                    className="relative flex flex-col justify-between rounded-lg bg-white border border-[#0E1A2E]/10 p-4"
                  >
                    <button
                      onClick={() => onRemove(f.id)}
                      className="absolute top-3 right-3 rounded p-1 text-[#58667E] hover:text-[#0E1A2E] hover:bg-[#F7F8FA] transition-colors"
                      title="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden border border-[#0E1A2E]/15 bg-[#F7F8FA]">
                        {f.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={f.avatarUrl}
                            alt={f.name}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover object-top"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#0E1A2E] font-serif font-bold text-white text-xs">
                            {f.initials}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="rounded bg-[#0E1A2E]/5 border border-[#0E1A2E]/15 px-1.5 py-0.2 text-[10px] font-bold text-[#0E1A2E]">
                            {f.initials}
                          </span>
                          <span className="text-xs text-[#58667E] truncate">{f.designation}</span>
                        </div>
                        <h3 className="text-sm font-serif font-bold text-[#0E1A2E] mt-1 line-clamp-1">
                          {f.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-[#58667E] mt-0.5">
                          <Mail className="h-3 w-3 text-[#58667E] shrink-0" />
                          <span className="truncate">{f.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#0E1A2E]/10 flex items-center justify-between">
                      <span className="text-xs text-[#58667E] font-medium">Overall Rating</span>
                      {f.reviewCount > 0 ? (
                        <div className="inline-flex items-center gap-1 rounded bg-[#FBF6ED] border border-[#9B6E18]/30 px-2 py-0.5 text-[#9B6E18] text-xs font-bold">
                          <Star className="h-3 w-3 fill-[#9B6E18]" />
                          {f.rating.toFixed(1)}
                        </div>
                      ) : (
                        <span className="rounded bg-[#F0F2F5] border border-[#0E1A2E]/10 px-2 py-0.5 text-[11px] font-medium text-[#58667E]">
                          Unrated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Side-by-side metric comparison */}
              <div className="rounded-lg bg-white border border-[#0E1A2E]/10 p-5 space-y-4">
                <h4 className="text-xs font-semibold text-[#0E1A2E] uppercase tracking-normal">
                  Comparative Academic Metrics
                </h4>

                {/* Teaching Quality */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0E1A2E]">
                    <Sparkles className="h-3.5 w-3.5 text-[#58667E]" />
                    Teaching Quality & Clarity
                  </div>
                  <div
                    className={`grid grid-cols-1 ${
                      facultyList.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
                    } gap-3`}
                  >
                    {facultyList.map((f) => (
                      <RatingMeter
                        key={f.id}
                        label={f.initials}
                        value={f.breakdown.teachingQuality}
                      />
                    ))}
                  </div>
                </div>

                {/* Exam Fairness */}
                <div className="space-y-2 pt-2 border-t border-[#0E1A2E]/10">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0E1A2E]">
                    <Scale className="h-3.5 w-3.5 text-[#58667E]" />
                    Exam Fairness
                  </div>
                  <div
                    className={`grid grid-cols-1 ${
                      facultyList.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
                    } gap-3`}
                  >
                    {facultyList.map((f) => (
                      <RatingMeter
                        key={f.id}
                        label={f.initials}
                        value={f.breakdown.examFairness}
                      />
                    ))}
                  </div>
                </div>

                {/* Grading Strictness */}
                <div className="space-y-2 pt-2 border-t border-[#0E1A2E]/10">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0E1A2E]">
                    <GraduationCap className="h-3.5 w-3.5 text-[#58667E]" />
                    Grading Strictness
                  </div>
                  <div
                    className={`grid grid-cols-1 ${
                      facultyList.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
                    } gap-3`}
                  >
                    {facultyList.map((f) => (
                      <RatingMeter
                        key={f.id}
                        label={f.initials}
                        value={f.breakdown.gradingStrictness}
                      />
                    ))}
                  </div>
                </div>

                {/* Exam Guarding */}
                <div className="space-y-2 pt-2 border-t border-[#0E1A2E]/10">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0E1A2E]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#58667E]" />
                    Exam Guarding & Invigilation
                  </div>
                  <div
                    className={`grid grid-cols-1 ${
                      facultyList.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
                    } gap-3`}
                  >
                    {facultyList.map((f) => (
                      <RatingMeter
                        key={f.id}
                        label={f.initials}
                        value={f.breakdown.examGuarding}
                      />
                    ))}
                  </div>
                </div>

                {/* Behavior */}
                <div className="space-y-2 pt-2 border-t border-[#0E1A2E]/10">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#0E1A2E]">
                    <HeartHandshake className="h-3.5 w-3.5 text-[#58667E]" />
                    Student Support & Guidance
                  </div>
                  <div
                    className={`grid grid-cols-1 ${
                      facultyList.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
                    } gap-3`}
                  >
                    {facultyList.map((f) => (
                      <RatingMeter
                        key={f.id}
                        label={f.initials}
                        value={f.breakdown.behaviorWithStudents}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
