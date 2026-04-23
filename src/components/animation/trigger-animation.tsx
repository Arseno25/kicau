"use client";

import { motion, AnimatePresence } from "motion/react";
import { useMemo } from "react";

interface TriggerAnimationProps {
  /** True while hand is near nose — animation stays as long as this is true */
  isVisible: boolean;
}

interface ScatteredGif {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  rotation: number;
}

/** Pre-generate fixed positions so they don't re-randomize every render */
const FIXED_POSITIONS: ScatteredGif[] = [
  { id: 0, x: 8, y: 12, size: 40, delay: 0, rotation: -12 },
  { id: 1, x: 75, y: 8, size: 44, delay: 0.08, rotation: 15 },
  { id: 2, x: 35, y: 5, size: 38, delay: 0.15, rotation: -8 },
  { id: 3, x: 55, y: 70, size: 42, delay: 0.05, rotation: 10 },
  { id: 4, x: 15, y: 65, size: 36, delay: 0.12, rotation: -18 },
  { id: 5, x: 85, y: 55, size: 40, delay: 0.1, rotation: 8 },
  { id: 6, x: 45, y: 80, size: 38, delay: 0.18, rotation: -5 },
  { id: 7, x: 68, y: 35, size: 44, delay: 0.03, rotation: 12 },
  { id: 8, x: 22, y: 40, size: 36, delay: 0.2, rotation: -15 },
  { id: 9, x: 50, y: 30, size: 42, delay: 0.07, rotation: 6 },
];

const GIF_SRC = "/animations/kicau-animation.gif";

/**
 * Lightweight animated overlay: 10 pre-positioned small GIF instances.
 * Shows while isVisible=true, hides with fade-out when false.
 *
 * Optimizations:
 * - Fixed positions (no re-randomization per render)
 * - Only 10 GIF elements (reduced from 18)
 * - Single shared <img> src (browser caches it)
 * - No timers — purely state-driven
 * - CSS will-change for GPU compositing
 */
export function TriggerAnimation({ isVisible }: TriggerAnimationProps) {
  // Memoize to prevent pointless re-computation
  const gifs = useMemo(() => FIXED_POSITIONS, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{ willChange: "opacity" }}
        >
          {/* Subtle tinted overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-rose-500/8 via-transparent to-violet-500/8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Scattered GIFs */}
          {gifs.map((gif) => (
            <motion.div
              key={gif.id}
              className="absolute"
              style={{
                left: `${gif.x}%`,
                top: `${gif.y}%`,
                width: gif.size,
                height: gif.size,
                willChange: "transform, opacity",
              }}
              initial={{ opacity: 0, scale: 0, rotate: gif.rotation - 20 }}
              animate={{ opacity: 1, scale: 1, rotate: gif.rotation }}
              exit={{ opacity: 0, scale: 0.5, rotate: gif.rotation + 10 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: gif.delay,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={GIF_SRC}
                alt=""
                className="h-full w-full object-contain drop-shadow-md"
                draggable={false}
                loading="eager"
              />
            </motion.div>
          ))}

          {/* Bottom label */}
          <motion.div
            className="absolute inset-x-0 bottom-[10%] flex justify-center"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 250 }}
          >
            <span className="rounded-full bg-black/50 px-5 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur-md">
              ✨ Nose Touch Detected!
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
