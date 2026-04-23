import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kicau — Hand-Nose Proximity Detection",
  description:
    "Real-time browser-based computer vision app that detects when your hand touches your nose using MediaPipe Face and Hand Landmarkers.",
  keywords: ["mediapipe", "computer vision", "hand detection", "face detection", "next.js", "real-time"],
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
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ambient bg-grid min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
