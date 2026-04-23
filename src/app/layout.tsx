import type { Metadata } from "next";
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
        className="bg-ambient bg-grid min-h-screen antialiased font-sans"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
