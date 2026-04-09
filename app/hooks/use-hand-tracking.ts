"use client";

import { useEffect, useRef, useState } from "react";

interface HandLandmarks {
  indexFingerTip: { x: number; y: number };
  isPointing: boolean;
  isFist: boolean;
  isOpenPalm: boolean;
}

export function useHandTracking(videoElement: HTMLVideoElement | null, onResults: (landmarks: HandLandmarks | null) => void) {
  const handsRef = useRef<any>(null);
  const frameIdRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let active = true;

    if (!videoElement) return;

    const initializeHands = async () => {
      try {
        const { Hands } = await import("@mediapipe/hands");

        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        hands.onResults((results) => {
          if (!active) return;

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            const indexTip = landmarks[8];
            const indexPip = landmarks[6];

            const isIndexFingerUp = indexTip.y < indexPip.y;
            const middleTip = landmarks[12];
            const ringTip = landmarks[16];
            const pinkyTip = landmarks[20];
            const middlePip = landmarks[10];
            const ringPip = landmarks[14];
            const pinkyPip = landmarks[18];

            // Relax pointing detection - just need index up and others mostly folded
            const isPointing =
              isIndexFingerUp &&
              middleTip.y > middlePip.y - 0.05 &&
              ringTip.y > ringPip.y - 0.05 &&
              pinkyTip.y > pinkyPip.y - 0.05;

            const fingerTips = [landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
            const fingerPips = [landmarks[6], landmarks[10], landmarks[14], landmarks[18]];
            const isFist = fingerTips.every((tip, i) => tip.y > fingerPips[i].y);
            const isOpenPalm = fingerTips.every((tip, i) => tip.y < fingerPips[i].y);

            onResults({
              indexFingerTip: { x: indexTip.x, y: indexTip.y },
              isPointing,
              isFist,
              isOpenPalm,
            });
          } else {
            onResults(null);
          }
        });

        handsRef.current = hands;

        const processFrame = async () => {
          if (!active) return;
          if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
            await hands.send({ image: videoElement });
          }
          frameIdRef.current = requestAnimationFrame(processFrame);
        };

        if (videoElement.readyState >= videoElement.HAVE_ENOUGH_DATA) {
          processFrame();
          setIsInitialized(true);
        } else {
          const onLoaded = () => {
            if (!active) return;
            processFrame();
            setIsInitialized(true);
          };
          videoElement.addEventListener("loadeddata", onLoaded);
          return () => {
            videoElement.removeEventListener("loadeddata", onLoaded);
          };
        }
      } catch (error) {
        console.error("Failed to initialize hand tracking:", error);
        // Do not set isInitialized, so it doesn't try again
      }
    };

    initializeHands();

    return () => {
      active = false;
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, [videoElement, onResults]);

  return { isInitialized };
}