"use client";

import Image from "next/image";

type Props = {
  username: string;
};

export default function SuccessModal({ username }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="animate-modal-in bg-white rounded-2xl px-12 py-10 flex flex-col items-center gap-5 shadow-2xl max-w-sm w-full mx-4">
        <Image src="/nyapui-radio.png" alt="Nyapui Radio" width={80} height={80} />
        <svg width={72} height={72} viewBox="0 0 512 512" fill="none">
          <circle cx="256" cy="256" r="213.33" fill="#16a34a" />
          <path
            d="M192 299.67L323.84 167.11l30.16 30.17L192 360l-79.08-79.08 30.16-30.17L192 299.67z"
            fill="white"
          />
        </svg>
        <p className="text-xl font-semibold text-zinc-800">
          Welcome, <span className="text-[#16a34a]">{username}</span>!
        </p>
      </div>
    </div>
  );
}
