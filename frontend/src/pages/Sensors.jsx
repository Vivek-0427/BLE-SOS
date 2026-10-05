import SensorGauge from "../components/SensorGauge";
import Icon from "../components/Icon";
import ICONS from "../data/constants";

export default function Sensors({ accel, gyro, battery, fallDetect, setFallDetect, audioDetect, setAudioDetect }) {
  return (
    <>
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-600 mb-2 tracking-widest uppercase">Live Sensor Data</p>
              <SensorGauge label="Accelerometer" value={+accel.toFixed(1)} max={20} unit="m/s²" color="cyan" />
              <SensorGauge label="Gyroscope" value={+gyro.toFixed(0)} max={180} unit="°/s" color="amber" />
              <SensorGauge label="Battery" value={Math.round(battery)} max={100} unit="%" color="green" />
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase">Detection Modules</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-200">Fall Detection</p>
                  <p className="text-[10px] text-zinc-600">Accel + Gyro threshold</p>
                </div>
                <button onClick={() => setFallDetect(v => !v)} className={`w-11 h-6 rounded-full transition-colors relative ${fallDetect ? "bg-cyan-600" : "bg-zinc-700"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${fallDetect ? "translate-x-0" : "-translate-x-5"}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-200">Sudden Impact</p>
                  <p className="text-[10px] text-zinc-600">High accel burst detect</p>
                </div>
                <button className="w-11 h-6 rounded-full bg-cyan-600 relative">
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-white" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-200">Audio / Scream Detect</p>
                  <p className="text-[10px] text-zinc-600">Microphone classification</p>
                </div>
                <button onClick={() => setAudioDetect(v => !v)} className={`w-11 h-6 rounded-full transition-colors relative ${audioDetect ? "bg-cyan-600" : "bg-zinc-700"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${audioDetect ? "translate-x-0" : "-translate-x-5"}`} />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/40">
              <div className="flex items-center gap-2 mb-1">
                <Icon path={ICONS.alert} size={13} className="text-amber-400" />
                <span className="text-xs text-amber-300 font-bold">Detection Thresholds</span>
              </div>
              <p className="text-[11px] text-amber-600">Fall: accel &gt; 14 m/s² + post-impact stillness · Impact: burst &gt; 18 m/s² · Audio: &gt; 0.82 confidence</p>
            </div>
          </>
        );
      }