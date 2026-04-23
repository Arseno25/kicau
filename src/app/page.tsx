"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FloatingText } from "@/components/animation/floating-text";
import { TriggerProgress } from "@/components/camera/trigger-progress";

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
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8">
      {/* Title */}
      <header className="mb-4 text-center sm:mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">
          <span className="text-gradient drop-shadow-lg">Kicau</span>{" "}
          <span className="text-zinc-200 drop-shadow-md">Mania</span>
        </h1>
        <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
          Pengalaman yang dikontrol gerakan tangan
        </p>
      </header>

      {/* Camera section — centered */}
      <div className="w-full">
        <CameraVision
          onTriggerChange={setIsTriggered}
          onDelayedTriggerChange={setIsDelayedTrigger}
        />
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-sm font-bold sm:mt-8 sm:text-base">
        <p className="text-white drop-shadow-lg">Semua pemrosesan visi berjalan lokal di browser.</p>
        <p className="mt-2">
          <span className="text-zinc-300">Dibuat oleh</span>{" "}
          <a
            href="https://github.com/Arseno25/kicau"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-gradient hover:opacity-80 transition-opacity font-black"
          >
            <span className="underline decoration-violet-400/50 underline-offset-2">Arseno25</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </p>
      </footer>

      {/* Floating text overlay - outside camera, full screen (delayed 4s) */}
      <FloatingText isVisible={isDelayedTrigger} />

      {/* Progress indicator while holding pose */}
      <TriggerProgress isTriggered={isTriggered} delay={4000} />
    </main>
  );
}
