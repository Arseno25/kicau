import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Kicau Mania — Fomo",
  description: "Fomo App",
  keywords: [
    "mediapipe",
    "computer vision",
    "hand detection",
    "face detection",
    "next.js",
    "real-time",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <body
        className={`bg-ambient bg-grid bg-noise min-h-screen antialiased font-sans ${plusJakartaSans.variable}`}
        style={{ fontFamily: "var(--font-plus-jakarta-sans), sans-serif", isolation: "isolate" }}
      >
        {/* Animated background orbs — behind content */}
        <div className="animated-orb orb-1" />
        <div className="animated-orb orb-2" />
        <div className="animated-orb orb-3" />
        <div className="animated-orb orb-4" />

        {/* Main content — above background effects */}
        <div className="relative" style={{ zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
