"use client";

import React, { useEffect } from "react";
import { X, ShieldCheck, EyeOff, Lock, Trash2, Info } from "lucide-react";
import { EwuLogo } from "./EwuLogo";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
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
        className="relative w-full max-w-lg rounded-xl border border-[#0E1A2E]/20 bg-white shadow-2xl overflow-hidden text-[#26334D] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EDE6DA]/15 p-5 bg-[#0D1B2A] text-[#EDE6DA] shrink-0">
          <div className="flex items-center gap-3">
            <EwuLogo variant="crest" size="sm" />
            <div>
              <span className="text-[11px] text-[#EDE6DA]/70 font-medium block">
                East West University &bull; Dept. of CSE
              </span>
              <h2 className="text-base font-serif font-bold text-[#EDE6DA]">
                Privacy &amp; Anonymity Policy
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#EDE6DA]/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#26334D] leading-relaxed">
          {/* Anonymity Section */}
          <div className="flex gap-3.5 p-3.5 rounded-lg bg-[#F7F8FA] border border-[#0D1B2A]/10">
            <EyeOff className="h-5 w-5 text-[#8B2635] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-sm text-[#0D1B2A]">
                100% Anonymous by Design
              </h3>
              <p className="text-[#58667E]">
                Your name, student ID, and email address are <strong>never</strong> displayed publicly on any faculty profile or evaluation. All student contributions are displayed strictly as &ldquo;Anonymous Student&rdquo;.
              </p>
            </div>
          </div>

          {/* Why Sign In Section */}
          <div className="flex gap-3.5 p-3.5 rounded-lg bg-[#F7F8FA] border border-[#0D1B2A]/10">
            <ShieldCheck className="h-5 w-5 text-[#0D1B2A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-sm text-[#0D1B2A]">
                Why University Sign-In is Required
              </h3>
              <p className="text-[#58667E]">
                Signing in with your official <strong>@std.ewubd.edu</strong> Google account (Department Code 60) exists solely to guarantee academic integrity: ensuring that only real CSE students submit feedback, preventing automated spam, and limiting each student to one evaluation per teacher.
              </p>
            </div>
          </div>

          {/* Ownership & Control */}
          <div className="flex gap-3.5 p-3.5 rounded-lg bg-[#F7F8FA] border border-[#0D1B2A]/10">
            <Trash2 className="h-5 w-5 text-[#0D1B2A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-sm text-[#0D1B2A]">
                Student Ownership &amp; Right to Delete
              </h3>
              <p className="text-[#58667E]">
                You retain complete control over your feedback. You may edit or permanently delete your evaluation at any time simply by opening the teacher&apos;s profile while signed in.
              </p>
            </div>
          </div>

          {/* Independent Disclaimer */}
          <div className="flex gap-3.5 p-3.5 rounded-lg bg-[#EDE6DA]/30 border border-[#8B2635]/20">
            <Info className="h-5 w-5 text-[#8B2635] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-sm text-[#0D1B2A]">
                Independent Academic Platform
              </h3>
              <p className="text-[#58667E]">
                This platform is an independent student initiative built to assist CSE students in making informed course choices and providing respectful, constructive feedback. It is not an official administrative service of East West University.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#0D1B2A]/10 p-4 bg-[#F7F8FA] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[#0D1B2A] hover:bg-[#1B2E44] text-[#EDE6DA] px-4 py-2 text-xs font-semibold transition-colors cursor-pointer"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
