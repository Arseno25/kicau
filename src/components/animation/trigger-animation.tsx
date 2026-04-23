"use client";

import { motion, AnimatePresence } from "motion/react";
import { useMemo, useRef, useEffect } from "react";

interface TriggerAnimationProps {
  /** True while hand is near nose — audio plays immediately */
  isTriggered: boolean;
  /** True after 4 seconds of continuous trigger — GIFs show after delay */
  isVisible: boolean;
}

interface ScatteredGif {
  id: number;
  x: number;
  y: number;
  sizeMobile: number;
  sizeDesktop: number;
  delay: number;
  rotation: number;
}

/** Pre-generate fixed positions so they don't re-randomize every render */
const FIXED_POSITIONS: ScatteredGif[] = [
  { id: 0, x: 8, y: 12, sizeMobile: 60, sizeDesktop: 100, delay: 0, rotation: -12 },
  { id: 1, x: 75, y: 8, sizeMobile: 70, sizeDesktop: 110, delay: 0.08, rotation: 15 },
  { id: 2, x: 35, y: 5, sizeMobile: 55, sizeDesktop: 95, delay: 0.15, rotation: -8 },
  { id: 3, x: 55, y: 70, sizeMobile: 65, sizeDesktop: 105, delay: 0.05, rotation: 10 },
  { id: 4, x: 15, y: 65, sizeMobile: 50, sizeDesktop: 90, delay: 0.12, rotation: -18 },
  { id: 5, x: 85, y: 55, sizeMobile: 60, sizeDesktop: 100, delay: 0.1, rotation: 8 },
  { id: 6, x: 45, y: 80, sizeMobile: 55, sizeDesktop: 95, delay: 0.18, rotation: -5 },
  { id: 7, x: 68, y: 35, sizeMobile: 70, sizeDesktop: 110, delay: 0.03, rotation: 12 },
  { id: 8, x: 22, y: 40, sizeMobile: 50, sizeDesktop: 90, delay: 0.2, rotation: -15 },
  { id: 9, x: 50, y: 30, sizeMobile: 65, sizeDesktop: 105, delay: 0.07, rotation: 6 },
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
export function TriggerAnimation({ isTriggered, isVisible }: TriggerAnimationProps) {
  // Memoize to prevent pointless re-computation
  const gifs = useMemo(() => FIXED_POSITIONS, []);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play sound effect immediately when triggered (not delayed)
  useEffect(() => {
    if (isTriggered) {
      // Create new audio and play
      if (!audioRef.current) {
        const audio = new Audio("/sfx/sfx.mp3");
        audio.volume = 1.0;
        audio.loop = true; // Loop while triggered
        audioRef.current = audio;
        audio.play().catch((err) => {
          console.log("Audio play error:", err);
        });
      }
    } else {
      // Stop and cleanup audio when not triggered
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isTriggered]);

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
                width: gif.sizeMobile,
                height: gif.sizeMobile,
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
                className="h-full w-full object-contain drop-shadow-md sm:hidden"
                draggable={false}
                loading="eager"
              />
              <img
                src={GIF_SRC}
                alt=""
                className="hidden h-full w-full object-contain drop-shadow-md sm:block"
                style={{ width: gif.sizeDesktop, height: gif.sizeDesktop }}
                draggable={false}
                loading="eager"
              />
            </motion.div>
          ))}

        </motion.div>
      )}
    </AnimatePresence>
  );
}
