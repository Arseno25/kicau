/** Normalized 2D point (0-1 range relative to frame) */
export interface NormalizedPoint {
  x: number;
  y: number;
}

/** Normalized 3D point with depth */
export interface NormalizedPoint3D extends NormalizedPoint {
  z: number;
}

/** Camera stream status */
export type CameraStatus = "idle" | "requesting" | "active" | "error" | "denied";

/** Detection state for the proximity trigger */
export type TriggerState = "idle" | "approaching" | "triggered" | "cooldown";

/** Debug information displayed in the status panel */
export interface DebugInfo {
  cameraStatus: CameraStatus;
  faceDetected: boolean;
  handDetected: boolean;
  /** Normalized distance between hand point and nose (0-1 relative to face) */
  normalizedDistance: number | null;
  /** Raw pixel distance */
  rawDistance: number | null;
  triggerState: TriggerState;
  consecutiveFrames: number;
  fps: number;
}

/** Smoothed landmark coordinates after filtering */
export interface SmoothedLandmarks {
  nose: NormalizedPoint | null;
  handPoint: NormalizedPoint | null;
  /** Approximate face width for distance normalization */
  faceWidth: number;
}

/** Configuration for the detection system */
export interface DetectionConfig {
  /** Normalized distance threshold relative to face width (0-1) */
  proximityThreshold: number;
  /** Consecutive frames required before triggering */
  requiredConsecutiveFrames: number;
  /** Cooldown duration in ms after a trigger */
  cooldownMs: number;
  /** Exponential moving average alpha for smoothing (0-1) */
  smoothingAlpha: number;
}

/** Result from a single detection frame */
export interface FrameDetectionResult {
  nose: NormalizedPoint | null;
  handPoint: NormalizedPoint | null;
  faceWidth: number;
  faceLandmarks: NormalizedPoint3D[][] | null;
  handLandmarks: NormalizedPoint3D[][] | null;
}
