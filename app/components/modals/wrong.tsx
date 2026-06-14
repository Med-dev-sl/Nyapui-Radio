"use client";

import Image from "next/image";

type Props = {
  message?: string;
};

export default function WrongModal({ message = "Invalid credentials" }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="animate-shake bg-white rounded-2xl px-12 py-10 flex flex-col items-center gap-5 shadow-2xl max-w-sm w-full mx-4">
        <Image src="/nyapui-radio.png" alt="Nyapui Radio" width={80} height={80} />
        <svg width={72} height={72} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" stroke="#dc2626" strokeWidth={2} />
          <line x1="14" y1="14" x2="34" y2="34" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" />
          <line x1="14" y1="34" x2="34" y2="14" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" />
        </svg>
        <p className="text-lg font-semibold text-[#dc2626]">{message}</p>
      </div>
    </div>
  );
}
