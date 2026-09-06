// ── Peer Node Card ────────────────────────────────────────────────────────────

const PeerCard = ({ name, distance, relay, signal, avatar }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-cyan-900 transition-colors">
    <div className="w-9 h-9 rounded-full bg-linear-to-br from-cyan-900 to-blue-950 flex items-center justify-center text-cyan-300 font-mono text-sm font-bold border border-cyan-800/40">{avatar}</div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-zinc-200 font-medium truncate">{name}</p>
      <p className="text-xs text-zinc-500 font-mono">{distance} · {relay ? "Can relay" : "No internet"}</p>
    </div>
    <div className="flex flex-col items-end gap-1">
      <div className={`flex gap-0.5 items-end h-4`}>
        {[1,2,3,4].map(i => (
          <div key={i} className={`w-1 rounded-sm ${i <= signal ? "bg-cyan-400" : "bg-zinc-700"}`} style={{height: `${i*3+4}px`}} />
        ))}
      </div>
      {relay && <span className="text-[10px] text-emerald-400 font-mono">RELAY</span>}
    </div>
  </div>
);

export default PeerCard;