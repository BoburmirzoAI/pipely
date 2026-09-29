import { type ReactNode, useEffect } from "react";

export function Modal({
  onClose,
  children,
  width = 468,
}: {
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/[.28] p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full overflow-hidden rounded-xl bg-white shadow-modal"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
