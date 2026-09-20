import React, { useState } from "react";
import { useTripStore } from "../../store/useTripStore";
import { Share2, Compass, Shield, Check, Copy, Sparkles, X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export const ShareTripModal: React.FC<Props> = ({ onClose }) => {
  const { trip } = useTripStore();
  const [copied, setCopied] = useState(false);

  const destName = trip ? trip.destination : "Jaipur";
  const days = trip ? trip.itinerary.length : 4;
  const travelers = trip ? trip.travellers.adults : 2;
  const budget = trip ? trip.budget.total : 25000;

  const linkedInPostText = `🚀 Check out my AI-optimized travel itinerary built with TravelPilot!

✈️ Destination: ${destName} (${days} Days, ${travelers} Travelers)
💰 Budget: ₹${budget.toLocaleString()}
🛡️ Trip Resilience Score: 91/100 (High Adaptability)

✨ Why TravelPilot is different:
Unlike traditional static planners that break when weather or flight delays happen, TravelPilot continuously MONITORS, DETECTS disruptions, and ADAPTS routes in real-time.

Plan less. Explore more. Adapt instantly. 🌍
#TravelPilot #AITravel #Hackathon2026 #AgenticAI #TravelTech`;

  const handleCopy = () => {
    navigator.clipboard.writeText(linkedInPostText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-white">Share Your Trip</h3>
            <p className="text-xs text-slate-400">Generate a shareable card & post summary for social media.</p>
          </div>
        </div>

        {/* Graphic Card Preview */}
        <div className="bg-gradient-to-br from-slate-950 via-indigo-950/60 to-slate-950 border border-indigo-500/40 p-6 rounded-3xl space-y-5 shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-indigo-900/60 pb-3">
            <div className="flex items-center gap-2 font-black tracking-wider text-white font-mono text-sm">
              <Compass className="w-4 h-4 text-blue-400" />
              <span>TRAVEL PILOT</span>
            </div>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold uppercase">
              ✨ Adapted Automatically
            </span>
          </div>

          <div className="space-y-1">
            <h4 className="text-2xl font-black text-white">{destName.toUpperCase()}</h4>
            <p className="text-xs text-slate-300 font-medium">
              {days} DAYS • {travelers} TRAVELERS • ₹{budget.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Trip Resilience</span>
              <div className="font-mono font-black text-indigo-300 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>91 / 100</span>
              </div>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">AI Status</span>
              <div className="font-bold text-emerald-400">Continuous Monitoring</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center pt-2 italic font-serif">
            &quot;Plan less. Explore more. Adapt instantly.&quot;
          </div>
        </div>

        {/* LinkedIn Copy Section */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> LinkedIn & Social Post Text
          </label>
          <textarea
            readOnly
            rows={4}
            value={linkedInPostText}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300 font-mono outline-none resize-none"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleCopy}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Post Text for LinkedIn</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
