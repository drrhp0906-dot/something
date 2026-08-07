'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface UseHandTrackingReturn {
  isCameraOn: boolean;
  isLoading: boolean;
  startCamera: () => void;
  stopCamera: () => void;
}

export function useHandTracking(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  onHandMove?: (x: number, y: number) => void,
  onPinch?: (pinching: boolean, x: number, y: number) => void
): UseHandTrackingReturn {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handLandmarkerRef = useRef<unknown>(null);
  const rafRef = useRef<number>(0);
  const isPinchingRef = useRef(false);
  const isRunningRef = useRef(false);

  // Load MediaPipe model
  useEffect(() => {
    let cancelled = false;

    const loadModel = async () => {
      try {
        setIsLoading(true);
        const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');

        if (cancelled) return;

        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        );

        if (cancelled) return;

        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load hand tracking model:', err);
        setIsLoading(false);
      }
    };

    loadModel();

    return () => {
      cancelled = true;
    };
  }, []);

  const predict = useCallback(() => {
    if (!isRunningRef.current) return;

    const handLandmarker = handLandmarkerRef.current as {
      detectForVideo: (video: HTMLVideoElement, timestamp: number) => {
        landmarks: Array<Array<{ x: number; y: number; z: number }>>;
      };
    } | null;

    if (!handLandmarker || !videoRef.current || videoRef.current.readyState < 2) {
      rafRef.current = requestAnimationFrame(predict);
      return;
    }

    const video = videoRef.current;
    const now = performance.now();

    try {
      const results = handLandmarker.detectForVideo(video, now);

      if (results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const indexTip = landmarks[8];
        const thumbTip = landmarks[4];

        // Map to screen coordinates (invert X for mirror view)
        const x = (1 - indexTip.x) * window.innerWidth;
        const y = indexTip.y * window.innerHeight;

        if (onHandMove) onHandMove(x, y);

        // Calculate pinch distance
        const dist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
        const pinching = dist < 0.05;

        if (pinching !== isPinchingRef.current) {
          isPinchingRef.current = pinching;
          if (onPinch) onPinch(pinching, x, y);
        }
      }
    } catch {
      // Model might not be ready yet
    }

    rafRef.current = requestAnimationFrame(predict);
  }, [videoRef, onHandMove, onPinch]);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices || !videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      isRunningRef.current = true;
      videoRef.current.addEventListener('loadeddata', predict);
      setIsCameraOn(true);
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }, [videoRef, predict]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    isRunningRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setIsCameraOn(false);
  }, [videoRef]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { isCameraOn, isLoading, startCamera, stopCamera };
}
