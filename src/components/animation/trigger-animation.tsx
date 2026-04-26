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
  { id: 0, x: 20, y: 25, sizeMobile: 120, sizeDesktop: 200, delay: 0, rotation: -12 },
  { id: 1, x: 87, y: 22, sizeMobile: 140, sizeDesktop: 240, delay: 0.08, rotation: 15 },
  { id: 2, x: 47, y: 15, sizeMobile: 110, sizeDesktop: 180, delay: 0.15, rotation: -8 },
  { id: 3, x: 67, y: 75, sizeMobile: 130, sizeDesktop: 220, delay: 0.05, rotation: 10 },
  { id: 4, x: 27, y: 70, sizeMobile: 90, sizeDesktop: 160, delay: 0.12, rotation: -18 },
  { id: 5, x: 97, y: 60, sizeMobile: 120, sizeDesktop: 200, delay: 0.1, rotation: 8 },
  { id: 6, x: 57, y: 85, sizeMobile: 110, sizeDesktop: 190, delay: 0.18, rotation: -5 },
  { id: 7, x: 80, y: 45, sizeMobile: 140, sizeDesktop: 240, delay: 0.03, rotation: 12 },
  { id: 8, x: 34, y: 50, sizeMobile: 90, sizeDesktop: 170, delay: 0.2, rotation: -15 },
  { id: 9, x: 62, y: 40, sizeMobile: 130, sizeDesktop: 220, delay: 0.07, rotation: 6 },
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
  const audioUnlockedRef = useRef(false);

  // Pre-load audio on mount and unlock on first user interaction (mobile requirement)
  useEffect(() => {
    const audio = new Audio("/sfx/sfx.mp3");
    audio.volume = 1.0;
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    // Mobile browsers require audio to be "unlocked" via user gesture.
    // Play a silent moment then immediately pause to unlock the audio element.
    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;
      const a = audioRef.current;
      if (!a) return;

      // Set volume to 0, play briefly, then pause and restore volume
      const origVol = a.volume;
      a.volume = 0;
      a.play()
        .then(() => {
          a.pause();
          a.currentTime = 0;
          a.volume = origVol;
          audioUnlockedRef.current = true;
        })
        .catch(() => {
          // Silent fail — will retry on next interaction
        });
    };

    document.addEventListener("touchstart", unlockAudio, { once: false });
    document.addEventListener("click", unlockAudio, { once: false });

    return () => {
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("click", unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Play/pause audio based on trigger state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isTriggered) {
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.log("Audio play error:", err);
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
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
                willChange: "transform, opacity",
              }}
              initial={{ opacity: 0, scale: 0, rotate: gif.rotation - 20, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, rotate: gif.rotation, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.5, rotate: gif.rotation + 10, x: "-50%", y: "-50%" }}
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
                className="object-contain drop-shadow-md sm:hidden"
                style={{ width: gif.sizeMobile, height: gif.sizeMobile }}
                draggable={false}
                loading="eager"
              />
              <img
                src={GIF_SRC}
                alt=""
                className="hidden object-contain drop-shadow-md sm:block"
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
