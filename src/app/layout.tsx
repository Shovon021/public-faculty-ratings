import type { Metadata } from "next";
import { Geist, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const loraSerif = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "East West University — Department of Computer Science & Engineering | Faculty Evaluation",
  description:
    "Independent student-driven faculty evaluations and course section advising platform for East West University CSE.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${loraSerif.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F8FA] text-[#26334D] selection:bg-[#0E1A2E] selection:text-white font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}


