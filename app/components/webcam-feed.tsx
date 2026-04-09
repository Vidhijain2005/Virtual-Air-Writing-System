"use client";

import { useEffect, useRef, useState } from "react";

interface WebcamFeedProps {
  onFrame: (video: HTMLVideoElement) => void;
  onReady?: (video: HTMLVideoElement) => void;
  width: number;
  height: number;
}

export function WebcamFeed({ onFrame, onReady, width, height }: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width, height, facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsLoading(false);
            if (videoRef.current && onReady) {
              onReady(videoRef.current);
            }
          };
        }
      } catch (err) {
        setError("Failed to access webcam");
        setIsLoading(false);
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [width, height]);

  useEffect(() => {
    const video = videoRef.current;
    const frameIdRef = { current: 0 };
    if (!video) return;

    const handleFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        onFrame(video);
      }
      frameIdRef.current = requestAnimationFrame(handleFrame);
    };

    frameIdRef.current = requestAnimationFrame(handleFrame);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
    };
  }, [onFrame]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p>Loading webcam...</p>
        </div>
      )}
      <video
        ref={videoRef}
        className="rounded-lg"
        style={{ display: isLoading ? "none" : "block" }}
        muted
        playsInline
      />
    </div>
  );
}