"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, LogOut, CheckCircle2 } from "lucide-react";
import { EwuLogo } from "./EwuLogo";
import { auth } from "@/lib/firebase";
import { getVerificationState, clearStudentVerification } from "@/services/verificationService";

interface NavbarProps {
  facultyCount: number;
  reviewCount: number;
  onOpenVerification?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenVerification,
}) => {
  const [showAccountMenu, setShowAccountMenu] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check verification & Firebase Auth state
    const checkUser = () => {
      const state = getVerificationState();
      const currentUser = auth?.currentUser;
      const verified = state.isVerified || Boolean(currentUser);
      setIsVerified(verified);
      setUserEmail(state.email || currentUser?.email || null);
      setUserPhoto(state.photoURL || currentUser?.photoURL || null);
    };

    checkUser();

    // Listen to Firebase auth state changes
    let unsubscribe = () => {};
    if (auth) {
      unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          setIsVerified(true);
          setUserEmail(user.email);
          setUserPhoto(user.photoURL);
        } else {
          checkUser();
        }
      });
    }

    // Close menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    clearStudentVerification();
    setIsVerified(false);
    setUserEmail(null);
    setUserPhoto(null);
    setShowAccountMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#EDE6DA]/12 bg-[#0D1B2A] text-[#EDE6DA]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Institution Brand Header */}
          <div className="flex items-center gap-3">
            <EwuLogo variant="crest" size="md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif font-bold tracking-tight text-[#EDE6DA] leading-tight">
                  Eval<span className="text-[#8B2635]">ution</span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#8B2635] inline-block" />
              </div>
              <span className="text-[11px] text-[#EDE6DA]/70 font-sans tracking-wide">
                East West University &bull; Faculty Evaluations
              </span>
            </div>
          </div>

          {/* Navigation Right: Account Profile Picture or Burgundy Log In CTA */}
          <div className="flex items-center gap-3" ref={menuRef}>
            {isVerified ? (
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="relative flex items-center gap-2 rounded-full border border-[#EDE6DA]/20 p-0.5 hover:border-[#8B2635] transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B2635] cursor-pointer"
                  title="Student Account"
                  aria-label="Student Account Menu"
                >
                  <div className="relative h-9 w-9 rounded-full overflow-hidden bg-[#1B2E44] flex items-center justify-center border border-[#EDE6DA]/10">
                    {userPhoto ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={userPhoto}
                        alt="Gmail Profile"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="font-serif font-bold text-sm text-[#EDE6DA]">
                        {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                      </span>
                    )}
                  </div>
                  {/* Verified indicator badge */}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10B981] border-2 border-[#0D1B2A]" />
                </button>

                {/* Profile Dropdown Menu */}
                {showAccountMenu && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#EDE6DA]/15 bg-[#1B2E44] p-3 text-[#EDE6DA] shadow-xl z-50 animate-fade-in">
                    <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#EDE6DA]/10">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-[#0D1B2A] flex items-center justify-center shrink-0 border border-[#EDE6DA]/15">
                        {userPhoto ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={userPhoto}
                            alt="Gmail Profile"
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover rounded-full"
                          />
                        ) : (
                          <User className="h-5 w-5 text-[#EDE6DA]/60" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#EDE6DA] truncate">
                          {userEmail || "Verified Student"}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-[#10B981] font-medium mt-0.5">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Student Verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-300 hover:bg-red-500/15 hover:text-red-200 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Editorial Burgundy CTA Button */
              <button
                onClick={onOpenVerification}
                className="flex items-center gap-2 rounded-lg bg-[#8B2635] hover:bg-[#731E2B] text-[#EDE6DA] px-4 py-2 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Log In with EWU Student Account"
              >
                <User className="h-4 w-4 text-[#EDE6DA]" />
                <span>Log In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
