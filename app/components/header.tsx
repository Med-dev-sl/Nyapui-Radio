"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/logo";
import LogoutModal from "@/app/components/modals/logout";

type User = {
  id: number;
  username: string;
  full_name: string;
  role: string;
};

type Props = {
  user: User;
};

export default function Header({ user }: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  function handleLogout() {
    localStorage.removeItem("nyapui_user");
    router.push("/login");
  }

  return (
    <>
      {showModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowModal(false)}
        />
      )}
      <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo size={56} />
          <span className="text-lg font-bold text-[#1a4b8c]">Nyapui Radio</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-600">
            {user.full_name}
            <span className="text-zinc-400 ml-1">({user.role})</span>
          </span>
          <button
            onClick={() => setShowModal(true)}
            className="rounded-lg bg-[#1a4b8c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563eb] flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>
    </>
  );
}
