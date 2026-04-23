import {
  HandLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import { MEDIAPIPE_CONFIG } from "@/lib/vision/thresholds";

let handLandmarker: HandLandmarker | null = null;
let initPromise: Promise<HandLandmarker> | null = null;

/**
 * Initialize the MediaPipe HandLandmarker singleton.
 * Uses CDN-hosted WASM and model files.
 */
export async function initHandLandmarker(): Promise<HandLandmarker> {
  if (handLandmarker) return handLandmarker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      numHands: MEDIAPIPE_CONFIG.maxNumHands,
      minHandDetectionConfidence: MEDIAPIPE_CONFIG.handMinDetectionConfidence,
      minTrackingConfidence: MEDIAPIPE_CONFIG.handMinTrackingConfidence,
    });

    return handLandmarker;
  })();

  return initPromise;
}

/** Get the current HandLandmarker instance (null if not initialized) */
export function getHandLandmarker(): HandLandmarker | null {
  return handLandmarker;
}

/** Clean up the HandLandmarker instance */
export async function destroyHandLandmarker(): Promise<void> {
  if (handLandmarker) {
    handLandmarker.close();
    handLandmarker = null;
    initPromise = null;
  }
}
