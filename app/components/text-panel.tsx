"use client";

import { Button } from "./ui/button";
import { FileText, Download } from "lucide-react";

interface TextPanelProps {
  recognizedText: string;
  onEdit: (text: string) => void;
  onDownload: () => void;
  isProcessing: boolean;
}

export function TextPanel({ recognizedText, onEdit, onDownload, isProcessing }: TextPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl shadow-slate-950/40">
      <div className="mb-5 flex items-center gap-3">
        <FileText className="h-5 w-5 text-cyan-300" />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Recognized handwriting</p>
          <h3 className="text-xl font-semibold text-white">Captured text</h3>
        </div>
      </div>

      {isProcessing ? (
        <div className="flex flex-1 items-center justify-center rounded-3xl border border-white/10 bg-slate-950/80 p-8">
          <p className="text-slate-400">Processing handwriting...</p>
        </div>
      ) : (
        <textarea
          value={recognizedText}
          onChange={(e) => onEdit(e.target.value)}
          className="min-h-[320px] flex-1 resize-none rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
          placeholder="Recognized text will appear here..."
        />
      )}

      <div className="mt-5 flex justify-end">
        <Button variant="ghost" onClick={onDownload} disabled={!recognizedText}>
          <Download className="mr-2 h-4 w-4" />
          Download text
        </Button>
      </div>
    </div>
  );
}