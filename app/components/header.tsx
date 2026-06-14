"use client";

import { useRouter } from "next/navigation";
import Logo from "@/app/components/logo";

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

  function handleLogout() {
    localStorage.removeItem("nyapui_user");
    router.push("/login");
  }

  return (
    <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Logo size={40} />
        <span className="text-lg font-bold text-[#1a4b8c]">Nyapui Radio</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-600">
          {user.full_name}
          <span className="text-zinc-400 ml-1">({user.role})</span>
        </span>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-[#1a4b8c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2563eb]"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
