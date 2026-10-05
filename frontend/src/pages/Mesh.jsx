import MeshVisualizer from "../components/MeshVisualizer";
import PeerCard from "../components/PeerCard";

export default function Mesh({ meshActive, peers, ttl }) {
  return (
    <>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400">BLE MESH TOPOLOGY</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${meshActive ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/40" : "bg-zinc-800 text-zinc-600"}`}>
                  {meshActive ? "ACTIVE" : "OFF"}
                </span>
              </div>
              <div className="h-52">
                <MeshVisualizer active={meshActive} />
              </div>
            </div>

            <div>
              <p className="text-[10px] text-zinc-600 mb-2 tracking-widest uppercase">Discovered Peers ({peers.length})</p>
              <div className="space-y-2">
                {peers.map((p, i) => <PeerCard key={i} {...p} />)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-[10px] text-zinc-600 mb-3 tracking-widest uppercase">Packet Info</p>
              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between"><span>Encryption</span><span className="text-cyan-400">AES-256</span></div>
                <div className="flex justify-between"><span>Signature</span><span className="text-cyan-400">RSA Digital Sig</span></div>
                <div className="flex justify-between"><span>Max TTL</span><span className="text-violet-400">{ttl} hops</span></div>
                <div className="flex justify-between"><span>Packet includes</span><span className="text-zinc-300">ID · Time · GPS · Type</span></div>
              </div>
            </div>
          </>

    );      
}
