import React from "react";
import { Alert } from "../../../../shared/types";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

interface Props {
  alerts: Alert[];
}

export const AlertBanner: React.FC<Props> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((alert) => {
        let bgClass = "bg-blue-950/80 border-blue-800 text-blue-300";
        let Icon = Info;

        if (alert.type === "critical") {
          bgClass = "bg-rose-950/90 border-rose-800 text-rose-200 animate-pulse";
          Icon = XCircle;
        } else if (alert.type === "warning") {
          bgClass = "bg-amber-950/90 border-amber-800 text-amber-200";
          Icon = AlertTriangle;
        } else if (alert.type === "success") {
          bgClass = "bg-emerald-950/80 border-emerald-800 text-emerald-200";
          Icon = CheckCircle2;
        }

        return (
          <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl border text-xs shadow-md ${bgClass}`}>
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold uppercase tracking-wider mr-2">[{alert.title}]</span>
              {alert.message}
            </div>
          </div>
        );
      })}
    </div>
  );
};
