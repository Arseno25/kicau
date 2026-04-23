import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import { MEDIAPIPE_CONFIG } from "@/lib/vision/thresholds";

let faceLandmarker: FaceLandmarker | null = null;
let initPromise: Promise<FaceLandmarker> | null = null;

/**
 * Initialize the MediaPipe FaceLandmarker singleton.
 * Uses CDN-hosted WASM and model files so no local model download is required.
 * Caches the instance to avoid re-initialization.
 */
export async function initFaceLandmarker(): Promise<FaceLandmarker> {
  if (faceLandmarker) return faceLandmarker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "CPU",
      },
      runningMode: "VIDEO",
      numFaces: MEDIAPIPE_CONFIG.maxNumFaces,
      minFaceDetectionConfidence: MEDIAPIPE_CONFIG.faceMinDetectionConfidence,
      minTrackingConfidence: MEDIAPIPE_CONFIG.faceMinTrackingConfidence,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false,
    });

    return faceLandmarker;
  })();

  return initPromise;
}

/** Get the current FaceLandmarker instance (null if not initialized) */
export function getFaceLandmarker(): FaceLandmarker | null {
  return faceLandmarker;
}

/** Clean up the FaceLandmarker instance */
export async function destroyFaceLandmarker(): Promise<void> {
  if (faceLandmarker) {
    faceLandmarker.close();
    faceLandmarker = null;
    initPromise = null;
  }
}
