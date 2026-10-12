import AlertItem from "../components/AlertItem";

export default function EventLog({
  alerts = [],
  persistentEvents = []
}) {

  // Convert Firebase events
  const firebaseEvents = persistentEvents.map((event) => {

    const timestamp = event.timestamp
      ? new Date(event.timestamp).getTime()
      : event.createdAt?.toMillis?.() || 0;

    return {
      id: event.id,

      type: "danger",

      msg:
        event.type === "FALL"
          ? "Automatic Fall SOS"
          : "Emergency SOS Activated",

      time:
        event.timestamp
          ? new Date(event.timestamp).toLocaleTimeString()
          : event.createdAt?.toDate
            ? event.createdAt.toDate().toLocaleTimeString()
            : "Unknown time",

      status: event.status || "ACTIVE",

      timestamp
    };
  });


  // Convert current alerts
  const currentAlerts = alerts.map((alert, index) => {

    const timestamp = alert.timestamp
      ? new Date(alert.timestamp).getTime()
      : 0;

    return {
      ...alert,

      id: alert.id || `alert-${index}`,

      timestamp
    };
  });


  // Combine Firebase + current alerts
  // Then sort everything by newest first
  const allEvents = [
    ...firebaseEvents,
    ...currentAlerts
  ].sort((a, b) => b.timestamp - a.timestamp);


  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">

        <p className="text-[10px] text-zinc-600 tracking-widest uppercase">
          Event Log
        </p>

        <span className="text-[10px] text-zinc-600">
          {allEvents.length} entries
        </span>

      </div>


      {/* Events */}
      <div className="space-y-2">

        {allEvents.map((event, index) => (

          <AlertItem
            key={`${event.id}-${index}`}
            type={event.type}
            msg={event.msg}
            time={event.time}
            status={event.status}
          />

        ))}


        {/* Empty state */}
        {allEvents.length === 0 && (

          <div className="py-8 text-center">

            <p className="text-xs text-zinc-600">
              No emergency events recorded.
            </p>

          </div>

        )}

      </div>
    </>
  );
}