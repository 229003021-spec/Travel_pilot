import React from "react";
import { DataProvenance } from "../../../../shared/types";
import { ShieldCheck, Cpu, Database, Sparkles } from "lucide-react";

interface Props {
  provenance?: DataProvenance;
  type?: string;
  label?: string;
  sourceId?: string;
  size?: "sm" | "md";
}

export const ProvenanceBadge: React.FC<Props> = ({ provenance, type, label, size = "sm" }) => {
  const p = (provenance || type || "verified").toString().toLowerCase();

  if (p === "verified") {
    return (
      <span className={`inline-flex items-center gap-1 font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 rounded-md ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}>
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        {label || "VERIFIED DATASET"}
      </span>
    );
  }

  if (p === "estimated" || p === "calculated") {
    return (
      <span className={`inline-flex items-center gap-1 font-bold bg-sky-950/90 text-sky-300 border border-sky-800/80 rounded-md ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}>
        <Cpu className="w-3 h-3 text-sky-400" />
        {label || "CALCULATED DATA"}
      </span>
    );
  }

  if (p === "live") {
    return (
      <span className={`inline-flex items-center gap-1 font-bold bg-indigo-950/90 text-indigo-300 border border-indigo-800/80 rounded-md ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}>
        <Sparkles className="w-3 h-3 text-indigo-400" />
        {label || "LIVE DATA"}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-bold bg-amber-950/90 text-amber-300 border border-amber-800/80 rounded-md ${size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}>
      <Database className="w-3 h-3 text-amber-400" />
      {label || "DEMO FIXTURE"}
    </span>
  );
};
