"use client";

import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState, useEffect } from "react";

interface FloatingTextProps {
  isVisible: boolean;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  scale: number;
  color: string;
}

const TEXT_TO_DISPLAY = "KICAU MANIA";

const COLORS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#eab308", // yellow-500
  "#22c55e", // green-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#d946ef", // fuchsia-500
  "#f43f5e", // rose-500
];

/** Generate random positions for floating text, avoiding center camera area */
function generateFloatingTexts(count: number): FloatingText[] {
  const texts: FloatingText[] = [];
  const centerX = 50; // Center X (where camera is)
  const centerY = 45; // Center Y (where camera is approximately)
  const exclusionRadius = 30; // Radius to avoid around camera

  // Define zones around the camera for text placement
  const zones = [
    // Top zone (above camera)
    { minX: 5, maxX: 95, minY: 2, maxY: 25 },
    // Bottom zone (below camera)
    { minX: 5, maxX: 95, minY: 70, maxY: 95 },
    // Left zone
    { minX: 2, maxX: 20, minY: 10, maxY: 85 },
    // Right zone
    { minX: 80, maxX: 98, minY: 10, maxY: 85 },
    // Top-left corner
    { minX: 2, maxX: 25, minY: 2, maxY: 20 },
    // Top-right corner
    { minX: 75, maxX: 98, minY: 2, maxY: 20 },
    // Bottom-left corner
    { minX: 2, maxX: 25, minY: 75, maxY: 95 },
    // Bottom-right corner
    { minX: 75, maxX: 98, minY: 75, maxY: 95 },
  ];

  let attempts = 0;
  const maxAttempts = count * 10;

  while (texts.length < count && attempts < maxAttempts) {
    attempts++;

    // Pick a random zone
    const zone = zones[Math.floor(Math.random() * zones.length)];

    // Generate position within the zone
    const x = zone.minX + Math.random() * (zone.maxX - zone.minX);
    const y = zone.minY + Math.random() * (zone.maxY - zone.minY);

    // Check if position is far enough from existing texts (avoid overlap)
    const tooClose = texts.some(existing => {
      const dx = existing.x - x;
      const dy = existing.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 12; // Minimum 12% distance between texts
    });

    if (!tooClose) {
      texts.push({
        id: texts.length,
        x,
        y,
        delay: Math.random() * 0.6,
        duration: 2 + Math.random() * 1.8,
        scale: 0.8 + Math.random() * 1.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }

  return texts;
}

/**
 * Full-screen floating text animation outside camera viewport.
 * Shows colorful "KICAU MANIA" text at random positions.
 */
export function FloatingText({ isVisible }: FloatingTextProps) {
  const [texts, setTexts] = useState<FloatingText[]>([]);

  // Regenerate positions on mount and when visibility changes
  useEffect(() => {
    if (isVisible) {
      setTexts(generateFloatingTexts(20)); // 20 floating texts, spread around
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-20 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {texts.map((text) => (
            <motion.div
              key={text.id}
              className="absolute font-black uppercase drop-shadow-2xl"
              style={{
                left: `${text.x}%`,
                top: `${text.y}%`,
                fontSize: `${1.5 + text.scale * 0.5}rem`,
                color: text.color,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                willChange: "transform, opacity",
                textShadow: `0 0 20px ${text.color}80, 0 4px 8px rgba(0,0,0,0.5)`,
              }}
              initial={{ opacity: 0, scale: 0, rotate: -20 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, text.scale, text.scale, text.scale * 0.5],
                rotate: [-20, text.id % 2 === 0 ? 10 : -10, 0],
                y: [0, -30, -50],
              }}
              exit={{ opacity: 0, scale: 0, y: -100 }}
              transition={{
                duration: text.duration,
                delay: text.delay,
                times: [0, 0.2, 0.7, 1],
                repeat: Infinity,
                repeatDelay: 0.3,
              }}
            >
              {TEXT_TO_DISPLAY}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
