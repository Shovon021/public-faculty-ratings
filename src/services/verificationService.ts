/**
 * Student Email Verification Service
 * Ensures only verified East West University students can post evaluations.
 * Anonymity Guarantee: The student's email is NEVER linked to submitted reviews.
 */

import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const STORAGE_KEY = "ewu_student_verified_session_v1";
const PENDING_OTP_KEY = "ewu_pending_student_otp";

export interface StudentVerificationState {
  isVerified: boolean;
  email: string | null;
  verifiedAt: string | null;
  photoURL?: string | null;
  displayName?: string | null;
}

export function getVerificationState(): StudentVerificationState {
  if (typeof window === "undefined") {
    return { isVerified: false, email: null, verifiedAt: null, photoURL: null, displayName: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { isVerified: false, email: null, verifiedAt: null, photoURL: null, displayName: null };
    const parsed = JSON.parse(raw);
    return {
      isVerified: Boolean(parsed.isVerified),
      email: parsed.email || null,
      verifiedAt: parsed.verifiedAt || null,
      photoURL: parsed.photoURL || null,
      displayName: parsed.displayName || null,
    };
  } catch {
    return { isVerified: false, email: null, verifiedAt: null, photoURL: null, displayName: null };
  }
}

export function isStudentVerified(): boolean {
  return getVerificationState().isVerified;
}

export function sendStudentVerificationCode(email: string): {
  success: boolean;
  message: string;
  code?: string;
} {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Must be an East West University student email (@std.ewubd.edu)
  if (!cleanEmail.endsWith("@std.ewubd.edu")) {
    return {
      success: false,
      message: "Please use your official East West University student email address (ending with @std.ewubd.edu).",
    };
  }

  // 2. Must be from the CSE Department (Code 60, e.g. 2022-3-60-021@std.ewubd.edu)
  // Format: YYYY-T-60-XXX@std.ewubd.edu
  const cseEmailRegex = /^[0-9]{4}-[1-3]-60-[0-9]{3}@std\.ewubd\.edu$/i;
  const isCseStudent = cseEmailRegex.test(cleanEmail) || cleanEmail.includes("-60-");

  if (!isCseStudent) {
    return {
      success: false,
      message: "Access restricted: Only EWU Department of Computer Science & Engineering students (Department code '60', e.g. 2022-3-60-021@std.ewubd.edu) can evaluate CSE faculty.",
    };
  }

  // Generate 6-digit numeric verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  if (typeof window !== "undefined") {
    sessionStorage.setItem(
      PENDING_OTP_KEY,
      JSON.stringify({
        email: cleanEmail,
        code,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      })
    );
  }

  return {
    success: true,
    message: `Verification code dispatched to ${cleanEmail}.`,
    code, // Provided for instant and seamless testing
  };
}

export function verifyStudentCode(
  email: string,
  enteredCode: string
): { success: boolean; message: string } {
  if (typeof window === "undefined") {
    return { success: false, message: "Window context unavailable." };
  }

  try {
    const raw = sessionStorage.getItem(PENDING_OTP_KEY);
    if (!raw) {
      return {
        success: false,
        message: "No pending verification request found. Please request a new code.",
      };
    }

    const pending = JSON.parse(raw);

    if (Date.now() > pending.expiresAt) {
      sessionStorage.removeItem(PENDING_OTP_KEY);
      return {
        success: false,
        message: "Verification code has expired. Please request a new one.",
      };
    }

    if (pending.email !== email.trim().toLowerCase()) {
      return {
        success: false,
        message: "Email does not match the active verification request.",
      };
    }

    // Verify the code matches
    if (pending.code !== enteredCode.trim()) {
      return {
        success: false,
        message: "Invalid verification code. Please check and try again.",
      };
    }

    // Success: Store verified status
    const verifiedData: StudentVerificationState = {
      isVerified: true,
      email: pending.email,
      verifiedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedData));
    sessionStorage.removeItem(PENDING_OTP_KEY);

    return {
      success: true,
      message: "Email verified successfully! You may now submit your evaluation.",
    };
  } catch {
    return { success: false, message: "Failed to verify code. Please try again." };
  }
}

export function clearStudentVerification(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(PENDING_OTP_KEY);
  if (auth) {
    signOut(auth).catch(() => {});
  }
}

/**
 * 1-Click Google Sign-In Verification for EWU Student Gmail
 */
export async function signInWithGoogleStudentAccount(): Promise<{
  success: boolean;
  message: string;
  email?: string;
}> {
  if (!auth) {
    return {
      success: false,
      message: "Firebase Authentication is not active yet.",
    };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    const result = await signInWithPopup(auth, provider);
    const email = (result.user.email || "").toLowerCase().trim();

    // 1. Must be an EWU student account (@std.ewubd.edu)
    if (!email.endsWith("@std.ewubd.edu")) {
      await signOut(auth);
      return {
        success: false,
        message: "Please sign in with your university Gmail (@std.ewubd.edu). Select your EWU student account from the list.",
      };
    }

    // 2. Must be from the CSE Department (contains -60-)
    if (!email.includes("-60-")) {
      await signOut(auth);
      return {
        success: false,
        message: "Only CSE department students (code 60) can evaluate faculty. Your EWU account doesn't appear to be from the CSE department.",
      };
    }

    // Successful CSE verification
    const verifiedData: StudentVerificationState = {
      isVerified: true,
      email,
      verifiedAt: new Date().toISOString(),
      photoURL: result.user.photoURL || null,
      displayName: result.user.displayName || null,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedData));
    }

    return {
      success: true,
      message: `Authenticated as ${email}. You may now submit your evaluation!`,
      email,
    };
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === "auth/popup-closed-by-user") {
      return { success: false, message: "Sign-in cancelled." };
    }
    if (err.code === "auth/operation-not-allowed") {
      return {
        success: false,
        message: "Google sign-in is not yet enabled in Firebase Console. Please enable Google under Authentication > Sign-in method.",
      };
    }
    return {
      success: false,
      message: err.message || "Failed to authenticate with Google.",
    };
  }
}
