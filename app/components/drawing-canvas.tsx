"use client";

import { useEffect, useRef, useCallback } from "react";

interface DrawingCanvasProps {
  width: number;
  height: number;
  lines: Array<{ points: Array<{ x: number; y: number }>; color: string; width: number }>;
  onDraw: (x: number, y: number) => void;
  isDrawing: boolean;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function DrawingCanvas({ width, height, lines, onDraw, isDrawing, canvasRef: externalCanvasRef }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvases = [canvasRef.current, externalCanvasRef?.current].filter(Boolean) as HTMLCanvasElement[];

    canvases.forEach(canvas => {
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      if (canvas === externalCanvasRef?.current) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }

      lines.forEach(line => {
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (line.points.length === 1) {
          ctx.beginPath();
          ctx.arc(line.points[0].x, line.points[0].y, line.width / 2, 0, Math.PI * 2);
          ctx.fillStyle = line.color;
          ctx.fill();
          return;
        }

        if (line.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(line.points[0].x, line.points[0].y);

        for (let i = 1; i < line.points.length; i++) {
          ctx.lineTo(line.points[i].x, line.points[i].y);
        }

        ctx.stroke();
      });
    });
  }, [lines, width, height, externalCanvasRef]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
    />
  );
}