import { type ReactNode } from "react";

import { Logo } from "./Logo";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      className="flex h-full items-center justify-center bg-[#FAFAFA] p-4"
      style={{
        backgroundImage: "radial-gradient(#E7E7EC 1px,transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <div className="w-full max-w-[376px] rounded-xl border border-line bg-white p-8 shadow-[0_12px_40px_-12px_rgba(17,17,17,.12)]">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <Logo size={26} />
          <span
            className="font-semibold text-ink"
            style={{ fontSize: 20, letterSpacing: "-.02em" }}
          >
            pipely
          </span>
        </div>
        <h1 className="text-center text-[17px] font-semibold text-ink">{title}</h1>
        <p className="mb-6 mt-1.5 text-center text-[13px] text-gray-500">{subtitle}</p>
        {children}
        <div className="mt-5 text-center text-[13px] text-gray-500">{footer}</div>
      </div>
    </div>
  );
}
