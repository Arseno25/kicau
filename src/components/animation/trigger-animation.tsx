"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useMemo, useState } from "react";

interface TriggerAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

/** A single scattered GIF instance with random position and animation */
interface ScatteredGif {
  id: number;
  x: number;       // % from left
  y: number;       // % from top
  size: number;    // px
  delay: number;   // entrance delay in seconds
  rotation: number; // initial rotation degrees
  scale: number;   // final scale
}

/** Generate random scattered positions for the GIF instances */
function generateScatteredGifs(count: number): ScatteredGif[] {
  const gifs: ScatteredGif[] = [];

  for (let i = 0; i < count; i++) {
    gifs.push({
      id: i,
      x: 5 + Math.random() * 85,         // 5-90% horizontal spread
      y: 5 + Math.random() * 85,         // 5-90% vertical spread
      size: 36 + Math.random() * 40,     // 36-76px (small and tidy)
      delay: Math.random() * 0.6,        // staggered entrance 0-0.6s
      rotation: -20 + Math.random() * 40, // -20° to +20° tilt
      scale: 0.8 + Math.random() * 0.4,  // 0.8-1.2x variation
    });
  }

  return gifs;
}

const GIF_COUNT = 18;
const DISPLAY_DURATION_MS = 3000;

/**
 * When triggered, spawns many small kicau-animation GIFs scattered
 * randomly across the viewport with staggered spring-in / fade-out.
 */
export function TriggerAnimation({ isVisible, onComplete }: TriggerAnimationProps) {
  const [show, setShow] = useState(false);

  // Regenerate random positions each time the animation fires
  const gifs = useMemo(
    () => (isVisible ? generateScatteredGifs(GIF_COUNT) : []),
    [isVisible]
  );

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, DISPLAY_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 z-30 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Soft background flash */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-violet-500/10 to-cyan-500/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.4, 0.6, 0] }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />

          {/* Scattered GIF instances */}
          {gifs.map((gif) => (
            <motion.div
              key={gif.id}
              className="absolute"
              style={{
                left: `${gif.x}%`,
                top: `${gif.y}%`,
                width: gif.size,
                height: gif.size,
              }}
              initial={{
                opacity: 0,
                scale: 0,
                rotate: gif.rotation - 30,
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, gif.scale * 1.2, gif.scale, gif.scale * 0.8],
                rotate: [gif.rotation - 30, gif.rotation + 5, gif.rotation, gif.rotation],
              }}
              transition={{
                duration: 2.4,
                delay: gif.delay,
                ease: "easeOut",
                times: [0, 0.2, 0.7, 1],
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/animations/kicau-animation.gif"
                alt=""
                className="h-full w-full object-contain drop-shadow-lg"
                draggable={false}
              />
            </motion.div>
          ))}

          {/* Center label */}
          <motion.div
            className="absolute inset-x-0 bottom-[12%] flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <span className="rounded-full bg-black/60 px-6 py-2.5 text-sm font-semibold tracking-wide text-white shadow-xl backdrop-blur-md">
              ✨ Nose Touch Detected!
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
