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
    triggered: "text-rose-400",
    cooldown: "text-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 shadow-2xl backdrop-blur-xl"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
        <h3 className="text-sm font-bold tracking-wider text-zinc-300 uppercase">
          Debug Panel
        </h3>
        <span className="ml-auto rounded-md bg-zinc-800 px-2 py-0.5 text-xs font-mono text-zinc-500">
          {debugInfo.fps} FPS
        </span>
      </div>

      <div className="space-y-2.5 text-sm">
        <Row label="Camera">
          <span className={cn("font-semibold capitalize", statusColor[debugInfo.cameraStatus])}>
            {debugInfo.cameraStatus}
          </span>
        </Row>

        <Row label="Face Detected">
          <StatusDot active={debugInfo.faceDetected} />
          <span className={debugInfo.faceDetected ? "text-emerald-400" : "text-zinc-500"}>
            {debugInfo.faceDetected ? "Yes" : "No"}
          </span>
        </Row>

        <Row label="Hand Detected">
          <StatusDot active={debugInfo.handDetected} />
          <span className={debugInfo.handDetected ? "text-emerald-400" : "text-zinc-500"}>
            {debugInfo.handDetected ? "Yes" : "No"}
          </span>
        </Row>

        <div className="border-t border-white/5 pt-2" />

        <Row label="Norm. Distance">
          <span className="font-mono text-zinc-300">
            {debugInfo.normalizedDistance !== null
              ? debugInfo.normalizedDistance.toFixed(2)
              : "—"}
          </span>
        </Row>

        <Row label="Raw Distance">
          <span className="font-mono text-zinc-300">
            {debugInfo.rawDistance !== null
              ? debugInfo.rawDistance.toFixed(3)
              : "—"}
          </span>
        </Row>

        <div className="border-t border-white/5 pt-2" />

        <Row label="Trigger State">
          <span className={cn("font-semibold capitalize", triggerColor[debugInfo.triggerState])}>
            {debugInfo.triggerState}
          </span>
        </Row>

        <Row label="Consec. Frames">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500"
                animate={{ width: `${Math.min((debugInfo.consecutiveFrames / 8) * 100, 100)}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
            <span className="font-mono text-xs text-zinc-400">
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
    <div className="flex items-center justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "h-2 w-2 rounded-full transition-colors",
        active ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-zinc-600"
      )}
    />
  );
}
