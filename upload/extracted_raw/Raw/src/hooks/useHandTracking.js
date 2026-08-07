import { useRef, useState, useEffect } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export const useHandTracking = (videoRef, onHandMove, onPinch) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const handLandmarkerRef = useRef(null);
  const rafRef = useRef(null);
  const isPinchingRef = useRef(false);

  useEffect(() => {
    const loadModel = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );
      handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
    };
    loadModel();
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.addEventListener("loadeddata", predict);
      setIsCameraOn(true);
    } catch (err) {
      console.error("Camera access denied", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      cancelAnimationFrame(rafRef.current);
      setIsCameraOn(false);
    }
  };

  const predict = () => {
    if (!handLandmarkerRef.current || !videoRef.current || videoRef.current.readyState < 2) {
      rafRef.current = requestAnimationFrame(predict);
      return;
    }

    const video = videoRef.current;
    const now = performance.now();
    const results = handLandmarkerRef.current.detectForVideo(video, now);

    if (results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      
      // Index finger tip (landmark 8) and Thumb tip (landmark 4)
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
    rafRef.current = requestAnimationFrame(predict);
  };

  return { isCameraOn, startCamera, stopCamera };
};