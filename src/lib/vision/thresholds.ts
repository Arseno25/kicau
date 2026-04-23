import type { DetectionConfig } from "@/types/vision";

/**
 * Default detection configuration.
 *
 * How the threshold works:
 * - The raw pixel distance between the hand point and the nose is computed.
 * - This distance is normalized by dividing by the face width (cheek-to-cheek).
 * - A normalizedDistance < proximityThreshold means the hand is "near" the nose.
 * - This normalization makes the detection work at any camera distance:
 *   when the user is far, both the hand-nose distance and face width shrink proportionally.
 *
 * Tuning tips:
 * - Lower proximityThreshold = hand must be closer to trigger
 * - Higher requiredConsecutiveFrames = more stable but slower response
 * - Higher cooldownMs = longer pause between triggers
 * - Lower smoothingAlpha = smoother but laggier tracking
 */
export const DEFAULT_DETECTION_CONFIG: DetectionConfig = {
  proximityThreshold: 0.35,
  requiredConsecutiveFrames: 8,
  cooldownMs: 3000,
  smoothingAlpha: 0.4,
};

/** Minimum face width (normalized) to consider face detection valid */
export const MIN_FACE_WIDTH = 0.05;

/** MediaPipe model confidence thresholds */
export const MEDIAPIPE_CONFIG = {
  faceMinDetectionConfidence: 0.5,
  faceMinTrackingConfidence: 0.5,
  handMinDetectionConfidence: 0.5,
  handMinTrackingConfidence: 0.5,
  maxNumFaces: 1,
  maxNumHands: 1,
} as const;
