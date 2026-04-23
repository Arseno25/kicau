"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { useCamera } from "@/hooks/use-camera";
import { useHandFaceProximity } from "@/hooks/use-hand-face-proximity";
import { CameraControls } from "@/components/camera/camera-controls";
import { DebugPanel } from "@/components/camera/debug-panel";
import { OverlayCanvas } from "@/components/camera/overlay-canvas";
import { TriggerAnimation } from "@/components/animation/trigger-animation";
import { PoseGuide } from "@/components/camera/pose-guide";

export interface CameraVisionProps {
  onTriggerChange?: (isTriggered: boolean) => void;
  onDelayedTriggerChange?: (isTriggered: boolean) => void;
}

/**
 * Main orchestrator — camera centered, clean layout.
 */
export function CameraVision({ onTriggerChange, onDelayedTriggerChange }: CameraVisionProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [delayedTrigger, setDelayedTrigger] = useState(false);
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { videoRef, cameraStatus, startCamera, stopCamera, error } = useCamera();

  const { debugInfo, isModelLoading, modelError, isHandNearNose } = useHandFaceProximity({
    videoRef,
    canvasRef,
    cameraStatus,
    debugMode,
  });

  // Notify parent when trigger state changes (immediate - for audio)
  useEffect(() => {
    onTriggerChange?.(isHandNearNose);
  }, [isHandNearNose, onTriggerChange]);

  // Delayed trigger (4 seconds) - for animation & text
  useEffect(() => {
    if (isHandNearNose) {
      // Start 4 second delay
      triggerTimeoutRef.current = setTimeout(() => {
        setDelayedTrigger(true);
        onDelayedTriggerChange?.(true);
      }, 4000);
    } else {
      // Clear timeout and reset delayed trigger
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
        triggerTimeoutRef.current = null;
      }
      setDelayedTrigger(false);
      onDelayedTriggerChange?.(false);
    }

    return () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
    };
  }, [isHandNearNose, onDelayedTriggerChange]);

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:gap-4 md:gap-5">
      {/* Pose guide - show when camera is idle */}
      {cameraStatus === "idle" && <PoseGuide isVisible={true} />}

      {/* Controls — centered */}
      <CameraControls
        cameraStatus={cameraStatus}
        isModelLoading={isModelLoading}
        debugMode={debugMode}
        onStart={startCamera}
        onStop={stopCamera}
        onToggleDebug={() => setDebugMode((prev) => !prev)}
      />

      {/* Error display */}
      {(error || modelError) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300"
        >
          <p className="font-semibold">⚠️ {error || modelError}</p>
        </motion.div>
      )}

      {/* Camera viewport — centered */}
      <div className="w-full max-w-2xl px-1 sm:px-0">
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/60 shadow-xl glow-border sm:rounded-2xl sm:shadow-2xl">
          <div className="relative aspect-video w-full">
            {/* Video */}
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              muted
              style={{ transform: "scaleX(-1)" }}
            />

            {/* Debug canvas */}
            <OverlayCanvas ref={canvasRef} debugMode={debugMode} />

            {/* GIF animation overlay (audio immediate, GIFs delayed 4s) */}
            <TriggerAnimation isTriggered={isHandNearNose} isVisible={delayedTrigger} />

            {/* Idle placeholder */}
            {cameraStatus === "idle" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-zinc-900/95 px-4 sm:gap-4">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-600/30 sm:h-20 sm:w-20 sm:rounded-2xl sm:shadow-xl"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-400/20 to-transparent" />
                  <svg className="relative h-8 w-8 text-white sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <p className="text-xs text-zinc-400 sm:text-sm">
                  Klik <span className="font-semibold text-emerald-400">Mulai Kamera</span> untuk memulai
                </p>
                <p className="text-[10px] text-zinc-600 sm:text-xs">
                  Deteksi gerakan tangan powered by MediaPipe
                </p>
              </div>
            )}

            {/* Loading models */}
            {cameraStatus === "active" && isModelLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-zinc-900/80 px-4 backdrop-blur-sm sm:gap-3">
                <div className="relative">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500 sm:h-10 sm:w-10" />
                  <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-violet-500/20 sm:h-10 sm:w-10" />
                </div>
                <p className="text-xs text-zinc-300 sm:text-sm">Memuat model visi...</p>
                <p className="text-[10px] text-zinc-500 sm:text-xs">Mungkin butuh waktu saat pertama</p>
              </div>
            )}
          </div>

          {/* Bottom status bar */}
          <div className="flex items-center justify-between border-t border-white/5 bg-zinc-900/60 px-3 py-1.5 text-[10px] sm:px-4 sm:py-2 sm:text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div
                className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${
                  cameraStatus === "active"
                    ? "bg-emerald-400 animate-pulse"
                    : cameraStatus === "error" || cameraStatus === "denied"
                    ? "bg-red-400"
                    : "bg-zinc-600"
                }`}
              />
              <span className="text-zinc-400 capitalize">{cameraStatus}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {isHandNearNose && (
                <span className="flex items-center gap-0.5 text-rose-400 font-semibold sm:gap-1">
                  <span className="h-1 w-1 rounded-full bg-rose-400 animate-pulse sm:h-1.5 sm:w-1.5" />
                  <span className="hidden sm:inline">AKTIF</span>
                  <span className="sm:hidden">●</span>
                </span>
              )}
              {cameraStatus === "active" && (
                <span className="font-mono text-zinc-500">{debugInfo.fps} FPS</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Debug panel — below camera when active */}
      {debugMode && (
        <div className="w-full max-w-2xl">
          <DebugPanel debugInfo={debugInfo} isVisible={debugMode} />
        </div>
      )}
    </div>
  );
}
