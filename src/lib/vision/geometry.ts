import type { NormalizedPoint } from "@/types/vision";

/** Euclidean distance between two normalized 2D points */
export function euclideanDistance(a: NormalizedPoint, b: NormalizedPoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normalize a raw distance relative to the face width.
 * This makes the threshold work regardless of camera distance.
 * Returns Infinity if faceWidth is zero to avoid division by zero.
 */
export function normalizeDistance(rawDistance: number, faceWidth: number): number {
  if (faceWidth <= 0) return Infinity;
  return rawDistance / faceWidth;
}

/**
 * Extract the nose tip position from MediaPipe Face Landmarker results.
 * Face landmark index 1 = nose tip in the 468-point face mesh.
 */
export function getNosePoint(
  faceLandmarks: { x: number; y: number; z: number }[]
): NormalizedPoint {
  const noseTip = faceLandmarks[1]; // nose tip
  return { x: noseTip.x, y: noseTip.y };
}

/**
 * Compute approximate face width from face landmarks for normalization.
 * Uses the distance between left cheek (234) and right cheek (454).
 */
export function computeFaceWidth(
  faceLandmarks: { x: number; y: number; z: number }[]
): number {
  const leftCheek = faceLandmarks[234];
  const rightCheek = faceLandmarks[454];
  return euclideanDistance(
    { x: leftCheek.x, y: leftCheek.y },
    { x: rightCheek.x, y: rightCheek.y }
  );
}

/**
 * Extract the primary hand anchor point from hand landmarks.
 * Uses index fingertip (landmark 8) as the primary point.
 * Falls back to middle finger MCP (landmark 9) as palm center proxy.
 */
export function getHandPoint(
  handLandmarks: { x: number; y: number; z: number }[]
): NormalizedPoint {
  // Index fingertip = landmark 8
  const indexTip = handLandmarks[8];
  return { x: indexTip.x, y: indexTip.y };
}
