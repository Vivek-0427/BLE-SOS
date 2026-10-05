// ── Contact Card ──────────────────────────────────────────────────────────────

const ContactCard = ({ name, relation, phone, notified }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 font-mono text-sm font-bold">{name[0]}</div>
    <div className="flex-1">
      <p className="text-sm text-zinc-200 font-medium">{name}</p>
      <p className="text-xs text-zinc-500">{relation} · {phone}</p>
    </div>
    {notified && <span className="text-[10px] text-emerald-400 font-mono px-2 py-1 rounded-full bg-emerald-950/50 border border-emerald-900/40">NOTIFIED</span>}
  </div>
);

export default ContactCard;