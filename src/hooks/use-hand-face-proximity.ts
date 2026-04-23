"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import type { DebugInfo, CameraStatus, NormalizedPoint } from "@/types/vision";
import {
  initFaceLandmarker,
  getFaceLandmarker,
  destroyFaceLandmarker,
} from "@/lib/mediapipe/face-landmarker";
import {
  initHandLandmarker,
  getHandLandmarker,
  destroyHandLandmarker,
} from "@/lib/mediapipe/hand-landmarker";
import {
  getNosePoint,
  getHandPoint,
  computeFaceWidth,
  euclideanDistance,
  normalizeDistance,
} from "@/lib/vision/geometry";
import { LandmarkSmoother, ScalarSmoother } from "@/lib/vision/smoothing";
import { DetectionStateMachine } from "@/lib/vision/detection-state";
import { DEFAULT_DETECTION_CONFIG, MIN_FACE_WIDTH } from "@/lib/vision/thresholds";
import { drawDebugOverlay } from "@/lib/mediapipe/drawing";

interface UseHandFaceProximityOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraStatus: CameraStatus;
  debugMode: boolean;
  onTrigger: () => void;
}

interface UseHandFaceProximityReturn {
  debugInfo: DebugInfo;
  isModelLoading: boolean;
  modelError: string | null;
}

/**
 * Orchestrates real-time face + hand detection, proximity calculation,
 * coordinate smoothing, debounced triggering, and debug rendering.
 */
export function useHandFaceProximity({
  videoRef,
  canvasRef,
  cameraStatus,
  debugMode,
  onTrigger,
}: UseHandFaceProximityOptions): UseHandFaceProximityReturn {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    cameraStatus: "idle",
    faceDetected: false,
    handDetected: false,
    normalizedDistance: null,
    rawDistance: null,
    triggerState: "idle",
    consecutiveFrames: 0,
    fps: 0,
  });

  const animFrameRef = useRef<number>(0);
  const noseSmoother = useRef(new LandmarkSmoother(DEFAULT_DETECTION_CONFIG.smoothingAlpha));
  const handSmoother = useRef(new LandmarkSmoother(DEFAULT_DETECTION_CONFIG.smoothingAlpha));
  const distanceSmoother = useRef(new ScalarSmoother(0.3));
  const stateMachine = useRef(new DetectionStateMachine(DEFAULT_DETECTION_CONFIG));
  const lastFrameTime = useRef(0);
  const fpsCounter = useRef({ frames: 0, lastCheck: 0, fps: 0 });
  const modelsReady = useRef(false);

  // Keep refs to latest values for the rAF loop (avoids stale closures)
  const debugModeRef = useRef(debugMode);
  debugModeRef.current = debugMode;
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  // Initialize models when camera becomes active
  useEffect(() => {
    if (cameraStatus !== "active") return;

    let cancelled = false;

    async function loadModels() {
      setIsModelLoading(true);
      setModelError(null);
      try {
        await Promise.all([initFaceLandmarker(), initHandLandmarker()]);
        if (!cancelled) {
          modelsReady.current = true;
          setIsModelLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setModelError(
            err instanceof Error ? err.message : "Failed to load ML models"
          );
          setIsModelLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      cancelled = true;
    };
  }, [cameraStatus]);

  // Detection loop using requestAnimationFrame
  const detectFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !modelsReady.current || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    const now = performance.now();

    // FPS tracking
    fpsCounter.current.frames++;
    if (now - fpsCounter.current.lastCheck >= 1000) {
      fpsCounter.current.fps = fpsCounter.current.frames;
      fpsCounter.current.frames = 0;
      fpsCounter.current.lastCheck = now;
    }

    // Throttle to ~60fps max
    if (now - lastFrameTime.current < 16) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }
    lastFrameTime.current = now;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Run detections
    let faceDetected = false;
    let handDetected = false;
    let smoothedNose: NormalizedPoint | null = null;
    let smoothedHand: NormalizedPoint | null = null;
    let faceWidth = 0;
    let rawDist: number | null = null;
    let normDist: number | null = null;

    try {
      const faceLM = getFaceLandmarker();
      const handLM = getHandLandmarker();

      // Face detection
      if (faceLM) {
        const faceResult = faceLM.detectForVideo(video, now);
        if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
          const landmarks = faceResult.faceLandmarks[0];
          faceDetected = true;
          const rawNose = getNosePoint(landmarks);
          smoothedNose = noseSmoother.current.smooth(rawNose);
          faceWidth = computeFaceWidth(landmarks);
        } else {
          noseSmoother.current.reset();
        }
      }

      // Hand detection
      if (handLM) {
        const handResult = handLM.detectForVideo(video, now);
        if (handResult.landmarks && handResult.landmarks.length > 0) {
          const landmarks = handResult.landmarks[0];
          handDetected = true;
          const rawHand = getHandPoint(landmarks);
          smoothedHand = handSmoother.current.smooth(rawHand);
        } else {
          handSmoother.current.reset();
        }
      }
    } catch {
      // Detection error — skip this frame silently
    }

    // Compute proximity distance
    let isClose = false;
    if (smoothedNose && smoothedHand && faceWidth > MIN_FACE_WIDTH) {
      rawDist = euclideanDistance(smoothedNose, smoothedHand);
      normDist = normalizeDistance(rawDist, faceWidth);
      normDist = distanceSmoother.current.smooth(normDist);
      isClose = normDist < DEFAULT_DETECTION_CONFIG.proximityThreshold;
    } else {
      distanceSmoother.current.reset();
    }

    // Update state machine
    stateMachine.current.setOnTrigger(() => onTriggerRef.current());
    stateMachine.current.processFrame(isClose);

    // Debug overlay drawing
    if (debugModeRef.current) {
      drawDebugOverlay(
        ctx,
        canvas.width,
        canvas.height,
        smoothedNose,
        smoothedHand,
        isClose
      );
    }

    // Update debug info state
    setDebugInfo({
      cameraStatus: "active",
      faceDetected,
      handDetected,
      normalizedDistance: normDist !== null ? Math.round(normDist * 100) / 100 : null,
      rawDistance: rawDist !== null ? Math.round(rawDist * 1000) / 1000 : null,
      triggerState: stateMachine.current.getState(),
      consecutiveFrames: stateMachine.current.getConsecutiveFrames(),
      fps: fpsCounter.current.fps,
    });

    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [videoRef, canvasRef]);

  // Start/stop detection loop based on camera and model state
  useEffect(() => {
    if (cameraStatus === "active" && modelsReady.current) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [cameraStatus, detectFrame, isModelLoading]);

  // Full cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      stateMachine.current.destroy();
      noseSmoother.current.reset();
      handSmoother.current.reset();
      distanceSmoother.current.reset();
      destroyFaceLandmarker();
      destroyHandLandmarker();
    };
  }, []);

  // Keep debug info camera status in sync
  useEffect(() => {
    setDebugInfo((prev) => ({ ...prev, cameraStatus }));
  }, [cameraStatus]);

  return { debugInfo, isModelLoading, modelError };
}
