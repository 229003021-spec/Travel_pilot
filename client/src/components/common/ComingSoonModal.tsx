import React from "react";
import { X, Sparkles, Database, FileCode, ArrowRight, ShieldCheck } from "lucide-react";

interface Props {
  title: string;
  categoryNumber: number | string;
  description: string;
  schemaPreview: object;
  isOpen: boolean;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<Props> = ({
  title,
  categoryNumber,
  description,
  schemaPreview,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Module #{categoryNumber} Architecture Schema
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Database className="w-3.5 h-3.5" /> Coming Soon — Awaiting Dataset Input
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          </div>

          {/* Schema Json Preview */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-blue-400" /> Configured Schema Contract (Ready for Ingestion)
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56">
              {JSON.stringify(schemaPreview, null, 2)}
            </pre>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800 text-xs text-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider text-blue-300 mr-2">[Ready for Ingestion]</span>
              Once you provide the dataset file or API endpoint for this module, TravelPilot will immediately connect it to the core optimization engine.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
