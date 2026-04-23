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
}

interface UseHandFaceProximityReturn {
  debugInfo: DebugInfo;
  isModelLoading: boolean;
  modelError: string | null;
  /** True while hand is near nose — drives animation visibility */
  isHandNearNose: boolean;
}

/**
 * Orchestrates real-time face + hand detection, proximity calculation,
 * coordinate smoothing, and continuous proximity state tracking.
 */
export function useHandFaceProximity({
  videoRef,
  canvasRef,
  cameraStatus,
  debugMode,
}: UseHandFaceProximityOptions): UseHandFaceProximityReturn {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isHandNearNose, setIsHandNearNose] = useState(false);
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
  const debugInfoRef = useRef(debugInfo);

  // Keep ref to debugMode for rAF loop
  const debugModeRef = useRef(debugMode);
  debugModeRef.current = debugMode;

  // Wire state machine to React state
  useEffect(() => {
    stateMachine.current.setOnStateChange((active) => {
      setIsHandNearNose(active);
    });
  }, []);

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
    return () => { cancelled = true; };
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

    // Throttle to ~30fps for detection (saves CPU)
    if (now - lastFrameTime.current < 33) {
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
      // Detection error — skip frame
    }

    // Compute proximity
    let isClose = false;
    if (smoothedNose && smoothedHand && faceWidth > MIN_FACE_WIDTH) {
      rawDist = euclideanDistance(smoothedNose, smoothedHand);
      normDist = normalizeDistance(rawDist, faceWidth);
      normDist = distanceSmoother.current.smooth(normDist);
      isClose = normDist < DEFAULT_DETECTION_CONFIG.proximityThreshold;
    } else {
      distanceSmoother.current.reset();
    }

    // Update state machine (drives isHandNearNose)
    stateMachine.current.processFrame(isClose);

    // Debug drawing
    if (debugModeRef.current) {
      drawDebugOverlay(ctx, canvas.width, canvas.height, smoothedNose, smoothedHand, isClose);
    }

    // Throttle debug info updates to ~10fps to reduce re-renders
    const newInfo: DebugInfo = {
      cameraStatus: "active",
      faceDetected,
      handDetected,
      normalizedDistance: normDist !== null ? Math.round(normDist * 100) / 100 : null,
      rawDistance: rawDist !== null ? Math.round(rawDist * 1000) / 1000 : null,
      triggerState: stateMachine.current.getState(),
      consecutiveFrames: stateMachine.current.getConsecutiveFrames(),
      fps: fpsCounter.current.fps,
    };

    // Only update React state if something meaningful changed
    const prev = debugInfoRef.current;
    if (
      prev.faceDetected !== newInfo.faceDetected ||
      prev.handDetected !== newInfo.handDetected ||
      prev.triggerState !== newInfo.triggerState ||
      prev.consecutiveFrames !== newInfo.consecutiveFrames ||
      prev.fps !== newInfo.fps ||
      prev.normalizedDistance !== newInfo.normalizedDistance
    ) {
      debugInfoRef.current = newInfo;
      setDebugInfo(newInfo);
    }

    animFrameRef.current = requestAnimationFrame(detectFrame);
  }, [videoRef, canvasRef]);

  // Start/stop detection loop
  useEffect(() => {
    if (cameraStatus === "active" && modelsReady.current) {
      animFrameRef.current = requestAnimationFrame(detectFrame);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [cameraStatus, detectFrame, isModelLoading]);

  // Full cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stateMachine.current.destroy();
      noseSmoother.current.reset();
      handSmoother.current.reset();
      distanceSmoother.current.reset();
      destroyFaceLandmarker();
      destroyHandLandmarker();
    };
  }, []);

  // Sync camera status
  useEffect(() => {
    setDebugInfo((prev) => ({ ...prev, cameraStatus }));
  }, [cameraStatus]);

  return { debugInfo, isModelLoading, modelError, isHandNearNose };
}
