import type { Metadata, Viewport } from "next";
import "./globals.css";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="bg-ambient bg-grid bg-noise min-h-screen antialiased font-sans"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Animated background orbs */}
        <div className="animated-orb orb-1" />
        <div className="animated-orb orb-2" />
        <div className="animated-orb orb-3" />
        <div className="animated-orb orb-4" />

        {children}
      </body>
    </html>
  );
}
