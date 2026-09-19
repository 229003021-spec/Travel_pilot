import React from "react";
import { useTripStore } from "../../store/useTripStore";
import { BookOpen, ExternalLink, ShieldCheck, Database, Calendar } from "lucide-react";
import { ProvenanceBadge } from "../common/ProvenanceBadge";

export const ResearchSourcesView: React.FC = () => {
  const { trip } = useTripStore();

  if (!trip) return null;

  const sources = trip.sources || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Research Pipeline Data Provenance
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every opening hour, ticket fee, and attraction fact is linked to an authoritative source or explicit model estimate.
          </p>
        </div>

        <div className="text-xs text-indigo-300 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800 font-mono">
          {sources.length} Data Sources Captured
        </div>
      </div>

      {/* Honest Demo Mode Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start gap-3">
        <Database className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-amber-300 mr-2">[Demo Mode Data Provenance]</span>
          Currently operating using curated prototype fixtures (`demo` & `estimated` provenance). When live API keys (`SEARCH_API_KEY`, `PLACES_API_KEY`) are present in `.env`, TravelPilot performs real-time web scraping & places verification.
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-4">
        {sources.map((src) => (
          <div key={src.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                {src.title}
                {src.url && (
                  <a href={src.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </span>
              <ProvenanceBadge provenance={src.provenance} />
            </div>

            {src.snippet && <p className="text-xs text-slate-400">{src.snippet}</p>}

            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Retrieved at: {new Date(src.retrievedAt).toLocaleString()}
              </span>
              <span>Source Provider: {src.source}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
