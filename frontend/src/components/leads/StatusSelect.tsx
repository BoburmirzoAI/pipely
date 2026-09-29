import { Icon } from "../Icon";
import { Popover } from "../Popover";
import { STATUS_META, STATUS_ORDER } from "../../lib/leadMeta";
import type { LeadStatus } from "../../lib/types";

export function StatusSelect({
  value,
  onChange,
}: {
  value: LeadStatus;
  onChange: (s: LeadStatus) => void;
}) {
  const m = STATUS_META[value];
  return (
    <Popover
      width={184}
      trigger={(open) => (
        <button
          className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm font-medium"
          style={{ borderColor: m.dot, background: m.pillBg, color: m.pillText }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.dot }} />
          {m.label}
          <Icon name={open ? "chevup" : "chevdown"} size={14} />
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col">
          {STATUS_ORDER.map((s) => {
            const sm = STATUS_META[s];
            const active = s === value;
            return (
              <button
                key={s}
                onClick={() => {
                  if (!active) onChange(s);
                  close();
                }}
                className="flex items-center gap-2.5 rounded px-2 py-1.5 text-left text-[13px] hover:bg-[#F6F6F7]"
                style={active ? { background: sm.pillBg, color: sm.pillText } : undefined}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: sm.dot }} />
                <span className="flex-1">{sm.label}</span>
                {active && <Icon name="check" size={14} stroke={sm.pillText} strokeWidth={2.4} />}
              </button>
            );
          })}
        </div>
      )}
    </Popover>
  );
}
