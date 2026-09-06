import AlertItem from "../components/AlertItem";
import Icon from "../components/Icon";
import ICONS from "../data/constants";

export default function EventLog({ alerts }) {
  return (
    <>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-zinc-600 tracking-widest uppercase">Event Log</p>
              <span className="text-[10px] text-zinc-600">{alerts.length} entries</span>
            </div>
            <div className="space-y-2">
              {alerts.map((a, i) => <AlertItem key={i} {...a} />)}
            </div>
    </>

    );

}
