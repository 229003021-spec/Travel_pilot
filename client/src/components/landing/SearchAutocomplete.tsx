import React, { useState, useRef, useEffect } from "react";
import top500Destinations from "../../data/top500_destinations.json";
import { Search, MapPin, ArrowRight, Sparkles, X } from "lucide-react";

interface Props {
  onSelectDestination: (destName: string) => void;
}

export const SearchAutocomplete: React.FC<Props> = ({ onSelectDestination }) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter & sort suggestions alphabetically (A to Z)
  const suggestions = query.trim()
    ? top500Destinations
        .filter((d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.state.toLowerCase().includes(query.toLowerCase()) ||
          d.region.toLowerCase().includes(query.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, 10)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    setQuery(name);
    setIsOpen(false);
    onSelectDestination(name);
  };

  return (
    <div ref={dropdownRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="w-5 h-5 text-blue-400 absolute left-4 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search any destination in India (e.g. Taj Mahal, Goa, Jaipur, Hampi, Leh)..."
          className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-blue-500 rounded-3xl pl-12 pr-10 py-4 text-sm text-white placeholder-slate-400 outline-none shadow-2xl transition"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="absolute right-4 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Vertical Suggestions Dropdown (Alphabetical A-Z) */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/80 max-h-80 overflow-y-auto animate-in fade-in duration-150">
          <div className="px-4 py-2 bg-slate-950/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Alphabetical Matching Destinations</span>
            <span className="text-blue-400 font-mono">{suggestions.length} Results</span>
          </div>

          {suggestions.map((dest) => (
            <div
              key={dest.id}
              onClick={() => handleSelect(dest.name)}
              className="p-3.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 group-hover:scale-110 transition">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-blue-400 transition">
                    {dest.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {dest.state} • <span className="text-slate-500">{dest.type}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition">
                <span>Select Place</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
