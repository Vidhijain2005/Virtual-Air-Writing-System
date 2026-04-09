"use client";

import { useState, useCallback, useEffect, useRef } from "react";
// import { motion } from "framer-motion";
import { WebcamFeed } from "./components/webcam-feed";
import { DrawingCanvas } from "./components/drawing-canvas";
import { Toolbar } from "./components/toolbar";
import { StatusIndicator } from "./components/status-indicator";
import { TextPanel } from "./components/text-panel";
// import { ThemeToggle } from "./components/theme-toggle";
import { useHandTracking } from "./hooks/use-hand-tracking";
import { useDrawing, DrawingMode } from "./hooks/use-drawing";
import { createWorker } from "tesseract.js";

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

export default function Home() {
  const [recognizedText, setRecognizedText] = useState("");
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    lines,
    mode,
    setMode,
    brushSize,
    setBrushSize,
    brushColor,
    setBrushColor,
    startDrawing,
    continueDrawing,
    stopDrawing,
    clearCanvas,
    undo,
    eraseAt,
  } = useDrawing();

  const [handDetected, setHandDetected] = useState(false);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const lastFingerPosition = useRef<{ x: number; y: number } | null>(null);
  const modeRef = useRef<DrawingMode>(mode);
  const startDrawingRef = useRef(startDrawing);
  const continueDrawingRef = useRef(continueDrawing);
  const stopDrawingRef = useRef(stopDrawing);
  const clearCanvasRef = useRef(clearCanvas);
  const eraseAtRef = useRef(eraseAt);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    startDrawingRef.current = startDrawing;
  }, [startDrawing]);

  useEffect(() => {
    continueDrawingRef.current = continueDrawing;
  }, [continueDrawing]);

  useEffect(() => {
    stopDrawingRef.current = stopDrawing;
  }, [stopDrawing]);

  useEffect(() => {
    clearCanvasRef.current = clearCanvas;
  }, [clearCanvas]);

  useEffect(() => {
    eraseAtRef.current = eraseAt;
  }, [eraseAt]);

  const handleHandResults = useCallback((landmarks: { indexFingerTip: { x: number; y: number }; isPointing: boolean; isFist: boolean; isOpenPalm: boolean } | null) => {
    if (landmarks) {
      setHandDetected(true);
      const { indexFingerTip, isPointing, isFist, isOpenPalm } = landmarks;

      // Convert normalized coordinates to canvas coordinates
      const x = indexFingerTip.x * CANVAS_WIDTH;
      const y = indexFingerTip.y * CANVAS_HEIGHT;

      const gestureMode: DrawingMode = isOpenPalm
        ? "erasing"
        : isFist
        ? "idle"
        : "writing";

      if (gestureMode !== modeRef.current) {
        setMode(gestureMode);
      }

      if (gestureMode === "writing") {
        if (modeRef.current !== "writing" || !lastFingerPosition.current) {
          startDrawingRef.current(x, y);
        } else {
          continueDrawingRef.current(x, y);
        }
        lastFingerPosition.current = { x, y };
      } else if (gestureMode === "erasing") {
        eraseAtRef.current(x, y);
        lastFingerPosition.current = null;
      } else {
        stopDrawingRef.current();
        lastFingerPosition.current = null;
      }
    } else {
      setHandDetected(false);
      stopDrawing();
      lastFingerPosition.current = null;
    }
  }, [setMode]);

  useHandTracking(videoElement, handleHandResults);

  const handleSave = useCallback(() => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = "drawing.png";
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  }, []);

  const handleDownloadText = useCallback(() => {
    const blob = new Blob([recognizedText], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = "recognized-text.txt";
    link.href = URL.createObjectURL(blob);
    link.click();
  }, [recognizedText]);

  const performOCR = useCallback(async () => {
    if (lines.length === 0) {
      setRecognizedText("");
      return;
    }

    const scale = 2;
    const ocrCanvas = document.createElement("canvas");
    ocrCanvas.width = CANVAS_WIDTH * scale;
    ocrCanvas.height = CANVAS_HEIGHT * scale;
    const ctx = ocrCanvas.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, ocrCanvas.width, ocrCanvas.height);

    lines.forEach(line => {
      if (line.points.length === 0) return;
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#000000";
      ctx.lineWidth = Math.max(line.width * scale, 8);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (line.points.length === 1) {
        const point = line.points[0];
        ctx.beginPath();
        ctx.arc(point.x * scale, point.y * scale, Math.max(line.width * scale, 4), 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(line.points[0].x * scale, line.points[0].y * scale);
      for (let i = 1; i < line.points.length; i++) {
        const point = line.points[i];
        ctx.lineTo(point.x * scale, point.y * scale);
      }
      ctx.stroke();
    });

    setIsProcessingOCR(true);
    try {
      const worker = (await createWorker()) as any;
      await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const { data: { text } } = await worker.recognize(ocrCanvas);
      setRecognizedText(text.trim() || "");
      await worker.terminate();
    } catch (error) {
      console.error("OCR failed:", error);
    } finally {
      setIsProcessingOCR(false);
    }
  }, [lines]);

  const handleModeChange = useCallback((newMode: DrawingMode) => {
    setMode(newMode);
    if (newMode === "idle") {
      performOCR();
    }
  }, [setMode, performOCR]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <header
        className="mx-auto flex max-w-7xl flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">
              Virtual Air Writing Studio
            </p>
            <div>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">
                Write in the air. Capture it instantly.
              </h1>
              <p className="mt-3 max-w-2xl text-slate-400 sm:text-lg">
                Use hand gestures to draw in front of your camera, then convert your handwriting into editable text.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950/80 px-5 py-4 shadow-inner shadow-slate-950/10">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Current mode</p>
              <p className="mt-2 text-xl font-semibold text-white capitalize">{mode}</p>
            </div>
            {/* <ThemeToggle /> */}
          </div>
        </div>
      </header>

      <div className="mx-auto mt-6 grid max-w-7xl gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section
          className="space-y-6"
        >
          <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300/90">
                  Live Capture
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Camera-powered air writing
                </h2>
              </div>
              <StatusIndicator mode={mode} isHandDetected={handDetected} />
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-xl">
              <div className="relative aspect-[4/3] bg-slate-950">
                <WebcamFeed
                  onFrame={() => {} }
                  onReady={setVideoElement}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                />
                <DrawingCanvas
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  lines={lines}
                  onDraw={() => {} }
                  isDrawing={mode === "writing"}
                  canvasRef={canvasRef}
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40">
            <h3 className="text-xl font-semibold text-white">Controls</h3>
            <p className="mt-2 text-sm text-slate-400">
              Use the buttons below to switch modes, adjust your brush, and process your handwriting.
            </p>
            <div className="mt-4">
              <Toolbar
                mode={mode}
                onModeChange={handleModeChange}
                brushSize={brushSize}
                onBrushSizeChange={setBrushSize}
                brushColor={brushColor}
                onBrushColorChange={setBrushColor}
                onClear={clearCanvas}
                onUndo={undo}
                onSave={handleSave}
                onRecognize={performOCR}
                onDownload={handleDownloadText}
              />
            </div>
          </div>
        </section>

        <aside
          className="flex flex-col gap-6"
        >
          <TextPanel
            recognizedText={recognizedText}
            onEdit={setRecognizedText}
            onDownload={handleDownloadText}
            isProcessing={isProcessingOCR}
          />

          <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/90">
                  Tips for success
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">Write clearly for best OCR results</h3>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              <li>• Hold your hand steady and make larger strokes.</li>
              <li>• Use a darker brush color and increase brush size if needed.</li>
              <li>• Pause briefly after finishing before recognizing text.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
