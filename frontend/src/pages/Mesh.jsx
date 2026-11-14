// MESH PAGE

import MeshVisualizer from "../components/MeshVisualizer";
import PeerCard from "../components/PeerCard";
import Icon from "../components/Icon.jsx";
import ICONS from "../data/constants.jsx";

export default function Mesh({ meshActive, nearbyNotifications = [] }) {

  // Open Google Maps directions to the person in danger
  const openDirections = (notification) => {
    // Do not navigate for cancelled SOS alerts
    const isCancelled =
      notification.status === "CANCELLED" ||
      notification.type === "SOS_CANCELLED";

    if (isCancelled) {
      return;
    }

    const latitude = notification.destinationLatitude;
    const longitude = notification.destinationLongitude;

    // Validate destination coordinates
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      alert("Location is unavailable for this emergency.");
      return;
    }

    // Google Maps directions URL
    const mapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${latitude},${longitude}` +
      `&travelmode=walking`;

    // Open directions in a new tab or the appropriate Maps app
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Mesh Topology */}
      <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-400">
            MESH TOPOLOGY
          </span>

          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              meshActive
                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40"
                : "bg-zinc-800 text-zinc-600"
            }`}
          >
            {meshActive ? "ACTIVE" : "OFF"}
          </span>
        </div>

        <div className="h-52">
          <MeshVisualizer active={meshActive} />
        </div>
      </div>

      {/* Nearby Emergencies and Cancellation Updates */}
      <div className="mt-4 space-y-3">
        <p className="text-[10px] text-zinc-500 tracking-widest uppercase">
          Nearby Emergencies
        </p>

        {nearbyNotifications.length > 0 ? (
          nearbyNotifications.map((notification) => {
            const isCancelled =
              notification.status === "CANCELLED" ||
              notification.type === "SOS_CANCELLED";

            return (
              <div
                key={notification.id}
                onClick={
                  isCancelled
                    ? undefined
                    : () => openDirections(notification)
                }
                onKeyDown={(event) => {
                  if (
                    !isCancelled &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    openDirections(notification);
                  }
                }}
                role={isCancelled ? undefined : "button"}
                tabIndex={isCancelled ? undefined : 0}
                aria-label={
                  isCancelled
                    ? "Emergency resolved"
                    : "Open directions to nearby emergency"
                }
                className={`rounded-xl border p-3 transition ${
                  isCancelled
                    ? "bg-emerald-950/30 border-emerald-800/60"
                    : "bg-red-950/30 border-red-800/60 cursor-pointer hover:bg-red-950/60 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                }`}
              >
                {isCancelled ? (
                  /* SOS Cancellation Message */
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-900/50 text-emerald-400 text-xl">
                      ✓
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-emerald-400">
                          Emergency Resolved
                        </p>

                        <span className="text-[9px] font-bold text-emerald-400 border border-emerald-800 rounded px-2 py-1">
                          CANCELLED
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-zinc-300">
                        {notification.message ||
                          "The emergency alert has been cancelled. The person has confirmed they are safe."}
                      </p>

                      <p className="mt-2 text-[10px] text-emerald-500">
                        SOS alert resolved
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Clickable Active SOS Notification */
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-900/50 text-red-400 text-xl">
                      !
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-red-400">
                          Nearby Emergency
                        </p>

                        <span className="text-[9px] font-bold text-red-400 border border-red-800 rounded px-2 py-1">
                          ACTIVE
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-zinc-300">
                        {notification.message ||
                          "Someone nearby needs emergency help."}
                      </p>

                      {typeof notification.distanceMeters === "number" && (
                        <p className="mt-2 text-[10px] text-zinc-500">
                          Distance: {notification.distanceMeters} m
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <Icon
                          path={ICONS.map}
                          size={14}
                          className="text-cyan-400"
                        />

                        <p className="text-xs font-semibold text-cyan-400">
                          Click to get directions →
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-8 text-center">
            <div className="text-2xl text-emerald-400">✓</div>

            <p className="mt-3 text-sm text-zinc-300">
              No Nearby Emergencies
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Nearby SOS alerts will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Packet Information */}
      <div className="mt-4 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
        <p className="text-[10px] text-zinc-600 mb-3 tracking-widest uppercase">
          Packet Info
        </p>

        <div className="space-y-2 text-xs text-zinc-400">
          <div className="flex justify-between">
            <span>Encryption</span>
            <span className="text-cyan-400">AES-256</span>
          </div>

          <div className="flex justify-between">
            <span>Signature</span>
            <span className="text-cyan-400">RSA Digital Sig</span>
          </div>

          <div className="flex justify-between">
            <span>Packet includes</span>
            <span className="text-zinc-300">ID · Time · GPS · Type</span>
          </div>
        </div>
      </div>
    </>
  );
}