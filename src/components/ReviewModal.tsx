"use client";

import React, { useState } from "react";
import { FacultyMember, FacultyReview } from "@/types";
import {
  X,
  Star,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { EwuLogo } from "./EwuLogo";
import { getVerificationState } from "@/services/verificationService";
import { auth } from "@/lib/firebase";

interface ReviewModalProps {
  faculty: FacultyMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (review: FacultyReview) => void;
}


export const ReviewModal: React.FC<ReviewModalProps> = ({
  faculty,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  // Initially all sliders in the middle position (3.0 / 5.0)
  const [teachingQuality, setTeachingQuality] = useState<number>(3.0);
  const [examFairness, setExamFairness] = useState<number>(3.0);
  const [gradingStrictness, setGradingStrictness] = useState<number>(3.0);
  const [examGuarding, setExamGuarding] = useState<number>(3.0);
  const [behaviorWithStudents, setBehaviorWithStudents] = useState<number>(3.0);
  const [comment, setComment] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Reset all sliders to middle position (3.0) whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTeachingQuality(3.0);
      setExamFairness(3.0);
      setGradingStrictness(3.0);
      setExamGuarding(3.0);
      setBehaviorWithStudents(3.0);
      setComment("");
      setError("");
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setTeachingQuality(3.0);
    setExamFairness(3.0);
    setGradingStrictness(3.0);
    setExamGuarding(3.0);
    setBehaviorWithStudents(3.0);
    setSubmitted(false);
    setError("");
    setComment("");
    onClose();
  };

  if (!isOpen || !faculty) return null;

  // Compute overall score
  const overallRating = Number(
    (
      (teachingQuality +
        examFairness +
        gradingStrictness +
        examGuarding +
        behaviorWithStudents) /
      5
    ).toFixed(1)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || comment.trim().length < 15) {
      setError("Please write at least 15 characters of constructive academic feedback.");
      return;
    }

    // Get current verified student email for 1-review-per-faculty & edit/delete ownership
    const verState = getVerificationState();
    const currentUser = auth?.currentUser;
    const userEmail = (verState.email || currentUser?.email || "").toLowerCase().trim();

    const newReview: FacultyReview = {
      id: `rev-${Date.now()}`,
      facultyId: faculty.id,
      ratings: {
        teachingQuality,
        examFairness,
        gradingStrictness,
        examGuarding,
        behaviorWithStudents,
      },
      overallRating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      author: "Anonymous Student",
      userEmail,
      userId: currentUser?.uid || "",
    };

    onSubmitReview(newReview);
    setSubmitted(true);
    setTimeout(() => {
      handleClose();
    }, 1200);
  };

  const renderSlider = (
    label: string,
    description: string,
    value: number,
    setter: (val: number) => void,
    lowLabel: string = "Strict / Low",
    highLabel: string = "Excellent / Generous"
  ) => (
    <div className="rounded-lg border border-[#0D1B2A]/10 bg-[#F7F8FA] p-3.5 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-xs sm:text-sm text-[#0D1B2A] block">{label}</span>
          <p className="text-[11.5px] text-[#58667E] leading-relaxed mt-1 font-sans">
            {description}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="inline-flex items-center rounded-md bg-[#0D1B2A]/5 border border-[#0D1B2A]/10 px-2 py-0.5 text-xs font-bold font-mono text-[#0D1B2A]">
            {value.toFixed(1)} <span className="text-[10px] text-[#58667E] font-normal ml-0.5">/ 5.0</span>
          </span>
        </div>
      </div>
      <input
        type="range"
        min="1.0"
        max="5.0"
        step="0.1"
        value={value}
        onChange={(e) => setter(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-[#0D1B2A]/15 rounded-sm appearance-none cursor-pointer accent-[#8B2635]"
      />
      <div className="flex justify-between text-[10.5px] text-[#58667E] pt-0.5 font-medium">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#0E1A2E]/60 backdrop-blur-xs"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-lg border border-[#0E1A2E]/20 bg-white shadow-2xl overflow-hidden text-[#26334D]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Solid Deep Navy Band */}
        <div className="flex items-center justify-between border-b border-[#EDE6DA]/15 p-5 bg-[#0D1B2A] text-[#EDE6DA]">
          <div className="flex items-center gap-3">
            <EwuLogo variant="crest" size="sm" />
            <div>
              <span className="text-[11px] text-[#EDE6DA]/70 font-medium block">
                East West University &bull; Teaching Evaluation
              </span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#EDE6DA] mt-0.5">
                {faculty.name} ({faculty.initials})
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded p-1 text-[#EDE6DA]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-[#8B2635]" />
            <h3 className="text-xl font-serif font-bold text-[#0D1B2A]">
              Evaluation Submitted
            </h3>
            <p className="text-xs text-[#58667E] max-w-sm">
              Your anonymous evaluation has been recorded and will immediately update the faculty member&apos;s ratings.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
            {/* Overall Computed Rating Preview */}
            <div className="flex items-center justify-between rounded border border-[#0D1B2A]/10 bg-[#F7F8FA] p-3.5">
              <div>
                <span className="text-xs text-[#58667E] font-medium block">
                  Calculated Overall Score
                </span>
                <span className="text-2xl font-serif font-bold text-[#0D1B2A] tabular-nums">
                  {overallRating.toFixed(1)} <span className="text-xs text-[#58667E] font-sans">/ 5.0</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#8B2635]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(overallRating)
                        ? "fill-[#8B2635] text-[#8B2635]"
                        : "text-[#D1D5DB]"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 5 Evaluation Sliders with Proper Descriptive Sentences */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#0D1B2A]">
                Rate Teaching &amp; Course Factors
              </h4>
              {renderSlider(
                "Teaching Quality",
                "How clear the teacher's lectures are and how well they explain topics.",
                teachingQuality,
                setTeachingQuality,
                "Unclear / Difficult",
                "Clear & Engaging"
              )}
              {renderSlider(
                "Exam & Syllabus Relevance",
                "If the exam questions match the syllabus and what was taught in class.",
                examFairness,
                setExamFairness,
                "Irrelevant / Unfair",
                "Well-Aligned & Fair"
              )}
              {renderSlider(
                "Grading Fairness",
                "How fair and reasonable the grading is.",
                gradingStrictness,
                setGradingStrictness,
                "Very Strict / Harsh",
                "Fair / Rewarding"
              )}
              {renderSlider(
                "Exam Invigilation",
                "How strict the teacher is during exams and if they help students when needed.",
                examGuarding,
                setExamGuarding,
                "High Pressure / Strict",
                "Supportive & Calm"
              )}
              {renderSlider(
                "Personality & Behavior",
                "How friendly, kind, and approachable the teacher is.",
                behaviorWithStudents,
                setBehaviorWithStudents,
                "Distant / Harsh",
                "Approachable & Kind"
              )}
            </div>

            {/* Written Advice */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#26334D] flex items-center justify-between">
                <span>Written Feedback &amp; Advising Tips</span>
                <span className="text-[10px] text-[#58667E]">Minimum 15 characters</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share helpful guidance for future students: lecture style, preparation tips, lab assessments, etc."
                className="w-full rounded border border-[#0D1B2A]/20 bg-white p-3 text-xs text-[#26334D] placeholder-[#58667E] focus:border-[#8B2635] focus:outline-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded border border-[#991B1B]/20 bg-[#FEF2F2] p-2.5 text-xs text-[#991B1B]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Privacy notice */}
            <div className="flex items-start gap-2 rounded border border-[#0D1B2A]/10 bg-[#F7F8FA] p-2.5 text-xs text-[#58667E]">
              <span>
                <strong>Confidential Evaluation:</strong> All reviews are published strictly as &ldquo;Anonymous Student&rdquo;. Your student ID or email is never attached to this submission.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#0D1B2A]/10">
              <button
                type="button"
                onClick={handleClose}
                className="rounded border border-[#0D1B2A]/20 bg-white px-3.5 py-1.5 text-xs font-medium text-[#26334D] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-[#8B2635] hover:bg-[#731E2B] px-4 py-1.5 text-xs font-medium text-[#EDE6DA] transition-colors shadow-xs cursor-pointer"
              >
                Submit Evaluation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
