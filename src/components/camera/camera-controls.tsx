"use client";

import { motion } from "motion/react";
import type { CameraStatus } from "@/types/vision";

interface CameraControlsProps {
  cameraStatus: CameraStatus;
  isModelLoading: boolean;
  debugMode: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleDebug: () => void;
}

/**
 * Camera control buttons: start, stop, toggle debug mode.
 */
export function CameraControls({
  cameraStatus,
  isModelLoading,
  debugMode,
  onStart,
  onStop,
  onToggleDebug,
}: CameraControlsProps) {
  const isActive = cameraStatus === "active";
  const isRequesting = cameraStatus === "requesting";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Start / Stop Camera */}
      {!isActive ? (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          disabled={isRequesting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRequesting ? (
            <>
              <LoadingSpinner />
              Requesting...
            </>
          ) : (
            <>
              <CameraIcon />
              Start Camera
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStop}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:shadow-red-500/40"
        >
          <StopIcon />
          Stop Camera
        </motion.button>
      )}

      {/* Debug Toggle */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onToggleDebug}
        className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
          debugMode
            ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40"
            : "bg-white/5 text-zinc-400 ring-1 ring-white/10 hover:bg-white/10"
        }`}
      >
        <BugIcon />
        Debug {debugMode ? "ON" : "OFF"}
      </motion.button>

      {/* Loading indicator */}
      {isModelLoading && (
        <div className="flex items-center gap-2 text-sm text-amber-400">
          <LoadingSpinner />
          Loading ML models...
        </div>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  );
}

function BugIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0M12 9V6m0 12v-3M9 12H6m12 0h-3M7.05 7.05L5.636 5.636m12.728 12.728L16.95 16.95M7.05 16.95l-1.414 1.414M18.364 5.636L16.95 7.05" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
