export const CATEGORY_ICONS: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
  hotel: { emoji: "🏨", color: "#a855f7", bg: "bg-purple-950", border: "border-purple-500" },
  attraction: { emoji: "📍", color: "#3b82f6", bg: "bg-blue-950", border: "border-blue-500" },
  heritage: { emoji: "🏛", color: "#f59e0b", bg: "bg-amber-950", border: "border-amber-500" },
  spiritual: { emoji: "🕉️", color: "#ec4899", bg: "bg-pink-950", border: "border-pink-500" },
  restaurant: { emoji: "🍽", color: "#10b981", bg: "bg-emerald-950", border: "border-emerald-500" },
  cafe: { emoji: "☕", color: "#10b981", bg: "bg-emerald-950", border: "border-emerald-500" },
  airport: { emoji: "✈️", color: "#06b6d4", bg: "bg-cyan-950", border: "border-cyan-500" },
  railway: { emoji: "🚆", color: "#6366f1", bg: "bg-indigo-950", border: "border-indigo-500" },
  beach: { emoji: "🏖", color: "#0ea5e9", bg: "bg-sky-950", border: "border-sky-500" },
  nature: { emoji: "🌿", color: "#22c55e", bg: "bg-green-950", border: "border-green-500" },
  activity: { emoji: "🎭", color: "#8b5cf6", bg: "bg-violet-950", border: "border-violet-500" },
  disruption: { emoji: "⚠️", color: "#ef4444", bg: "bg-red-950", border: "border-red-500" },
};

export function createCustomMarkerHtml(category: string, label: string, seqNum?: number, isDisrupted?: boolean, isCompleted?: boolean) {
  const meta = CATEGORY_ICONS[category.toLowerCase()] || CATEGORY_ICONS.attraction;
  const emoji = isDisrupted ? "⚠️" : isCompleted ? "✓" : meta.emoji;

  return `
    <div style="transform: translate(-50%, -100%); cursor: pointer;">
      <div style="
        background: #0f172a;
        border: 2px solid ${isDisrupted ? '#ef4444' : meta.color};
        border-radius: 14px;
        padding: 4px 8px;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 10px 15px -3px ${meta.color}40, 0 4px 6px -4px ${meta.color}20;
        white-space: nowrap;
      ">
        <span style="font-size: 14px;">${emoji}</span>
        ${seqNum ? `<span style="
          background: ${isDisrupted ? '#dc2626' : '#2563eb'};
          color: #ffffff;
          font-weight: 800;
          font-size: 10px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
        ">${seqNum}</span>` : ''}
        <span style="color: #ffffff; font-weight: 700; font-size: 11px; max-width: 120px; overflow: hidden; text-overflow: ellipsis;">
          ${label}
        </span>
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 7px solid ${isDisrupted ? '#ef4444' : meta.color};
        margin: 0 auto;
      "></div>
    </div>
  `;
}
