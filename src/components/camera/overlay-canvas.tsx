"use client";

import { forwardRef } from "react";

/**
 * Transparent canvas overlay positioned over the video for debug drawing.
 * Rendered only when debug mode is active, but always mounted for the ref.
 */
export const OverlayCanvas = forwardRef<
  HTMLCanvasElement,
  { debugMode: boolean }
>(function OverlayCanvas({ debugMode }, ref) {
  return (
    <canvas
      ref={ref}
      className={`absolute inset-0 z-20 h-full w-full transition-opacity duration-300 ${
        debugMode ? "opacity-100" : "opacity-0"
      }`}
      style={{ pointerEvents: "none" }}
    />
  );
});
