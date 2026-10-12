const PeerCard = ({ notification }) => {
  const {
    message = "Someone nearby needs emergency help.",
    distanceMeters,
    status = "UNREAD",
    createdAt,
  } = notification || {};

  const isUnread = status === "UNREAD";

  const timestamp = createdAt?.toDate
    ? createdAt.toDate()
    : createdAt
      ? new Date(createdAt)
      : null;

  const time =
    timestamp && !Number.isNaN(timestamp.getTime())
      ? timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
        isUnread
          ? "border-red-900/70 bg-red-950/20 hover:border-red-700"
          : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
      }`}
    >
      {/* Emergency Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-800/50 bg-red-950/60 text-lg">
        🚨
      </div>

      {/* Emergency Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`truncate text-sm font-medium ${
              notification?.type === "SOS_CANCELLED"
                ? "text-emerald-300"
                : "text-zinc-200"
            }`}
          >
            {notification?.type === "SOS_CANCELLED"
              ? "Emergency Cancelled"
              : "Nearby Emergency"}
          </p>

          <span className="rounded border border-red-800/60 bg-red-950/60 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-red-400">
            SOS
          </span>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-zinc-400">
          {notification?.message ||
            "Someone nearby needs emergency help."}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-cyan-400">
            {typeof distanceMeters === "number"
              ? `${distanceMeters} m away`
              : "Distance unavailable"}
          </span>

          {time && (
            <span className="text-[10px] text-zinc-500">
              {time}
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span
          className={`flex items-center gap-1.5 text-[10px] font-mono ${
            isUnread ? "text-red-400" : "text-emerald-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isUnread
                ? "animate-pulse bg-red-400"
                : "bg-emerald-400"
            }`}
          />
          {status}
        </span>

        <span className="text-[9px] tracking-wider text-zinc-600">
          EMERGENCY
        </span>
      </div>
    </div>
  );
};

export default PeerCard;