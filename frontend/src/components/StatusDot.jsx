// ── Status Dot ────────────────────────────────────────────────────────────────

const StatusDot = ({ active, label }) => (
  <div className="flex items-center gap-2">
    <span className={`w-2 h-2 rounded-full ${active ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-zinc-600"}`} />
    <span className="text-xs text-zinc-400 font-mono">{label}</span>
  </div>
);

export default StatusDot;