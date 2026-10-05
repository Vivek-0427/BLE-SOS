// ── Mesh Visualizer (animated SVG) ───────────────────────────────────────────

const MeshVisualizer = ({ active }) => {
  const nodes = [
    { x: 120, y: 80, label: "YOU", primary: true },
    { x: 240, y: 50, label: "Node A", relay: true },
    { x: 290, y: 140, label: "Node B" },
    { x: 60, y: 160, label: "Node C" },
    { x: 190, y: 190, label: "Node D", relay: true },
    { x: 330, y: 60, label: "SERVER", server: true },
  ];
  const edges = [[0,1],[0,3],[1,2],[1,5],[2,4],[3,4],[1,4]];
  return (
    <svg viewBox="0 0 390 240" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#06b6d4" opacity="0.6" />
        </marker>
      </defs>
      {edges.map(([a,b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={active ? "#06b6d4" : "#27272a"} strokeWidth="1" strokeOpacity={active ? 0.4 : 0.3}
          strokeDasharray={active ? "4 3" : "none"} markerEnd={active ? "url(#arr)" : "none"} />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          {n.primary && active && (
            <circle cx={n.x} cy={n.y} r="22" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.4">
              <animate attributeName="r" values="18;28;18" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          {n.relay && active && (
            <circle cx={n.x} cy={n.y} r="16" fill="none" stroke="#06b6d4" strokeWidth="0.8" opacity="0.5">
              <animate attributeName="r" values="14;20;14" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
            </circle>
          )}
          <circle cx={n.x} cy={n.y} r={n.primary ? 14 : n.server ? 12 : 10}
            fill={n.primary ? "#7f1d1d" : n.server ? "#134e4a" : "#1c1917"}
            stroke={n.primary ? "#ef4444" : n.relay ? "#06b6d4" : n.server ? "#10b981" : "#3f3f46"}
            strokeWidth={n.primary ? 2 : 1.5} />
          <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
            fontSize={n.primary ? "7" : "6"} fill={n.primary ? "#fca5a5" : n.server ? "#6ee7b7" : n.relay ? "#67e8f9" : "#a1a1aa"}
            fontFamily="monospace" fontWeight="bold">
            {n.primary ? "SOS" : n.server ? "NET" : ""}
          </text>
          <text x={n.x} y={n.y + (n.primary ? 22 : 18)} textAnchor="middle" fontSize="7" fill="#71717a" fontFamily="monospace">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default MeshVisualizer;
