"use client";

import { Button } from "./ui/button";
import { Palette, Eraser, Trash2, Undo, Download, Save, FileText } from "lucide-react";
import { DrawingMode } from "../hooks/use-drawing";

interface ToolbarProps {
  mode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;
  brushColor: string;
  onBrushColorChange: (color: string) => void;
  onClear: () => void;
  onUndo: () => void;
  onSave: () => void;
  onDownload: () => void;
  onRecognize: () => void;
}

export function Toolbar({
  mode,
  onModeChange,
  brushSize,
  onBrushSizeChange,
  brushColor,
  onBrushColorChange,
  onClear,
  onUndo,
  onSave,
  onRecognize,
  onDownload,
}: ToolbarProps) {
  return (
    <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-xl shadow-slate-950/20">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={mode === "writing" ? "default" : "ghost"}
          onClick={() => onModeChange("writing")}
        >
          <Palette className="mr-2 h-4 w-4" />
          Write
        </Button>
        <Button
          variant={mode === "erasing" ? "default" : "ghost"}
          onClick={() => onModeChange("erasing")}
        >
          <Eraser className="mr-2 h-4 w-4" />
          Erase
        </Button>
        <Button variant="ghost" onClick={onUndo}>
          <Undo className="mr-2 h-4 w-4" />
          Undo
        </Button>
        <Button variant="ghost" onClick={onClear}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900 p-3">
          <label className="text-sm text-slate-400">Brush size</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => onBrushSizeChange(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <span className="w-8 text-right text-sm text-white">{brushSize}</span>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-900 p-3">
          <label className="text-sm text-slate-400">Color</label>
          <input
            type="color"
            value={brushColor}
            onChange={(e) => onBrushColorChange(e.target.value)}
            className="h-10 w-10 rounded-full border border-white/10"
          />
          <span className="text-sm text-white">Preview</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="default" onClick={onRecognize}>
          <FileText className="mr-2 h-4 w-4" />
          Recognize
        </Button>
        <Button variant="ghost" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Image
        </Button>
        <Button variant="ghost" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download TXT
        </Button>
      </div>
    </div>
  );
}