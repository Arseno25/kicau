"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FloatingText } from "@/components/animation/floating-text";

const CameraVision = dynamic(
  () =>
    import("@/components/camera/camera-vision").then((mod) => ({
      default: mod.CameraVision,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    ),
  }
);

export default function HomePage() {
  const [isTriggered, setIsTriggered] = useState(false); // Immediate - for audio
  const [isDelayedTrigger, setIsDelayedTrigger] = useState(false); // 4s delay - for anim/text

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Title */}
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-gradient">Kicau</span>{" "}
          <span className="text-zinc-300">Mania</span>
        </h1>
      </header>

      {/* Camera section — centered */}
      <div className="w-full">
        <CameraVision
          onTriggerChange={setIsTriggered}
          onDelayedTriggerChange={setIsDelayedTrigger}
        />
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-xs text-zinc-600">
        <p>All vision processing runs locally in your browser.</p>
        <p className="mt-1">
          Created by{" "}
          <a
            href="https://github.com/Arseno25/kicau"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-500 hover:text-violet-400 hover:underline transition-colors"
          >
            Arseno25
          </a>
        </p>
      </footer>

      {/* Floating text overlay - outside camera, full screen (delayed 4s) */}
      <FloatingText isVisible={isDelayedTrigger} />
    </main>
  );
}
