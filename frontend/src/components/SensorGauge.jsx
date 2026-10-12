// ── Sensor Gauge ──────────────────────────────────────────────────────────────

const SensorGauge = ({ label, value, max, unit, color }) => {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = color === "cyan" ? "bg-cyan-500" : color === "amber" ? "bg-amber-500" : "bg-emerald-500";
  const glowColor = color === "cyan" ? "shadow-[0_0_8px_rgba(6,182,212,0.6)]" : color === "amber" ? "shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "shadow-[0_0_8px_rgba(52,211,153,0.6)]";
  return (
    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-mono font-bold ${color === "cyan" ? "text-cyan-400" : color === "amber" ? "text-amber-400" : "text-emerald-400"}`}>{value}<span className="text-xs text-zinc-600 ml-1">{unit}</span></span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor} ${glowColor}`} style={{width: `${pct}%`}} />
      </div>
    </div>
  );
};

export default SensorGauge;