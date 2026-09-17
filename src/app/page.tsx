"use client";

import React, { useState, useEffect, useMemo } from "react";
import { EWU_CSE_FACULTY } from "@/data/faculty";
import { FacultyMember, FacultyReview } from "@/types";
import { Navbar } from "@/components/Navbar";
import { FacultyCard } from "@/components/FacultyCard";
import { FacultyDetailModal } from "@/components/FacultyDetailModal";
import { ReviewModal } from "@/components/ReviewModal";
import { EmailVerificationModal } from "@/components/EmailVerificationModal";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";
import {
  subscribeToReviews,
  submitReviewToStore,
  updateReviewInStore,
  deleteReviewInStore,
} from "@/services/reviewService";
import { isStudentVerified, getVerificationState } from "@/services/verificationService";
import { auth } from "@/lib/firebase";
import { searchAndRankFaculty } from "@/lib/search";
import { HeroSection } from "@/components/HeroSection";
import { EwuLogo } from "@/components/EwuLogo";
import { ChevronDown } from "lucide-react";

export default function Home() {
  const facultyList = EWU_CSE_FACULTY;
  const [reviews, setReviews] = useState<FacultyReview[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"highest" | "lowest">("highest");
  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Selected faculty for detail & review modals
  const [activeFaculty, setActiveFaculty] = useState<FacultyMember | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);

  // Verification modal state for gating review submissions
  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);
  const [pendingReviewFaculty, setPendingReviewFaculty] = useState<FacultyMember | null>(null);

  // Student Privacy & Anonymity policy modal state
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);

  // Subscribe to real-time reviews from Firestore (with automatic localStorage backup)
  useEffect(() => {
    const validFacultyIds = new Set(EWU_CSE_FACULTY.map((f) => f.id));
    const unsubscribe = subscribeToReviews((liveReviews) => {
      // Filter out any orphaned reviews whose facultyId does not match the faculty directory
      const validReviews = liveReviews.filter((r) => validFacultyIds.has(r.facultyId));
      React.startTransition(() => {
        setReviews(validReviews);
      });
    });

    return () => unsubscribe();
  }, []);

  // Recalculate faculty ratings strictly from real student reviews
  const enrichedFacultyList = useMemo(() => {
    return facultyList.map((faculty) => {
      const facReviews = reviews.filter((r) => r.facultyId === faculty.id);
      if (facReviews.length === 0) {
        return {
          ...faculty,
          rating: 0,
          reviewCount: 0,
          breakdown: {
            teachingQuality: 0,
            examFairness: 0,
            gradingStrictness: 0,
            examGuarding: 0,
            behaviorWithStudents: 0,
          },
        };
      }

      const totalOverall = facReviews.reduce((sum, r) => sum + r.overallRating, 0);
      const avgOverall = Number((totalOverall / facReviews.length).toFixed(1));

      const avgTeaching = Number(
        (facReviews.reduce((sum, r) => sum + r.ratings.teachingQuality, 0) / facReviews.length).toFixed(1)
      );
      const avgFairness = Number(
        (facReviews.reduce((sum, r) => sum + r.ratings.examFairness, 0) / facReviews.length).toFixed(1)
      );
      const avgGrading = Number(
        (facReviews.reduce((sum, r) => sum + r.ratings.gradingStrictness, 0) / facReviews.length).toFixed(1)
      );
      const avgGuarding = Number(
        (facReviews.reduce((sum, r) => sum + r.ratings.examGuarding, 0) / facReviews.length).toFixed(1)
      );
      const avgBehavior = Number(
        (facReviews.reduce((sum, r) => sum + r.ratings.behaviorWithStudents, 0) / facReviews.length).toFixed(1)
      );

      return {
        ...faculty,
        rating: avgOverall,
        reviewCount: facReviews.length,
        breakdown: {
          teachingQuality: avgTeaching,
          examFairness: avgFairness,
          gradingStrictness: avgGrading,
          examGuarding: avgGuarding,
          behaviorWithStudents: avgBehavior,
        },
      };
    });
  }, [facultyList, reviews]);

  // Handle Review Submission (Persists to Firebase Firestore + Local fallback)
  const handleReviewSubmit = async (newReview: FacultyReview) => {
    // Optimistically update local view
    const updated = [newReview, ...reviews];
    setReviews(updated);
    // Persist via Firestore review service
    await submitReviewToStore(newReview);
  };

  // Handle Review Update (Edit review option)
  const handleReviewUpdate = async (updatedReview: FacultyReview) => {
    const updated = reviews.map((r) => (r.id === updatedReview.id ? updatedReview : r));
    setReviews(updated);
    await updateReviewInStore(updatedReview.id, updatedReview);
  };

  // Handle Review Deletion (Delete review option)
  const handleReviewDelete = async (reviewId: string) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    setReviews(updated);
    await deleteReviewInStore(reviewId);
  };

  // Initiate review with mandatory student verification & 1-review-per-faculty gate
  const handleInitiateReview = (faculty: FacultyMember) => {
    if (!isStudentVerified()) {
      setPendingReviewFaculty(faculty);
      setIsVerificationOpen(true);
      return;
    }

    // Check if the verified student has already reviewed this faculty member
    const verState = getVerificationState();
    const currentUser = auth?.currentUser;
    const currentEmail = (verState.email || currentUser?.email || "").toLowerCase().trim();

    if (currentEmail) {
      const alreadyReviewed = reviews.some(
        (r) =>
          r.facultyId === faculty.id &&
          r.userEmail &&
          r.userEmail.toLowerCase().trim() === currentEmail
      );

      if (alreadyReviewed) {
        alert(
          `You have already submitted an evaluation for ${faculty.name}. Each student can submit one evaluation per faculty. You can edit or delete your existing evaluation.`
        );
        setActiveFaculty(faculty);
        setIsDetailOpen(true);
        return;
      }
    }

    setActiveFaculty(faculty);
    setIsReviewOpen(true);
  };

  // Reset pagination to 10 items whenever search query or sort order changes
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, sortBy]);

  // Filter only faculty with genuine ratings
  const ratedFacultyList = useMemo(() => {
    return enrichedFacultyList.filter((f) => f.reviewCount > 0 && f.rating > 0);
  }, [enrichedFacultyList]);

  // Pre-calculate official top rank for rated faculty members (highest rating at top)
  const ratedRankMap = useMemo(() => {
    const map = new Map<string, number>();
    const rated = [...ratedFacultyList].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
    rated.forEach((f, idx) => {
      map.set(f.id, idx + 1);
    });
    return map;
  }, [ratedFacultyList]);

  // Pre-calculate lowest rank map for rated faculty (lowest rating at top)
  const lowestRankMap = useMemo(() => {
    const map = new Map<string, number>();
    const rated = [...ratedFacultyList].sort((a, b) => {
      if (a.rating !== b.rating) return a.rating - b.rating;
      return b.reviewCount - a.reviewCount;
    });
    rated.forEach((f, idx) => {
      map.set(f.id, idx + 1);
    });
    return map;
  }, [ratedFacultyList]);

  // Whether visitor is actively searching
  const isSearchActive = Boolean(searchQuery.trim());

  // Faculty to display:
  // - Default visit (no search): ONLY RATED FACULTY (reviewCount > 0), ranked highest or lowest based on sortBy
  // - When searching: ALL matching faculty members from the 56 CSE faculty directory
  const displayedFaculty = useMemo(() => {
    const query = searchQuery.trim();

    if (!query) {
      if (sortBy === "lowest") {
        return [...ratedFacultyList].sort((a, b) => {
          if (a.rating !== b.rating) return a.rating - b.rating;
          return b.reviewCount - a.reviewCount;
        });
      }

      // Default visit: ONLY rated faculty, ranked highest rating first
      return [...ratedFacultyList].sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });
    }

    // Active search: rank by search relevance score first, with exact initials/name at the very top
    return searchAndRankFaculty(enrichedFacultyList, query);
  }, [enrichedFacultyList, ratedFacultyList, searchQuery, sortBy]);

  // Paginated visible faculty list (starts at 10, expands on "See More")
  const visibleFaculty = useMemo(() => {
    return displayedFaculty.slice(0, visibleCount);
  }, [displayedFaculty, visibleCount]);

  const hasMore = displayedFaculty.length > visibleCount;

  const reviewedFacultyCount = enrichedFacultyList.filter((f) => f.reviewCount > 0).length;
  const avgDeptRating =
    reviewedFacultyCount > 0
      ? (
          enrichedFacultyList
            .filter((f) => f.reviewCount > 0)
            .reduce((acc, curr) => acc + curr.rating, 0) / reviewedFacultyCount
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#26334D] selection:bg-[#0E1A2E] selection:text-white">
      {/* Institutional Top Navigation (Compare feature removed) */}
      <Navbar
        facultyCount={enrichedFacultyList.length}
        reviewCount={reviews.length}
        onOpenVerification={() => setIsVerificationOpen(true)}
      />

      <main className="flex-1">
        {/* Institutional Hero */}
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          facultyList={enrichedFacultyList}
          onViewFaculty={(f) => {
            setActiveFaculty(f);
            setIsDetailOpen(true);
          }}
          reviewCount={reviews.length}
          avgDeptRating={avgDeptRating}
          onSearchSubmit={() => {
            const target = document.getElementById("faculty-directory");
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }}
        />

        {/* Main Faculty Section */}
        <section
          id="faculty-directory"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 scroll-mt-20"
        >
          {/* Section Heading, Summary, & Sort Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#0E1A2E]/10 pb-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0E1A2E]">
                {isSearchActive
                  ? `Search Results for "${searchQuery}"`
                  : sortBy === "lowest"
                  ? "Lowest Rated Faculty"
                  : "Top Rated Faculty Leaderboard"}
              </h2>
              <p className="text-xs text-[#58667E] mt-1 max-w-2xl">
                {isSearchActive
                  ? `Displaying matching faculty members. Click Rate or Profile to view or evaluate.`
                  : sortBy === "lowest"
                  ? `Faculty members with lowest average rating from student reviews (ascending 1.0 → 5.0).`
                  : `Top-ranked faculty based on genuine student reviews. To evaluate or view unrated faculty, use the search bar above.`}
              </p>
            </div>

            {/* Controls: Clear Search or Sort Dropdown */}
            <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
              {isSearchActive ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-semibold text-[#0E1A2E] hover:underline cursor-pointer"
                >
                  Clear Search &bull; Back to Leaderboard
                </button>
              ) : (
                <div className="relative">
                  <select
                    id="sort-faculty-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "highest" | "lowest")}
                    className="appearance-none bg-white border border-[#0E1A2E]/20 text-[#0E1A2E] text-xs font-semibold rounded-md pl-3 pr-8 py-2 shadow-2xs hover:border-[#0E1A2E]/40 focus:outline-none focus:ring-1 focus:ring-[#0E1A2E] cursor-pointer transition-colors"
                  >
                    <option value="highest">Top Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#58667E]" />
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Rectangular Cards Feed */}
          {visibleFaculty.length > 0 ? (
            <>
              <div className="flex flex-col gap-3.5 sm:gap-4">
                {visibleFaculty.map((faculty) => {
                  const currentRank = isSearchActive
                    ? ratedRankMap.get(faculty.id)
                    : sortBy === "lowest"
                    ? lowestRankMap.get(faculty.id)
                    : ratedRankMap.get(faculty.id);

                  return (
                    <FacultyCard
                      key={faculty.id}
                      faculty={faculty}
                      rank={currentRank}
                      rankVariant={sortBy === "lowest" && !isSearchActive ? "lowest" : "top"}
                      showActions={isSearchActive}
                      onViewDetails={(f) => {
                        setActiveFaculty(f);
                        setIsDetailOpen(true);
                      }}
                      onWriteReview={handleInitiateReview}
                    />
                  );
                })}
              </div>

              {/* Simple See More */}
              {hasMore && (
                <div className="mt-8 flex justify-center pt-6 border-t border-[#0E1A2E]/10">
                  <button
                    id="see-more-btn"
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 10)}
                    className="rounded-md bg-[#0E1A2E] hover:bg-[#1B2E44] active:scale-[0.98] text-white px-6 py-2.5 text-xs font-semibold shadow-xs hover:shadow transition-all cursor-pointer"
                  >
                    See More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-[#0E1A2E]/15 bg-white p-12 text-center max-w-xl mx-auto space-y-3">
              <h3 className="text-base font-serif font-bold text-[#0E1A2E]">
                {isSearchActive
                  ? `No faculty members match "${searchQuery}"`
                  : "No Faculty Members Rated Yet"}
              </h3>
              <p className="text-xs text-[#58667E] leading-relaxed">
                {isSearchActive
                  ? "Try searching by faculty initials (e.g. MHAK, DAWR, FHUQ) or partial name."
                  : "Search for any faculty member in the search bar above to submit the first anonymous evaluation!"}
              </p>
              {isSearchActive && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="rounded bg-[#0E1A2E] text-white px-4 py-2 text-xs font-medium hover:bg-[#16233B] transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Simple Note */}
          <div className="mt-10 text-center text-xs text-[#58667E] max-w-xl mx-auto">
            <p>
              Want to see your faculty on the leaderboard? Search above and add a review to get them ranked. Every evaluation is 100% anonymous and helps fellow students during course advising.
            </p>
          </div>
        </section>
      </main>

      {/* Institutional Deep Navy & Cream Footer */}
      <footer className="border-t border-[#EDE6DA]/12 bg-[#0D1B2A] text-[#EDE6DA]/70 py-10 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <EwuLogo variant="full" theme="badge" size="md" />
            <div>
              <p className="font-serif font-semibold text-[#EDE6DA] text-sm">
                East West University
              </p>
              <p className="text-[#EDE6DA]/60 mt-0.5">
                Department of Computer Science & Engineering &bull; Aftabnagar, Dhaka-1212
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1.5 text-center sm:text-right max-w-sm">
            <p className="text-[#EDE6DA]/50 text-[11px]">
              Independent academic feedback system. All student submissions remain strictly confidential &amp; anonymous.
            </p>
            <button
              type="button"
              onClick={() => setIsPrivacyOpen(true)}
              className="text-[11px] text-[#EDE6DA]/80 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              Privacy &amp; Anonymity Guarantee
            </button>
          </div>
        </div>
      </footer>

      {/* Simplified Faculty Profile & Reviews Detail Modal */}
      <FacultyDetailModal
        faculty={activeFaculty}
        reviews={reviews}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveFaculty(null);
        }}
        onWriteReview={handleInitiateReview}
        onUpdateReview={handleReviewUpdate}
        onDeleteReview={handleReviewDelete}
      />

      {/* Email Verification Gate Modal */}
      <EmailVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => {
          setIsVerificationOpen(false);
          setPendingReviewFaculty(null);
        }}
        facultyName={pendingReviewFaculty?.name}
        onVerified={() => {
          if (pendingReviewFaculty) {
            handleInitiateReview(pendingReviewFaculty);
            setPendingReviewFaculty(null);
          }
        }}
      />

      {/* Redesigned Teaching Evaluation Review Modal */}
      <ReviewModal
        faculty={activeFaculty}
        isOpen={isReviewOpen}
        onClose={() => {
          setIsReviewOpen(false);
          setActiveFaculty(null);
        }}
        onSubmitReview={handleReviewSubmit}
      />

      {/* Student Privacy & Anonymity Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
