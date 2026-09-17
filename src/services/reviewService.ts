import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, orderBy, DocumentData } from "firebase/firestore";
import { db, auth, isFirebaseConfigured } from "@/lib/firebase";
import { FacultyReview, RatingBreakdown } from "@/types";

const LOCAL_STORAGE_KEY = "ewu_faculty_reviews_v1";

/**
 * Fallback to read from local storage
 */
export function getLocalReviews(): FacultyReview[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FacultyReview[]) : [];
  } catch {
    return [];
  }
}

/**
 * Fallback to save in local storage
 */
export function saveLocalReviews(reviews: FacultyReview[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // ignore
  }
}

/**
 * Real-time listener for all reviews from Firestore (with localStorage fallback)
 */
export function subscribeToReviews(onUpdate: (reviews: FacultyReview[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  // If Firebase is configured and Firestore is available, use real-time onSnapshot
  if (isFirebaseConfigured && db) {
    try {
      const reviewsCol = collection(db, "reviews");
      const q = query(reviewsCol, orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const remoteReviews: FacultyReview[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data() as DocumentData;
            remoteReviews.push({
              id: doc.id,
              facultyId: data.facultyId,
              ratings: data.ratings,
              overallRating: data.overallRating,
              comment: data.comment,
              createdAt: data.createdAt || new Date().toISOString(),
              author: "Anonymous Student",
              semester: data.semester || "",
              userEmail: data.userEmail || "",
              userId: data.userId || "",
            });
          });

          // Sync local storage as backup
          saveLocalReviews(remoteReviews);
          onUpdate(remoteReviews);
        },
        (error) => {
          // Firestore unavailable — fall back to local storage
          onUpdate(getLocalReviews());
        }
      );

      return unsubscribe;
    } catch (e) {
      // Firestore listener setup failed — fall back to local
    }
  }

  // Otherwise, load from local storage
  const local = getLocalReviews();
  onUpdate(local);

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY) {
      onUpdate(getLocalReviews());
    }
  };
  window.addEventListener("storage", handleStorageEvent);
  return () => window.removeEventListener("storage", handleStorageEvent);
}

/**
 * Submit a new student review
 */
export async function submitReviewToStore(
  reviewData: Omit<FacultyReview, "id" | "createdAt" | "author">
): Promise<FacultyReview> {
  const currentUid = auth?.currentUser?.uid || "";
  const newReview: FacultyReview = {
    ...reviewData,
    id: "rev-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    createdAt: new Date().toISOString(),
    author: "Anonymous Student",
    userId: reviewData.userId || currentUid,
  };

  // If Firebase is active, persist to Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, "reviews"), {
        facultyId: newReview.facultyId,
        ratings: newReview.ratings,
        overallRating: newReview.overallRating,
        comment: newReview.comment,
        semester: newReview.semester || "",
        createdAt: newReview.createdAt,
        userId: newReview.userId || currentUid,
        userEmail: newReview.userEmail || "",
      });
      newReview.id = docRef.id;
    } catch (err) {
      // Firestore write failed — saved locally as fallback
    }
  }

  // Also save locally
  const current = getLocalReviews();
  const updated = [newReview, ...current];
  saveLocalReviews(updated);

  return newReview;
}

/**
 * Delete a student review
 */
export async function deleteReviewInStore(reviewId: string): Promise<boolean> {
  // If Firebase is configured, delete from Firestore
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
    } catch (err) {
      // Firestore delete failed — removed locally
    }
  }

  // Delete from local storage
  const current = getLocalReviews();
  const filtered = current.filter((r) => r.id !== reviewId);
  saveLocalReviews(filtered);

  return true;
}

/**
 * Update an existing student review (Edit option)
 */
export async function updateReviewInStore(
  reviewId: string,
  updatedData: Partial<FacultyReview>
): Promise<boolean> {
  // If Firebase is configured, update in Firestore
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "reviews", reviewId);
      const firestoreData: Record<string, unknown> = {};
      if (updatedData.comment !== undefined) firestoreData.comment = updatedData.comment;
      if (updatedData.overallRating !== undefined) firestoreData.overallRating = updatedData.overallRating;
      if (updatedData.ratings !== undefined) firestoreData.ratings = updatedData.ratings;
      if (updatedData.semester !== undefined) firestoreData.semester = updatedData.semester;
      firestoreData.updatedAt = new Date().toISOString();

      await updateDoc(docRef, firestoreData);
    } catch (err) {
      // Firestore update failed — updated locally
    }
  }

  // Update in local storage
  const current = getLocalReviews();
  const index = current.findIndex((r) => r.id === reviewId);
  if (index !== -1) {
    current[index] = {
      ...current[index],
      ...updatedData,
    };
    saveLocalReviews(current);
  }

  return true;
}

/**
 * Compute aggregate rating and breakdown for a faculty member from real reviews
 */
export function computeFacultyStats(
  facultyId: string,
  reviews: FacultyReview[]
): {
  rating: number;
  reviewCount: number;
  breakdown: RatingBreakdown;
} {
  const facultyReviews = reviews.filter((r) => r.facultyId === facultyId);
  const count = facultyReviews.length;

  if (count === 0) {
    return {
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

  let totalOverall = 0;
  let totalTeaching = 0;
  let totalFairness = 0;
  let totalGrading = 0;
  let totalGuarding = 0;
  let totalBehavior = 0;

  facultyReviews.forEach((r) => {
    totalOverall += r.overallRating;
    totalTeaching += r.ratings.teachingQuality;
    totalFairness += r.ratings.examFairness;
    totalGrading += r.ratings.gradingStrictness;
    totalGuarding += r.ratings.examGuarding;
    totalBehavior += r.ratings.behaviorWithStudents;
  });

  return {
    rating: Number((totalOverall / count).toFixed(1)),
    reviewCount: count,
    breakdown: {
      teachingQuality: Number((totalTeaching / count).toFixed(1)),
      examFairness: Number((totalFairness / count).toFixed(1)),
      gradingStrictness: Number((totalGrading / count).toFixed(1)),
      examGuarding: Number((totalGuarding / count).toFixed(1)),
      behaviorWithStudents: Number((totalBehavior / count).toFixed(1)),
    },
  };
}
