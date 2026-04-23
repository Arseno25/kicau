"use client";

import { motion } from "motion/react";

interface PoseGuideProps {
  isVisible: boolean;
}

/**
 * Visual guide showing the required pose: hand near nose.
 */
export function PoseGuide({ isVisible }: PoseGuideProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="mx-auto w-full max-w-sm rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        {/* Animated icon showing the pose */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-violet-500/20"
        >
          <svg className="h-7 w-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {/* Face outline */}
            <ellipse cx="12" cy="12" rx="8" ry="10" />
            {/* Eyes */}
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
            {/* Nose */}
            <path d="M12 12v3" />
            {/* Hand pointing to nose */}
            <path d="M16 14l-3 1" />
            <circle cx="16" cy="14" r="1.5" fill="currentColor" />
          </svg>
        </motion.div>

        <div className="flex-1 text-xs sm:text-sm">
          <p className="font-semibold text-violet-300">Cara memicu:</p>
          <p className="text-zinc-400 mt-0.5">
            Letakkan <span className="text-violet-400">satu tangan di dekat hidung</span>
          </p>
          <p className="text-zinc-500 mt-1 text-[10px] sm:text-xs">
            Tahan selama 4 detik untuk mengaktifkan Kicau Mania!
          </p>
        </div>

        {/* Pulse indicator */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-2 w-2 rounded-full bg-violet-400"
        />
      </div>
    </motion.div>
  );
}
