export const generateMeshPeers = () => {
  return [
    {
      id: "NODE-01",
      name: "Relay Node 01",
      distance: "4m",
      relay: true,
      signal: 4,
      avatar: "R1",
      ttl: 5,
      status: "CONNECTED"
    },
    {
      id: "NODE-02",
      name: "Relay Node 02",
      distance: "9m",
      relay: true,
      signal: 3,
      avatar: "R2",
      ttl: 4,
      status: "CONNECTED"
    },
    {
      id: "NODE-03",
      name: "Relay Node 03",
      distance: "14m",
      relay: true,
      signal: 2,
      avatar: "R3",
      ttl: 3,
      status: "RELAYING"
    },
    {
      id: "NODE-04",
      name: "Relay Node 04",
      distance: "20m",
      relay: false,
      signal: 1,
      avatar: "R4",
      ttl: 2,
      status: "AVAILABLE"
    }
  ];
};