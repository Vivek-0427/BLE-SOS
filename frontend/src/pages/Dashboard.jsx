import SensorGauge from "../components/SensorGauge"
import AlertItem from "../components/AlertItem"
import Icon from "../components/Icon"
import ICONS from "../data/constants"

export default function Dashboard({ sosActive, sosHold, setSosHold, cancelSOS, peerCount, ttl, accel, gyro, alerts }) {
    return (
        <>
        {/* SOS Button */}
            <div className="flex flex-col items-center py-6">
              <div className="relative w-39 h-39">
                {sosActive && <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />}
                {sosActive && <div className="absolute inset-2 rounded-full bg-red-500/10 animate-pulse" />}
                <button
                  className={`relative w-full h-full rounded-full border-4 flex flex-col items-center justify-center gap-1 transition-all duration-200 select-none ${sosActive ? "bg-red-900/80 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]" : "bg-zinc-900 border-zinc-700 hover:border-red-800 hover:bg-red-950/30 active:scale-95"}`}
                  onMouseDown={() => !sosActive && setSosHold(10)}
                  onMouseUp={() => setSosHold(0)}
                  onTouchStart={() => !sosActive && setSosHold(10)}
                  onTouchEnd={() => setSosHold(0)}
                  onClick={sosActive ? cancelSOS : undefined}
                >
                  {sosHold > 0 && sosHold < 100 && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle cx="73" cy="73" r="74" fill="none" stroke="#ef4444" strokeWidth="5"
                        strokeDasharray={`${2 * Math.PI * 75 * sosHold / 100} 999`} />
                    </svg>
                  )}
                  <Icon path={ICONS.alert} size={36} className={sosActive ? "text-red-300" : "text-zinc-400"} />
                  <span className={`text-lg font-black tracking-widest ${sosActive ? "text-red-300" : "text-zinc-400"}`}>
                    {sosActive ? "ACTIVE" : "SOS"}
                  </span>
                  <span className="text-[9px] text-zinc-600">{sosActive ? "CLICK TO CANCEL" : "HOLD TO ACTIVATE"}</span>
                </button>
              </div>
              {sosHold > 0 && <p className="mt-3 text-xs text-amber-400 animate-pulse">Hold... {Math.round(sosHold)}%</p>}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-600 mb-1">PEERS</p>
                <p className="text-xl font-bold text-cyan-400">{peerCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-600 mb-1">TTL HOP</p>
                <p className="text-xl font-bold text-violet-400">{ttl}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-600 mb-1">RANGE</p>
                <p className="text-xl font-bold text-emerald-400">~{peerCount * 30}m</p>
              </div>
            </div>

            {/* Mini sensor preview */}
            <div className="grid grid-cols-2 gap-2">
              <SensorGauge label="Accel" value={+accel.toFixed(1)} max={20} unit="m/s²" color="cyan" />
              <SensorGauge label="Gyro" value={+gyro.toFixed(0)} max={180} unit="°/s" color="amber" />
            </div>

            {/* Recent Alerts */}
            <div>
              <p className="text-[10px] text-zinc-600 mb-2 tracking-widest uppercase">Recent Events</p>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((a, i) => <AlertItem key={i} {...a} />)}
              </div>
            </div>
        </>
    );
}



