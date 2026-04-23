"use client";

import { useState, useRef, useCallback } from "react";
import type { CameraStatus } from "@/types/vision";

const VIDEO_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 640 },
    height: { ideal: 480 },
    facingMode: "user",
    frameRate: { ideal: 30 },
  },
  audio: false,
};

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraStatus: CameraStatus;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  error: string | null;
}

/**
 * Hook to manage webcam stream lifecycle.
 * Handles permissions, stream setup, and cleanup.
 */
export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus("idle");
    setError(null);
  }, []);

  const startCamera = useCallback(async () => {
    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("error");
      setError("Your browser does not support camera access.");
      return;
    }

    setCameraStatus("requesting");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraStatus("active");
      }
    } catch (err) {
      const message =
        err instanceof DOMException
          ? err.name === "NotAllowedError"
            ? "Camera access was denied. Please allow camera permissions."
            : err.name === "NotFoundError"
            ? "No camera found on this device."
            : `Camera error: ${err.message}`
          : "Failed to access camera.";

      setCameraStatus(err instanceof DOMException && err.name === "NotAllowedError" ? "denied" : "error");
      setError(message);
    }
  }, []);

  return { videoRef, cameraStatus, startCamera, stopCamera, error };
}
