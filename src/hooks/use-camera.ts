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
      setError("Browser tidak mendukung akses kamera.");
      return;
    }

    setCameraStatus("requesting");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;

        // Try multiple approaches to play the video
        const tryPlay = async () => {
          if (!videoRef.current) return false;

          // Method 1: Direct play
          try {
            await videoRef.current.play();
            setCameraStatus("active");
            return true;
          } catch {
            // Method 2: Wait for metadata then play
            return new Promise<boolean>((resolve) => {
              const onLoaded = () => {
                videoRef.current?.play().then(() => {
                  setCameraStatus("active");
                  resolve(true);
                }).catch(() => resolve(false));
              };

              if (videoRef.current && videoRef.current.readyState >= 2) {
                onLoaded();
              } else {
                videoRef.current?.addEventListener("loadedmetadata", onLoaded, { once: true });
              }

              // Timeout fallback
              setTimeout(() => {
                videoRef.current?.play().then(() => {
                  setCameraStatus("active");
                  resolve(true);
                }).catch(() => {
                  // Set active anyway - stream is connected
                  setCameraStatus("active");
                  resolve(false);
                });
              }, 1000);
            });
          }
        };

        const played = await tryPlay();

        if (!played) {
          // Set up click handler as fallback
          const enableStream = () => {
            videoRef.current?.play().then(() => {
              setCameraStatus("active");
            }).catch(console.error);
          };

          document.addEventListener("click", enableStream, { once: true });
          document.addEventListener("touchstart", enableStream, { once: true });

          // Set active after short delay
          setTimeout(() => setCameraStatus("active"), 100);
        }
      }
    } catch (err) {
      const message =
        err instanceof DOMException
          ? err.name === "NotAllowedError"
            ? "Izin kamera ditolak. Izinkan akses kamera."
            : err.name === "NotFoundError"
            ? "Tidak ada kamera di perangkat ini."
            : `Error kamera: ${err.message}`
          : "Gagal mengakses kamera.";

      setCameraStatus(err instanceof DOMException && err.name === "NotAllowedError" ? "denied" : "error");
      setError(message);
    }
  }, []);

  return { videoRef, cameraStatus, startCamera, stopCamera, error };
}
