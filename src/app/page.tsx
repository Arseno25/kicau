"use client";

import dynamic from "next/dynamic";

// Dynamically import the camera vision component — it uses browser APIs
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
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <header className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Real-time Browser Vision
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="text-gradient">Kicau</span>{" "}
          <span className="text-zinc-300">Vision</span>
        </h1>

        <p className="mx-auto max-w-2xl text-base text-zinc-400 sm:text-lg">
          Detects when your hand moves close to your nose using{" "}
          <span className="font-semibold text-zinc-300">MediaPipe</span> face & hand
          landmarks — all processing happens in your browser, completely private.
        </p>
      </header>

      {/* Feature badges */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        {[
          { icon: "🧠", label: "On-Device ML" },
          { icon: "⚡", label: "Real-time" },
          { icon: "🔒", label: "Private" },
          { icon: "🎯", label: "Precise" },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-zinc-300 backdrop-blur-sm"
          >
            <span>{icon}</span>
            {label}
          </div>
        ))}
      </div>

      {/* Camera section */}
      <CameraVision />

      {/* Footer */}
      <footer className="mt-16 border-t border-white/5 pt-8 pb-6 text-center text-xs text-zinc-500">
        <p>
          Built with{" "}
          <span className="text-zinc-400">Next.js</span>,{" "}
          <span className="text-zinc-400">MediaPipe</span>,{" "}
          <span className="text-zinc-400">Motion</span> &{" "}
          <span className="text-zinc-400">Tailwind CSS</span>
        </p>
        <p className="mt-1">All vision processing runs locally in your browser. No data leaves your device.</p>
      </footer>
    </main>
  );
}
