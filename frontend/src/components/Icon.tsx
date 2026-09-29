export type IconName =
  | "search" | "dash" | "users" | "globe" | "instagram" | "send" | "user"
  | "more" | "chevdown" | "chevup" | "chevleft" | "chevright" | "sort"
  | "filter" | "plus" | "check" | "logout" | "pencil" | "trash" | "clock"
  | "mail" | "phone" | "menu" | "inbox" | "alert" | "refresh" | "x"
  | "table" | "columns";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  stroke?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 16, className, stroke, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke ?? "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <use href={`#i-${name}`} />
    </svg>
  );
}
