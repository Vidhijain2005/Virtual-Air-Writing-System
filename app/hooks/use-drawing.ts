"use client";

import { useState, useCallback, useRef } from "react";

export type DrawingMode = "writing" | "erasing" | "idle";

export interface Line {
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
}

export function useDrawing() {
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const [mode, setMode] = useState<DrawingMode>("idle");
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const lastPosition = useRef<{ x: number; y: number } | null>(null);

  const startDrawing = useCallback((x: number, y: number) => {
    if (mode === "writing") {
      const newLine: Line = {
        points: [{ x, y }],
        color: brushColor,
        width: brushSize,
      };
      setCurrentLine(newLine);
      lastPosition.current = { x, y };
    }
  }, [mode, brushColor, brushSize]);

  const continueDrawing = useCallback((x: number, y: number) => {
    if (currentLine && mode === "writing") {
      // Interpolate points for smoother lines
      const lastPoint = currentLine.points[currentLine.points.length - 1];
      const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);
      const steps = Math.max(1, Math.floor(distance / 2)); // Interpolate every 2 pixels

      const newPoints: Array<{ x: number; y: number }> = [];
      for (let i = 1; i <= steps; i++) {
        const ratio = i / steps;
        newPoints.push({
          x: lastPoint.x + (x - lastPoint.x) * ratio,
          y: lastPoint.y + (y - lastPoint.y) * ratio,
        });
      }

      setCurrentLine(prev => prev ? {
        ...prev,
        points: [...prev.points, ...newPoints],
      } : null);
    }
  }, [currentLine, mode]);

  const stopDrawing = useCallback(() => {
    if (currentLine) {
      setLines(prev => [...prev, currentLine]);
      setCurrentLine(null);
    }
    lastPosition.current = null;
  }, [currentLine]);

  const clearCanvas = useCallback(() => {
    setLines([]);
    setCurrentLine(null);
    lastPosition.current = null;
  }, []);

  const undo = useCallback(() => {
    setLines(prev => prev.slice(0, -1));
  }, []);

  const redo = useCallback(() => {
    // For simplicity, no redo implemented
  }, []);

  const eraseAt = useCallback((x: number, y: number) => {
    if (mode === "erasing") {
      // Simple erase: remove lines near the point
      setLines(prev => prev.filter(line => {
        return !line.points.some(point => {
          const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
          return distance < brushSize;
        });
      }));
    }
  }, [mode, brushSize]);

  return {
    lines: currentLine ? [...lines, currentLine] : lines,
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
    redo,
    eraseAt,
  };
}