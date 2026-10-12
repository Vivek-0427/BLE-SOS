import Icon from "../components/Icon";
import ICONS from "../data/constants";

export default function Settings({ locationSharing, setLocationSharing }) {
    return(
        <>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase">System Config</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-200">Location Sharing</p>
                  <p className="text-[10px] text-zinc-600">Receive nearby SOS alerts within 100 m</p>
                </div>
                <button onClick={() => setLocationSharing(v => !v)} className={`w-11 h-6 rounded-full transition-colors relative ${locationSharing ? "bg-cyan-600" : "bg-zinc-700"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${locationSharing ? "translate-x-0" : "-translate-x-5"}`} />
                </button>
              </div>

            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase">Security</p>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Icon path={ICONS.lock} size={14} className="text-emerald-400" />
                <span>AES-256 packet encryption enabled</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Icon path={ICONS.shield} size={14} className="text-emerald-400" />
                <span>RSA digital signature per packet</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Icon path={ICONS.eye} size={14} className="text-zinc-600" />
                <span>Location sharing: GPS if available</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-600 space-y-1">
              <p className="text-zinc-400 font-bold mb-2">About</p>
              <p>Decentralized Bluetooth Mesh SOS System</p>
              <p>Dr. AIT — ISE Dept · Batch 2023–27</p>
              <p>Guide: Neetha Natesh</p>
              <p className="text-zinc-700 pt-1">v1.0.0 · Built on Android Sensors + Network Mesh</p>
            </div>
          </>
    )
}
