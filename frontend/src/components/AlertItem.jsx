// ── Alert Log Item ────────────────────────────────────────────────────────────

import ICONS from "../data/constants.jsx";
import Icon from "../components/Icon.jsx";

const AlertItem = ({ type, time, msg, status }) => {
  const colors = { danger: "text-red-400 border-red-900/50 bg-red-950/30", warn: "text-amber-400 border-amber-900/50 bg-amber-950/30", info: "text-cyan-400 border-cyan-900/50 bg-cyan-950/20" };
  return (
    <div className={`p-3 rounded-xl border text-xs font-mono ${colors[type]} flex items-start gap-3`}>
      <Icon path={type === "danger" ? ICONS.alert : type === "warn" ? ICONS.zap : ICONS.check} size={14} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="text-zinc-300">{msg}</p>
        <p className="text-zinc-600 mt-1">{time}</p>
      </div>
      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${colors[type]}`}>{status}</span>
    </div>
  );
};

export default AlertItem;