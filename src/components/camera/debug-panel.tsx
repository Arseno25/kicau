"use client";

import { motion } from "motion/react";
import type { DebugInfo } from "@/types/vision";
import { cn } from "@/lib/utils/cn";

interface DebugPanelProps {
  debugInfo: DebugInfo;
  isVisible: boolean;
}

/**
 * Real-time status panel showing detection metrics.
 */
export function DebugPanel({ debugInfo, isVisible }: DebugPanelProps) {
  if (!isVisible) return null;

  const statusColor = {
    idle: "text-zinc-400",
    requesting: "text-amber-400",
    active: "text-emerald-400",
    error: "text-red-400",
    denied: "text-red-400",
  };

  const triggerColor = {
    idle: "text-zinc-400",
    approaching: "text-amber-400",
    triggered: "text-cyan-400",
    cooldown: "text-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-xl border border-white/10 bg-zinc-900/80 p-3 shadow-xl backdrop-blur-xl sm:rounded-2xl sm:p-5 sm:shadow-2xl"
    >
      <div className="mb-2 flex items-center gap-2 sm:mb-3">
        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse sm:h-2 sm:w-2" />
        <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase sm:text-sm">
          Panel Debug
        </h3>
        <span className="ml-auto rounded-md bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 sm:px-2 sm:text-xs">
          {debugInfo.fps} FPS
        </span>
      </div>

      <div className="space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
        <Row label="Kamera">
          <span className={cn("font-semibold capitalize", statusColor[debugInfo.cameraStatus])}>
            {debugInfo.cameraStatus}
          </span>
        </Row>

        <Row label="Wajah">
          <StatusDot active={debugInfo.faceDetected} />
          <span className={debugInfo.faceDetected ? "text-emerald-400" : "text-zinc-500"}>
            {debugInfo.faceDetected ? "Ya" : "Tidak"}
          </span>
        </Row>

        <Row label="Tangan">
          <StatusDot active={debugInfo.handDetected} />
          <span className={debugInfo.handDetected ? "text-emerald-400" : "text-zinc-500"}>
            {debugInfo.handDetected ? "Ya" : "Tidak"}
          </span>
        </Row>

        <div className="border-t border-white/5 pt-1.5 sm:pt-2" />

        <Row label="Jarak Norm">
          <span className="font-mono text-zinc-300">
            {debugInfo.normalizedDistance !== null
              ? debugInfo.normalizedDistance.toFixed(2)
              : "—"}
          </span>
        </Row>

        <Row label="Jarak Raw">
          <span className="font-mono text-zinc-300">
            {debugInfo.rawDistance !== null
              ? debugInfo.rawDistance.toFixed(3)
              : "—"}
          </span>
        </Row>

        <div className="border-t border-white/5 pt-1.5 sm:pt-2" />

        <Row label="Trigger">
          <span className={cn("font-semibold capitalize", triggerColor[debugInfo.triggerState])}>
            {debugInfo.triggerState}
          </span>
        </Row>

        <Row label="Frame">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-1 w-12 overflow-hidden rounded-full bg-zinc-800 sm:h-1.5 sm:w-20">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                animate={{ width: `${Math.min((debugInfo.consecutiveFrames / 8) * 100, 100)}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
            <span className="font-mono text-[10px] text-zinc-400 sm:text-xs">
              {debugInfo.consecutiveFrames}/8
            </span>
          </div>
        </Row>
      </div>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4">
      <span className="text-zinc-500 text-[10px] sm:text-xs">{label}</span>
      <div className="flex items-center gap-1 sm:gap-1.5">{children}</div>
    </div>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "h-1.5 w-1.5 rounded-full transition-colors sm:h-2 sm:w-2",
        active ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-zinc-600"
      )}
    />
  );
}
