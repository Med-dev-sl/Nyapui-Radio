"use client";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

export default function LogoutModal({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl px-10 py-8 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4 animate-modal-in">
        <svg width={56} height={56} viewBox="0 0 24 24" fill="none" stroke="#cc4400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-lg font-semibold text-zinc-800 text-center">
          Are you sure you want to log out?
        </p>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-[#cc4400] py-2.5 text-sm font-semibold text-white hover:bg-[#e65c00]"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
