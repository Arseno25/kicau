"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface TriggerProgressProps {
  isTriggered: boolean;
  delay: number; // in milliseconds
}

/**
 * Circular progress indicator showing trigger progress.
 * Shows countdown to Kicau Mania activation.
 */
export function TriggerProgress({ isTriggered, delay }: TriggerProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isTriggered) {
      setTimeout(() => setProgress(0), 0);

      // Animate progress over delay duration
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / delay) * 100, 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setTimeout(() => setProgress(0), 0);
    }
  }, [isTriggered, delay]);

  return (
    <AnimatePresence>
      {isTriggered && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-24 right-4 z-50 sm:bottom-8 sm:right-8"
        >
          <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
            {/* Background circle */}
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(139, 92, 246, 0.2)"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
                transition={{ duration: 0.1 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="flex flex-col items-center">
              <motion.span
                key={Math.floor(progress)}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-lg font-bold text-cyan-300 sm:text-xl"
              >
                {Math.ceil((delay - (progress / 100) * delay) / 1000)}
              </motion.span>
              <span className="text-[8px] text-zinc-500 sm:text-[10px]">sec</span>
            </div>

            {/* Pulse ring */}
            {progress < 100 && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
              />
            )}
          </div>

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-cyan-400 sm:text-xs"
          >
            Tahan pose...
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
