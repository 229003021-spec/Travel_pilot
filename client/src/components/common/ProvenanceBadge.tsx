import React from "react";
import { DataProvenance } from "../../../../shared/types";
import { ShieldCheck, Cpu, Database } from "lucide-react";

interface Props {
  provenance: DataProvenance;
  sourceId?: string;
  size?: "sm" | "md";
}

export const ProvenanceBadge: React.FC<Props> = ({ provenance, size = "sm" }) => {
  if (provenance === "verified") {
    return (
      <span className={`inline-flex items-center gap-1 font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded ${size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"}`}>
        <ShieldCheck className="w-3 h-3" />
        Verified Live
      </span>
    );
  }

  if (provenance === "estimated") {
    return (
      <span className={`inline-flex items-center gap-1 font-medium bg-sky-950/80 text-sky-400 border border-sky-800/60 rounded ${size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"}`}>
        <Cpu className="w-3 h-3" />
        Model Estimated
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium bg-amber-950/80 text-amber-400 border border-amber-800/60 rounded ${size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm"}`}>
      <Database className="w-3 h-3" />
      Demo Fixture
    </span>
  );
};
