"use client";

import { DrawingMode } from "../hooks/use-drawing";

interface StatusIndicatorProps {
  mode: DrawingMode;
  isHandDetected: boolean;
}

export function StatusIndicator({ mode, isHandDetected }: StatusIndicatorProps) {
  const getStatusText = () => {
    if (!isHandDetected) return "No hand detected";
    switch (mode) {
      case "writing":
        return "Writing mode - Point with index finger";
      case "erasing":
        return "Erasing mode - Show open palm to erase";
      case "idle":
        return "Idle - Make a gesture to start";
      default:
        return "Ready";
    }
  };

  const getStatusColor = () => {
    if (!isHandDetected) return "text-gray-500";
    switch (mode) {
      case "writing":
        return "text-blue-500";
      case "erasing":
        return "text-red-500";
      case "idle":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/90 px-4 py-3 shadow-inner shadow-slate-950/10">
      <div className="flex items-center gap-3">
        <span className={`inline-flex h-3.5 w-3.5 rounded-full ${isHandDetected ? "bg-emerald-400" : "bg-rose-400"}`} />
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Gesture status</p>
          <p className={`mt-1 text-sm font-medium ${getStatusColor()}`}>{getStatusText()}</p>
        </div>
      </div>
    </div>
  );
}