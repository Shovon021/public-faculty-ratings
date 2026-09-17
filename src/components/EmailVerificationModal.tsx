"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { EwuLogo } from "./EwuLogo";
import { signInWithGoogleStudentAccount } from "@/services/verificationService";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  facultyName?: string;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  facultyName,
}) => {
  const [step, setStep] = useState<"signin" | "success">("signin");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setErrorMessage("");
    setStep("signin");
    setIsGoogleLoading(false);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogleStudentAccount();
      if (!res.success) {
        setErrorMessage(res.message);
        setIsGoogleLoading(false);
        return;
      }
      setStep("success");
      setTimeout(() => {
        onVerified();
        handleClose();
      }, 1000);
    } catch {
      setErrorMessage("Google Sign-In was cancelled or encountered an error.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#0E1A2E]/60 backdrop-blur-xs"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm rounded-xl border border-[#0E1A2E]/20 bg-white shadow-2xl overflow-hidden text-[#26334D]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Deep Navy Header */}
        <div className="flex items-center justify-between border-b border-[#EDE6DA]/15 p-5 bg-[#0D1B2A] text-[#EDE6DA]">
          <div className="flex items-center gap-3">
            <EwuLogo variant="crest" size="sm" />
            <div>
              <span className="text-[11px] text-[#EDE6DA]/70 font-medium block">
                East West University
              </span>
              <h2 className="text-base font-serif font-bold text-[#EDE6DA]">
                Student Sign In
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

        {/* Modal Content */}
        <div className="p-6">
          {step === "signin" && (
            <div className="space-y-5">
              {/* Context message */}
              <div className="text-center space-y-2">
                {facultyName ? (
                  <p className="text-sm text-[#26334D] leading-relaxed">
                    Sign in to submit an evaluation for{" "}
                    <strong className="text-[#0E1A2E]">{facultyName}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-[#26334D] leading-relaxed">
                    Sign in with your EWU student Gmail to submit evaluations
                  </p>
                )}
              </div>

              {/* Google Sign-In Button — Big, clear, primary */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 rounded-lg border border-[#0E1A2E]/15 bg-white hover:bg-[#F7F8FA] p-3.5 text-sm font-semibold text-[#0E1A2E] shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#4285F4]" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {isGoogleLoading
                    ? "Connecting..."
                    : "Continue with Google"}
                </span>
              </button>

              {/* Error message — shown if wrong account is selected */}
              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 leading-relaxed">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{errorMessage}</p>
                    <p className="mt-1 text-red-600/80">
                      Try again and select your <strong>@std.ewubd.edu</strong> account.
                    </p>
                  </div>
                </div>
              )}

              {/* Privacy note */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#58667E] pt-1">
                <span>Your email is never published or linked to reviews</span>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-[#10B981]" />
              <h3 className="text-lg font-serif font-bold text-[#0E1A2E]">
                Signed In Successfully
              </h3>
              <p className="text-xs text-[#58667E] max-w-xs">
                Opening the evaluation form...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
