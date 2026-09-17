"use client";

import React, { useState, useEffect, useMemo } from "react";
import { FacultyMember, FacultyReview } from "@/types";
import { EwuLogo } from "./EwuLogo";
import { FacultyAvatar } from "./FacultyAvatar";
import {
  X,
  Star,
  Mail,
  ExternalLink,
  MessageSquare,
  Shield,
  Calendar,
  Plus,
  Edit3,
  Trash2,
  Check,
  RotateCcw,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { getVerificationState } from "@/services/verificationService";
import { auth } from "@/lib/firebase";

interface FacultyDetailModalProps {
  faculty: FacultyMember | null;
  reviews: FacultyReview[];
  isOpen: boolean;
  onClose: () => void;
  onWriteReview: (faculty: FacultyMember) => void;
  onUpdateReview?: (updatedReview: FacultyReview) => void;
  onDeleteReview?: (reviewId: string) => void;
}

// Curated demo student profile avatars for reviews
const DEMO_AVATARS = [
  {
    name: "Alex",
    color: "#3B82F6",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Rahim",
    color: "#10B981",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Tanvir",
    color: "#F59E0B",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Nusrat",
    color: "#8B5CF6",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    name: "Fahim",
    color: "#EC4899",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  },
];


export const FacultyDetailModal: React.FC<FacultyDetailModalProps> = ({
  faculty,
  reviews,
  isOpen,
  onClose,
  onWriteReview,
  onUpdateReview,
  onDeleteReview,
}) => {
  const [errorFacultyId, setErrorFacultyId] = useState<string | null>(null);

  // Review editing state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState<number>(5.0);
  const [editComment, setEditComment] = useState<string>("");
  const [editError, setEditError] = useState<string>("");
  const [avatarErrors, setAvatarErrors] = useState<Record<string, boolean>>({});

  // Review deletion state
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  // Current authenticated student email and ID
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const state = getVerificationState();
      const user = auth?.currentUser;
      const email = (state.email || user?.email || "").toLowerCase().trim();
      setCurrentUserEmail(email);
      setCurrentUserId(user?.uid || "");
    }
  }, [isOpen]);

  // Close on Escape key press
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

  const facultyReviews = useMemo(() => {
    if (!faculty) return [];
    return reviews.filter((r) => r.facultyId === faculty.id);
  }, [faculty, reviews]);

  // Check if current student has already reviewed this faculty
  const myExistingReview = useMemo(() => {
    if (!currentUserEmail && !currentUserId) return null;
    return facultyReviews.find(
      (r) =>
        (currentUserId && r.userId && r.userId === currentUserId) ||
        (currentUserEmail && r.userEmail && r.userEmail.toLowerCase().trim() === currentUserEmail)
    );
  }, [facultyReviews, currentUserEmail, currentUserId]);

  if (!isOpen || !faculty) return null;

  // Start editing a review
  const handleStartEdit = (rev: FacultyReview) => {
    setEditingReviewId(rev.id);
    setEditRating(rev.overallRating);
    setEditComment(rev.comment);
    setEditError("");
  };

  // Cancel review editing
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditError("");
  };

  // Save edited review
  const handleSaveEdit = (rev: FacultyReview) => {
    if (!editComment.trim() || editComment.trim().length < 10) {
      setEditError("Review comment must be at least 10 characters.");
      return;
    }

    const updated: FacultyReview = {
      ...rev,
      overallRating: editRating,
      comment: editComment.trim(),
      ratings: {
        ...rev.ratings,
        teachingQuality: editRating,
        examFairness: editRating,
      },
    };

    if (onUpdateReview) {
      onUpdateReview(updated);
    }

    setEditingReviewId(null);
    setEditError("");
  };

  // Confirm delete review
  const handleConfirmDelete = (reviewId: string) => {
    if (onDeleteReview) {
      onDeleteReview(reviewId);
    }
    setDeletingReviewId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#0E1A2E]/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl border border-[#0E1A2E]/20 bg-white shadow-2xl overflow-hidden text-[#26334D]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Solid Deep Navy Band (#0D1B2A) with Cream (#EDE6DA) and Burgundy (#8B2635) */}
        <div className="relative bg-[#0D1B2A] p-5 sm:p-6 text-[#EDE6DA] border-b border-[#EDE6DA]/15">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-1 text-[#EDE6DA]/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Faculty Photo / Academic Avatar */}
              <div className="relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 rounded-xl overflow-hidden border border-[#2D4564] bg-[#1B2E44] shadow-md">
                <FacultyAvatar faculty={faculty} />
              </div>

              {/* Faculty Info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <EwuLogo variant="crest" size="sm" />
                  <span className="text-[11px] text-[#EDE6DA]/70 font-medium tracking-wide">
                    East West University &bull; Faculty Evaluation
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#EDE6DA] leading-tight">
                    {faculty.name}
                  </h2>
                  <span className="rounded bg-[#1B2E44] border border-[#2D4564] px-1.5 py-0.5 text-xs font-mono font-bold text-[#EDE6DA]">
                    {faculty.initials}
                  </span>
                </div>

                <p className="text-xs text-[#EDE6DA]/80 mt-1 font-sans">
                  {faculty.designation} {faculty.role && `(${faculty.role})`}
                </p>

                {/* Email and Official Profile (Room number completely removed!) */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#EDE6DA]/70 mt-2.5 font-sans">
                  <a
                    href={`mailto:${faculty.email}`}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5 text-[#8B2635]" />
                    <span>{faculty.email}</span>
                  </a>
                  {faculty.profileUrl && (
                    <a
                      href={faculty.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#EDE6DA] hover:underline font-medium"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-[#8B2635]" />
                      <span>EWU Profile</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Write Review Action: Enforce 1 review per faculty per student */}
            {myExistingReview ? (
              <button
                onClick={() => handleStartEdit(myExistingReview)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1B2E44] hover:bg-[#2D4564] text-[#EDE6DA] border border-[#2D4564] px-3.5 py-2 text-xs font-bold transition-colors shrink-0 self-start sm:self-center cursor-pointer"
                title="You have already reviewed this faculty. Click to edit your review."
              >
                <Edit3 className="h-3.5 w-3.5 text-[#8B2635]" />
                <span>Edit Your Review</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onWriteReview(faculty);
                }}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#8B2635] hover:bg-[#731E2B] text-[#EDE6DA] px-4 py-2 text-xs font-bold shadow-xs transition-colors shrink-0 self-start sm:self-center cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Evaluate Faculty</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Clean layout with Overall Rating & Student Written Reviews */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 bg-[#F7F8FA]">
          {/* 1. OVERALL RATING CARD */}
          <div className="rounded-xl border border-[#0E1A2E]/10 bg-white p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-[#58667E] uppercase tracking-wider block mb-1">
                  Overall Student Rating
                </span>
                {faculty.reviewCount > 0 ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-[#0E1A2E] tabular-nums">
                      {faculty.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-[#58667E] font-medium">/ 5.0</span>
                  </div>
                ) : (
                  <span className="text-xl font-serif font-bold text-[#0E1A2E]">
                    Unrated
                  </span>
                )}
              </div>

              {/* Star visuals & Review count */}
              <div className="flex flex-col sm:items-end">
                {faculty.reviewCount > 0 ? (
                  <>
                    <div className="flex items-center gap-1 text-[#8B2635] mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(faculty.rating)
                              ? "fill-[#8B2635] text-[#8B2635]"
                              : "text-[#D1D5DB]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-[#58667E]">
                      Based on <strong>{faculty.reviewCount}</strong> verified student{" "}
                      {faculty.reviewCount === 1 ? "review" : "reviews"}
                    </span>
                  </>
                ) : (
                  <p className="text-xs text-[#58667E]">
                    Awaiting evaluations from EWU students
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. ALL STUDENT WRITTEN REVIEWS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#0D1B2A]/10 pb-2.5">
              <h3 className="text-sm font-serif font-bold text-[#0D1B2A] flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#8B2635]" />
                <span>Student Written Reviews ({facultyReviews.length})</span>
              </h3>
              <span className="text-[11px] text-[#58667E] flex items-center gap-1">
                <span>Strictly Anonymous Feedback</span>
              </span>
            </div>

            {facultyReviews.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#0D1B2A]/15 p-8 text-center bg-white space-y-3">
                <p className="text-xs text-[#58667E]">
                  No written evaluations submitted for {faculty.name} yet.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onWriteReview(faculty);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D1B2A] hover:bg-[#1B2E44] text-[#EDE6DA] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Be the first to write a review</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {facultyReviews.map((rev, idx) => {
                  const avatarInfo = DEMO_AVATARS[idx % DEMO_AVATARS.length];
                  const isEditing = editingReviewId === rev.id;
                  const isDeleting = deletingReviewId === rev.id;

                  // Check if current student is the author of this review
                  // (Enforces: user can only edit and delete their own review)
                  const isOwner = Boolean(
                    (currentUserId && rev.userId && rev.userId === currentUserId) ||
                    (currentUserEmail &&
                      rev.userEmail &&
                      rev.userEmail.toLowerCase().trim() === currentUserEmail)
                  );

                  return (
                    <div
                      key={rev.id}
                      className={`rounded-xl bg-white border p-4 sm:p-5 shadow-xs transition-all space-y-3 ${
                        isOwner ? "border-[#8B2635]/35 bg-[#8B2635]/5" : "border-[#0D1B2A]/10"
                      }`}
                    >
                      {/* Delete Confirmation Box */}
                      {isDeleting ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3 animate-fade-in">
                          <div className="flex items-start gap-2.5 text-red-800">
                            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold">Delete this evaluation?</p>
                              <p className="text-[11px] text-red-700/80 mt-0.5">
                                This will permanently remove your evaluation from {faculty.name}&apos;s profile.
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setDeletingReviewId(null)}
                              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfirmDelete(rev.id)}
                              className="rounded-md bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs"
                            >
                              Yes, Delete
                            </button>
                          </div>
                        </div>
                      ) : isEditing ? (
                        /* INLINE REVIEW EDIT MODE */
                        <div className="space-y-3.5 animate-fade-in">
                          <div className="flex items-center justify-between border-b border-[#0D1B2A]/10 pb-2">
                            <span className="text-xs font-serif font-bold text-[#0D1B2A] flex items-center gap-1.5">
                              <Edit3 className="h-3.5 w-3.5 text-[#8B2635]" />
                              <span>Edit Your Evaluation</span>
                            </span>
                            <span className="text-[11px] text-[#58667E]">
                              Updates immediately
                            </span>
                          </div>

                          {/* Editable Rating */}
                          <div className="flex items-center justify-between bg-[#F7F8FA] p-3 rounded-lg border border-[#0D1B2A]/10">
                            <span className="text-xs font-medium text-[#26334D]">
                              Overall Rating
                            </span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((starVal) => (
                                <button
                                  type="button"
                                  key={starVal}
                                  onClick={() => setEditRating(starVal)}
                                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                                  title={`Rate ${starVal} Stars`}
                                >
                                  <Star
                                    className={`h-5 w-5 ${
                                      starVal <= Math.round(editRating)
                                        ? "fill-[#8B2635] text-[#8B2635]"
                                        : "text-[#D1D5DB]"
                                    }`}
                                  />
                                </button>
                              ))}
                              <span className="ml-1 text-xs font-bold text-[#0D1B2A] font-mono">
                                {editRating.toFixed(1)} / 5.0
                              </span>
                            </div>
                          </div>

                          {/* Editable Written Comment */}
                          <div>
                            <label className="block text-[11px] font-semibold text-[#26334D] mb-1">
                              Written Review &amp; Advice
                            </label>
                            <textarea
                              rows={3}
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              className="w-full rounded-lg border border-[#0D1B2A]/20 bg-white p-3 text-xs text-[#26334D] focus:border-[#8B2635] focus:outline-none"
                              placeholder="Update your advice for future students..."
                            />
                          </div>

                          {editError && (
                            <p className="text-xs text-red-600 font-medium">
                              {editError}
                            </p>
                          )}

                          {/* Edit Actions: Save / Cancel */}
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="flex items-center gap-1 rounded-lg border border-[#0D1B2A]/20 px-3 py-1.5 text-xs text-[#58667E] hover:bg-[#F7F8FA] cursor-pointer"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Cancel</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(rev)}
                              className="flex items-center gap-1.5 rounded-lg bg-[#8B2635] hover:bg-[#731E2B] px-4 py-1.5 text-xs font-semibold text-[#EDE6DA] shadow-xs cursor-pointer"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Save Changes</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* NORMAL REVIEW DISPLAY WITH DEMO PROFILE PICTURE & EDIT/DELETE OPTIONS */
                        <>
                          {/* Student Info Bar */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Demo Profile Picture */}
                              <div className="relative h-9 w-9 rounded-full overflow-hidden border border-[#0D1B2A]/15 bg-[#F0F2F5] shrink-0 shadow-xs flex items-center justify-center">
                                {!avatarErrors[rev.id] ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={avatarInfo.url}
                                    alt="Student Avatar"
                                    referrerPolicy="no-referrer"
                                    onError={() =>
                                      setAvatarErrors((prev) => ({
                                        ...prev,
                                        [rev.id]: true,
                                      }))
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div
                                    className="h-full w-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ backgroundColor: avatarInfo.color }}
                                  >
                                    {avatarInfo.name.charAt(0)}
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-xs text-[#0D1B2A]">
                                    {isOwner ? "Your Evaluation" : "Anonymous Student"}
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[10px] font-medium text-emerald-700">
                                    <UserCheck className="h-2.5 w-2.5" />
                                    <span>Verified CSE</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 text-[11px] text-[#58667E] mt-0.5">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {rev.createdAt.includes("T")
                                      ? new Date(rev.createdAt).toLocaleDateString()
                                      : rev.createdAt}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Rating and Edit/Delete Options (Only for owner!) */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center gap-1 rounded-full bg-[#8B2635]/10 border border-[#8B2635]/30 px-2.5 py-1 text-xs font-bold text-[#8B2635]">
                                <Star className="h-3.5 w-3.5 fill-[#8B2635]" />
                                <span>{rev.overallRating.toFixed(1)}</span>
                              </div>

                              {/* Only show Edit & Delete buttons if current user is the owner */}
                              {isOwner && (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEdit(rev)}
                                    className="flex items-center gap-1 rounded-lg border border-[#0E1A2E]/15 bg-white hover:bg-[#F7F8FA] px-2 py-1 text-xs text-[#0E1A2E] font-medium shadow-2xs transition-colors cursor-pointer"
                                    title="Edit your review"
                                  >
                                    <Edit3 className="h-3 w-3 text-[#58667E]" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingReviewId(rev.id)}
                                    className="flex items-center gap-1 rounded-lg border border-red-200 bg-white hover:bg-red-50 px-2 py-1 text-xs text-red-600 font-medium shadow-2xs transition-colors cursor-pointer"
                                    title="Delete your review"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                    <span className="hidden sm:inline">Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Written Feedback text */}
                          <p className="text-xs sm:text-sm text-[#26334D] leading-relaxed bg-[#F7F8FA] p-3.5 rounded-lg border border-[#0E1A2E]/5">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
