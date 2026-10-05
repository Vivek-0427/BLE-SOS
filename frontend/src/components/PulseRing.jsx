// ── Pulse Ring Animation Component ───────────────────────────────────────────

const PulseRing = ({ active, danger }) => (
  <div className={`absolute inset-0 rounded-full ${active ? (danger ? "animate-ping" : "animate-pulse") : ""} ${danger ? "bg-red-500/20" : "bg-cyan-500/20"}`} />
);

export default PulseRing;