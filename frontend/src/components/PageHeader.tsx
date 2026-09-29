import { type ReactNode } from "react";

import { Icon, type IconName } from "./Icon";

export function PageHeader({
  icon,
  title,
  action,
}: {
  icon: IconName;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-14 flex-none items-center justify-between border-b border-line px-5">
      <div className="flex items-center gap-2.5">
        <Icon name={icon} size={18} stroke="#111" />
        <span className="text-[15px] font-semibold text-ink">{title}</span>
      </div>
      {action}
    </div>
  );
}
