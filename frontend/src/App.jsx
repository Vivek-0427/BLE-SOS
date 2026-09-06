import './App.css'
import { useState, useEffect, useRef } from "react";

// Components
import Icon from './components/Icon.jsx';
import StatusDot from './components/StatusDot.jsx';

// Pages
import Dashboard from './pages/Dashboard.jsx';
import Mesh from './pages/Mesh.jsx';
import Sensors from './pages/Sensors.jsx';
import EventLog from './pages/EventLog.jsx';
import Settings from './pages/Settings.jsx';
import Contacts from './pages/Contacts.jsx';

// Data
import ICONS from './data/constants.jsx';


function App() {


// ── Main App ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("dashboard");
  const [sosActive, setSosActive] = useState(false);
  const [sosHold, setSosHold] = useState(0);
  const [meshActive, setMeshActive] = useState(true);
  const [fallDetect, setFallDetect] = useState(true);
  const [audioDetect, setAudioDetect] = useState(false);
  const [ttl, setTtl] = useState(5);

  const [alerts, setAlerts] = useState([
    { type: "info", msg: "Mesh network initialized. 4 peers discovered.", time: "14:32:01", status: "OK" },
    { type: "warn", msg: "Sudden acceleration detected. Manual confirm skipped.", time: "14:28:44", status: "WATCH" },
    { type: "danger", msg: "SOS broadcast sent. TTL=5. Relay via Node A.", time: "14:22:10", status: "SENT" },
  ]);

  const holdRef = useRef(null);
  const [accel, setAccel] = useState(2.1);
  const [gyro, setGyro] = useState(34);
  const [battery, setBattery] = useState(78);
  const [peerCount, setPeerCount] = useState(4);

  // Simulate sensor fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setAccel(v => +(v + (Math.random() - 0.5) * 0.4).toFixed(1));
      setGyro(v => Math.max(0, Math.min(180, +(v + (Math.random() - 0.5) * 5).toFixed(1))));
      setBattery(v => Math.max(10, v - 0.05));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // SOS hold logic
  useEffect(() => {
    if (sosHold > 0 && sosHold < 100) {
      holdRef.current = setTimeout(() => setSosHold(h => h + 10), 80);
    } else if (sosHold >= 100) {
      setSosActive(true);
      setSosHold(0);
      setAlerts(a => [{ type: "danger", msg: "SOS broadcast initiated. Mesh relay active.", time: new Date().toLocaleTimeString(), status: "ACTIVE" }, ...a]);
    }
    return () => clearTimeout(holdRef.current);
  }, [sosHold]);

  const cancelSOS = () => {
    setSosActive(false);
    setAlerts(a => [{ type: "info", msg: "SOS cancelled by user.", time: new Date().toLocaleTimeString(), status: "CANCELLED" }, ...a]);
  };

  const tabs = [
    { id: "dashboard", icon: ICONS.home, label: "Dashboard" },
    { id: "mesh", icon: ICONS.bluetooth, label: "Mesh" },
    { id: "sensors", icon: ICONS.activity, label: "Sensors" },
    { id: "contacts", icon: ICONS.users, label: "Contacts" },
    { id: "log", icon: ICONS.bell, label: "Log" },
    { id: "settings", icon: ICONS.settings, label: "Settings" },
  ];

  const peers = [
    { name: "R Vivekanand", distance: "12m", relay: true, signal: 4, avatar: "RV" },
    { name: "Swastik S", distance: "38m", relay: false, signal: 3, avatar: "SS" },
    { name: "Karthik", distance: "65m", relay: true, signal: 2, avatar: "K" },
    { name: "Unknown_4F2A", distance: "91m", relay: false, signal: 1, avatar: "??" },
  ];

  const contacts = [
    { name: "Contact 1", relation: "Friend", phone: "+91 98450 XXXXX" },
    { name: "Contact 2", relation: "Guardian", phone: "+91 98440 XXXXX" },
    { name: "Emergency SOS", relation: "Campus Security", phone: "080-2323-XXXX" }
  ];

  return (
    <>
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-mono flex flex-col" style={{fontFamily: "'JetBrains Mono', 'Fira Code', monospace"}}>

      {/* Top Bar */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-950 border border-red-800/60 flex items-center justify-center">
            <Icon path={ICONS.shield} size={14} className="text-red-400" />
          </div>
          <span className="text-sm font-bold text-zinc-200 tracking-tight">MESH<span className="text-red-400">SOS</span></span>
        </div>
        <div className="flex items-center gap-3">
          <StatusDot active={meshActive} label="BLE" />
          <StatusDot active={sosActive} label={sosActive ? "SOS ACTIVE" : "STANDBY"} />
          <span className="text-xs text-zinc-600 font-mono">{Math.round(battery)}%</span>
        </div>
      </div>

      {/* SOS Active Banner */}
      {sosActive && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-red-950/60 border border-red-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span className="text-red-300 text-xs font-bold tracking-widest">SOS BROADCASTING · TTL={ttl} · {peerCount} PEERS</span>
          </div>
          <button onClick={cancelSOS} className="text-xs text-red-400 border border-red-800 px-3 py-1 rounded-lg hover:bg-red-900/40 transition-colors">
            CANCEL
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* DASHBOARD TAB */}
        {tab === "dashboard" && (
          <Dashboard
            sosActive={sosActive}
            sosHold={sosHold}
            setSosHold={setSosHold}
            peerCount={peerCount}
            cancelSOS={cancelSOS}
            ttl={ttl}
            accel={accel}
            gyro={gyro}
            alerts={alerts}
          />
        )}

        {/* MESH TAB */}
        {tab === "mesh" && (
          <Mesh
            meshActive={meshActive}
            peers={peers}
            ttl={ttl}
          />
        )}

        {/* SENSORS TAB */}
        {tab === "sensors" && (
          <Sensors
            accel={accel}
            gyro={gyro}
            battery={battery}
            fallDetect={fallDetect}
            setFallDetect={setFallDetect}
            audioDetect={audioDetect}
            setAudioDetect={setAudioDetect}
          />
        )}

        {/* CONTACTS TAB */}
        {tab === "contacts" && (
          <Contacts
            contacts={contacts}
          />
        )}

        {/* LOG TAB */}
        {tab === "log" && (
          <EventLog
            alerts={alerts}
          />
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <Settings
            meshActive={meshActive}
            setMeshActive={setMeshActive}
            ttl={ttl}
            setTtl={setTtl}
          />
        )}
      </div>

      {/* Bottom Nav */}
      <div className="border-t border-zinc-900 bg-zinc-950 px-2 py-2 grid grid-cols-6 gap-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-colors ${tab === t.id ? "bg-zinc-900 text-cyan-400" : "text-zinc-600 hover:text-zinc-400"}`}>
            <Icon path={t.icon} size={18} />
            <span className="text-[8px] tracking-wider">{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
    </>
  );
}



export default App
