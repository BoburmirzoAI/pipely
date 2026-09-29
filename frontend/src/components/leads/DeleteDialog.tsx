import { Icon } from "../Icon";
import { Modal } from "../Modal";

export function DeleteDialog({
  leadName,
  busy,
  onCancel,
  onConfirm,
}: {
  leadName: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal onClose={onCancel} width={412}>
      <div className="p-6">
        <div className="flex gap-4">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#FEF2F2]">
            <Icon name="trash" size={19} stroke="#DC2626" />
          </span>
          <div className="pt-0.5">
            <div className="text-base font-semibold text-ink">Delete {leadName}?</div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              This will permanently remove the lead and its activity history. This action
              cannot be undone.
            </div>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#DC2626] bg-[#DC2626] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#B91C1C] disabled:opacity-60"
          >
            <Icon name="trash" size={14} />
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
