import ContactCard from "../components/ContactCard"
import Icon from "../components/Icon"
import ICONS from "../data/constants"

export default function Contacts({ contacts, sosActive }) {
    return (
        <>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase">Emergency Contacts</p>
              <button className="flex items-center gap-1 text-xs text-cyan-400 border border-cyan-900/50 px-2 py-1 rounded-lg hover:bg-cyan-950/30">
                <Icon path={ICONS.plus} size={12} /> Add
              </button>
            </div>
            <div className="space-y-2">
              <ContactCard name="Contact 1" relation="Friend" phone="+91 98450 XXXXX" notified={sosActive} />
              <ContactCard name="Contact 2" relation="Guardian" phone="+91 98440 XXXXX" notified={false} />
              <ContactCard name="Emergency SOS" relation="Campus Security" phone="080-2323-XXXX" notified={sosActive} />
            </div>

            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-[10px] text-zinc-600 mb-3 tracking-widest uppercase">Escalation Flow</p>
              <div className="space-y-2 text-xs">
                {["SOS triggered on device", "BLE broadcast to mesh peers", "Relay via internet-connected peer", "SMS + Push to emergency contacts", "Dashboard notification logged"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500 shrink-0">{i+1}</span>
                    <span className="text-zinc-400">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
    );
}

