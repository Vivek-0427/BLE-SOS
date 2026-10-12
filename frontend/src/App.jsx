import './App.css'
import { useState, useEffect, useRef } from "react";
// import { auth, db } from './services/firebase.js';

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
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

// Data
import ICONS from './data/constants.jsx';

// Hooks
import useAuth from './hooks/useAuth.js';

// Services
import { logOutUser } from './services/authService.js';
import { createSOSEvent, getUserSOSEvents, cancelSOSEvent } from './services/sosService.js';
import { getCurrentLocation } from './services/locationService.js';
import { saveSOSOffline, syncUnsyncedSOS } from './services/offlineService.js';
import { startMotionSensors } from './services/sensorsService.js';
import { generateMeshPeers } from "./services/meshSimulationService";
import { updateUserLocation, startLocationTracking, stopLocationTracking } from './services/nearbyService.js';
import { listenForNearbySOS } from "./services/nearbyService";

// Assets
import background from "./assets/background.jpg";


function App() {

  // console.log("Firebase Auth:", auth);
  // console.log("Firebase Firestore:", db);

  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [peers, setPeers] = useState([]);

// ── Main App ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState("dashboard");
  const [sosActive, setSosActive] = useState(false);
  const [sosHold, setSosHold] = useState(0);
  const [meshActive, setMeshActive] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [fallDetect, setFallDetect] = useState(true);
  const [audioDetect, setAudioDetect] = useState(false);
  const [persistentEvents, setPersistentEvents] = useState([]);
  const [nearbyNotifications, setNearbyNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState("");
  const [activeSosId, setActiveSosId] = useState(null);
  const [impact, setimpact] = useState(false);

  const [alerts, setAlerts] = useState([
    { type: "info", msg: "Mesh network initialized. Peers discovered.", time: "09:32:01", status: "OK" },
    { type: "warn", msg: "Sudden acceleration detected. Manual confirm skipped.", time: "14:28:44", status: "WATCH" },  ]);

  const holdRef = useRef(null);
  const [accel, setAccel] = useState(0);
  const [gyro, setGyro] = useState(0);
  const [fallDetected, setFallDetected] = useState(false);
  const [fallCountdown, setFallCountdown] = useState(10);
  const [fallWarning, setFallWarning] = useState(false);
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const [peerCount, setPeerCount] = useState(4);

  // Start location tracking when user is logged in

  useEffect(() => {
  if (!user) return;

  console.log("📍 Starting nearby-user location service");

  const watchId = startLocationTracking(user.uid, locationSharing);

  return () => {
    console.log("🛑 Stopping nearby-user location service");
    stopLocationTracking(watchId);
  };

}, [user, locationSharing]);

  // Generate mesh peers on app initialization
  useEffect(() => {
    const initialPeers = generateMeshPeers();

     console.log("Initial mesh peers generated:", initialPeers);

     setPeers(initialPeers);
  }, []);

  useEffect(() => {
  if (!meshActive) return;

  const interval = setInterval(() => {

    setPeers(prev =>
      prev.map(peer => ({
        ...peer,
        signal: Math.max(
          1,
          Math.min(
            4,
            peer.signal + Math.floor(Math.random() * 3 - 1)
          )
        )
      }))
    );

  }, 3000);

  return () => clearInterval(interval);
}, [meshActive]);

  // Load Events from Firestore on user login

  useEffect(() => {
  if (!user) return;

  const loadEvents = async () => {
    try {
      console.log("📋 Loading SOS event history...");

      const events = await getUserSOSEvents(user.uid);

      setPersistentEvents(events);

      console.log(
        `✅ Loaded ${events.length} SOS event(s)`
      );

    } catch (error) {
      console.error(
        "❌ Failed to load SOS event history:",
        error
      );
    }
  };

  loadEvents();
}, [user]);

// Listen for nearby SOS notifications in real time
useEffect(() => {
  if (!user) {
    setNearbyNotifications([]);
    return;
  }

  console.log("🔔 Starting nearby SOS notification listener...");

  const unsubscribe = listenForNearbySOS(
    user.uid,
    (notifications) => {
      console.log(
        `🔔 Received ${notifications.length} notification(s)`
      );

      setNearbyNotifications(notifications);
      setNotificationError("");
    },
    (error) => {
      console.error("❌ Nearby notification listener failed:", error);
      setNotificationError("Unable to load nearby SOS notifications.");
    }
  );

  return () => {
    console.log("🔕 Stopping nearby SOS notification listener");
    unsubscribe();
  };
}, [user]);

  // Start motion sensors
  useEffect(() => {
    const stopSensors = startMotionSensors({
      fallDetectionEnabled: fallDetect,
      onAcceleration: ({magnitude}) => {
        setSensorAvailable(true);
        setAccel(magnitude);
      },
      onRotation: ({magnitude}) => {
        setGyro(magnitude);
      },
      onFallDetected:(data) => {
        console.log("🚨 Fall Detected!:", data);
        setFallDetected(true);
        setFallWarning(true);
        setFallCountdown(10);

        setAlerts(prev => [
          { type: "danger", msg: `Fall detected!. Please confirm you are safe`, time: new Date().toLocaleTimeString(), timestamp: new Date().toISOString(), status: "FALL" },
          ...prev
        ]);
      },
      onError: (error) => {
        console.warn("Error starting motion sensors:", error);
        setSensorAvailable(false);
      }
    });

    return () => {
      stopSensors();
    };
  }, [fallDetect]);

  // Fall countdown logic
  useEffect(() =>{
    if(!fallWarning) return;

    if(fallCountdown <= 0){
      setFallWarning(false);

      console.log("🚨 No response. Triggering automatic Fall SOS.");

      triggerSOS({ type: "FALL", source: "AUTO_FALL" });

      return;
    }

    const timer = setTimeout(() => {
      setFallCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [fallCountdown, fallWarning]);


  // SOS hold logic
  useEffect(() => {
    if (sosHold > 0 && sosHold < 100) {
      holdRef.current = setTimeout(() => setSosHold(h => h + 10), 80);
    } else if (sosHold >= 100) {
      triggerSOS();
      setSosHold(0);
    }
    return () => clearTimeout(holdRef.current);
  }, [sosHold]);

  // Automatically sync unsynced SOS events when online
  useEffect(() => {
    const handleOnline = async () => {
      console.log("🌐 Network connection restored. Attempting to sync unsynced SOS events...");
      
      if(!user){
        console.error("User not authenticated. Cannot sync unsynced SOS events.");
        return;
      }
      try {
      await syncUnsyncedSOS(createSOSEvent);

      setAlerts(prev => [
        { type: "info", msg: "Unsynced SOS events synced successfully.", time: new Date().toLocaleTimeString(), timestamp: new Date().toISOString(), status: "SYNCED" },
        ...prev
      ]);
      } catch (error) {
        console.error("Error syncing unsynced SOS events:", error);
      }
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user]);

  // Startup UseEffect to sync unsynced SOS events if online
  useEffect(() => {
    if(!user) return;
    const syncOnStartup = async () => {
      if (!navigator.onLine && user) {
        console.log("🌐 App started offline. Waiting for network connection...");
        return;
      }
      try{
        console.log("🌐 App started online. Attempting to sync unsynced SOS events...");
        await syncUnsyncedSOS(createSOSEvent);
      } catch (error) {
        console.error("Error syncing unsynced SOS events on startup:", error);
      }
    };

    syncOnStartup();
  }, [user]);

 const cancelSOS = async () => {
  try {
    console.log("🛑 Cancel SOS requested");

    if (!activeSosId) {
      console.warn("No Firestore SOS ID available");

      setAlerts((prev) => [
        {
          type: "warning",
          msg: navigator.onLine
            ? "No active SOS event found to cancel."
            : "This SOS is stored offline and cannot be cancelled on the server yet.",
          time: new Date().toLocaleTimeString(),
          status: "WARNING",
        },
        ...prev,
      ]);

      return;
    }

    // Update the corresponding Firestore document.
    await cancelSOSEvent(activeSosId);

    console.log("✅ SOS cancelled in Firestore:", activeSosId);

    // Update the local event history immediately.
    setPersistentEvents((prev) =>
      prev.map((event) =>
        event.id === activeSosId
          ? { ...event, status: "CANCELLED" }
          : event
      )
    );

    setSosActive(false);
    setActiveSosId(null);

    setAlerts((prev) => [
      {
        type: "info",
        msg: "SOS cancelled. Nearby recipients will be notified.",
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
        status: "CANCELLED",
      },
      ...prev,
    ]);
  } catch (error) {
    console.error("❌ Failed to cancel SOS:", error);

    setAlerts((prev) => [
      {
        type: "danger",
        msg: `Unable to cancel SOS: ${error.message}`,
        time: new Date().toLocaleTimeString(),
        status: "FAILED",
      },
      ...prev,
    ]);
  }
};

  const triggerSOS = async ({
  type = "MANUAL",
  source = "USER"
} = {}) => {
    if (!user) return;

    try{
      console.log("🚨 SOS ACTIVATED");

      // Get current location
      const location = await getCurrentLocation();
      console.log("📍 Location:", location);

      await updateUserLocation({
        userId: user.uid,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        sharingEnabled: locationSharing
      });

      const sosData = {
        userId: user.uid,
        type,
        source,
        latitude: location.latitude,
        longitude: location.longitude,
        status: "ACTIVE"
      };

      // ONLINE: Save SOS to Firestore

      if (navigator.onLine) {

        console.log("🌐 Online: Saving SOS to Firestore");

        const sosEvent = await createSOSEvent(sosData);

        console.log("🔐 Encrypted SOS:", sosEvent);
        console.log("✅ SOS Event Created:", sosEvent.id);

        // Save the exact Firestore document ID for cancellation.
        setActiveSosId(sosEvent.id);

        // Immediately add the new event to persistent events
        setPersistentEvents(prev => [
          {
            id: sosEvent.id,
            ...sosData,
            status: "ACTIVE",
            timestamp: sosData.timestamp || new Date().toISOString()
          },
          ...prev
        ]);

      } else {

        // OFFLINE: Save SOS to IndexedDB

        console.log("📴 Offline: Saving SOS to IndexedDB");
        const localId = await saveSOSOffline(sosData);
        console.log("💾 SOS Saved Locally with ID:", localId);
        
        setAlerts(prev => [
          { type: "warn", msg: `SOS Activated offline. Waiting for network connection. Will sync when online.`, time: new Date().toLocaleTimeString(), timestamp: new Date().toISOString(), status: "QUEUED" },
          ...prev
        ]);
      }
      setSosActive(true);

      
    } catch (error) {
      console.error("Error creating SOS event:", error);
      setAlerts(prev => [
      {
        type: "danger",
        msg: "Failed to create SOS event.",
        time: new Date().toLocaleTimeString(),
        timestamp: new Date().toISOString(),
        status: "FAILED"
      },
      ...prev
    ]);
    }
  };

  const cancelFallAlert = () => {

    console.log("✅ User confirmed they are safe.");

    setFallDetected(false);
    setFallWarning(false);
    setFallCountdown(10);

    setAlerts(prev => [
      { type: "info", msg: "Fall alert cancelled by user.", time: new Date().toLocaleTimeString(), timestamp: new Date().toISOString(), status: "CANCELLED" },
      ...prev
    ]);
  }

  const tabs = [
    { id: "dashboard", icon: ICONS.home, label: "Dashboard" },
    { id: "mesh", icon: ICONS.bluetooth, label: "Mesh" },
    { id: "sensors", icon: ICONS.activity, label: "Sensors" },
    { id: "contacts", icon: ICONS.users, label: "Contacts" },
    { id: "log", icon: ICONS.bell, label: "Log" },
    { id: "settings", icon: ICONS.settings, label: "Settings" },
  ];

  // Authentication check
  if (loading) {
    return <div className="text-center text-zinc-500">Loading...</div>;
  }

  if (!user) {
    return showRegister ? (
      <Register onLogin={() => setShowRegister(false)} />
    ) : (
      <Login onRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <>
    {/* Fall Warning Modal */}
    {fallWarning && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-[90%] max-w-md p-6 rounded-2xl bg-zinc-950 border border-red-800 shadow-2xl">

          <div className="text-center">

            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-red-950 border border-red-700 flex items-center justify-center">
              <Icon
                path={ICONS.alert}
                size={30}
                className="text-red-400"
              />
            </div>

            <h2 className="text-xl font-bold text-red-400">
              FALL DETECTED
            </h2>

            <p className="text-sm text-zinc-400 mt-2">
              Possible fall detected.
            </p>

            <p className="text-sm text-zinc-500 mt-1">
              Are you okay?
            </p>

            <div className="my-6">
              <p className="text-5xl font-bold text-white">
                {fallCountdown}
              </p>

              <p className="text-xs text-zinc-500 mt-2">
                seconds until emergency SOS
              </p>
            </div>

            <button
              onClick={cancelFallAlert}
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition"
            >
              I'M OK
            </button>

            <p className="text-[10px] text-zinc-600 mt-3">
              If you do not respond, an emergency SOS will be activated automatically.
            </p>

          </div>

        </div>
      </div>
    )}
    <div className="min-h-screen bg-cover bg-center" style={{backgroundImage: `url(${background})`}}>
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
          <button onClick={logOutUser} className="text-xs text-zinc-400 border border-zinc-800 px-3 py-1 rounded-lg hover:bg-zinc-900/40 transition-colors">
            Logout
          </button>
          <StatusDot active={locationSharing} label="ICONS.map" />
          <StatusDot active={sosActive} label={sosActive ? "SOS ACTIVE" : "STANDBY"} />
        </div>
      </div>

      {/* SOS Active Banner */}
      {sosActive && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-red-950/60 border border-red-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span className="text-red-300 text-xs font-bold tracking-widest">· SOS BROADCASTING ·</span>
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
            user={user}
            sosActive={sosActive}
            sosHold={sosHold}
            setSosHold={setSosHold}
            peerCount={peerCount}
            cancelSOS={cancelSOS}
            accel={accel}
            gyro={gyro}
            alerts={alerts}
            persistentEvents={persistentEvents}
          />
        )}

        {/* MESH TAB */}
        {tab === "mesh" && (
          <Mesh
            meshActive={meshActive}
            nearbyNotifications={nearbyNotifications}
          />
        )}

        {/* SENSORS TAB */}
        {tab === "sensors" && (
          <Sensors
            accel={accel}
            gyro={gyro}
            fallDetect={fallDetect}
            setFallDetect={setFallDetect}
            audioDetect={audioDetect}
            setAudioDetect={setAudioDetect}
            fallDetected={fallDetected}
            fallWarning={fallWarning}
            setFallWarning={setFallWarning}
            fallCountdown={fallCountdown}
            setFallCountdown={setFallCountdown}
            cancelFallAlert={cancelFallAlert}
            impact={impact}
            setimpact={setimpact}
          />
        )}

        {/* CONTACTS TAB */}
        {tab === "contacts" && (
          <Contacts
            user={user}
            sosActive={sosActive}
          />
        )}

        {/* LOG TAB */}
        {tab === "log" && (
          <EventLog
            alerts={alerts}
            persistentEvents={persistentEvents}
          />
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <Settings
            locationSharing={locationSharing}
            setLocationSharing={setLocationSharing}
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
    </div>
    </>

  );
}




export default App
