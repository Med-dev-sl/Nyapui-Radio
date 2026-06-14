"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Logo from "@/app/components/logo";
import SuccessModal from "@/app/components/modals/success";
import WrongModal from "@/app/components/modals/wrong";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loggedUser, setLoggedUser] = useState("");
  const [showWrong, setShowWrong] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setShowWrong(true);
      setTimeout(() => setShowWrong(false), 2000);
      return;
    }

    const user = data.user;
    setLoggedUser(user?.full_name || username);
    localStorage.setItem("nyapui_user", JSON.stringify(user));
    setShowSuccess(true);
    setTimeout(() => router.push("/admin/dashboard"), 2000);
  }

  return (
    <>
      {showSuccess && <SuccessModal username={loggedUser} />}
      {showWrong && <WrongModal />}
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="rounded-none bg-white border-l-[6px] border-[#cc4400] border-r-[6px] border-[#1a4b8c] px-10 py-6 flex flex-col items-center gap-5 w-full max-w-lg shadow-[0_0_20px_rgba(26,75,140,0.1),0_0_20px_rgba(204,68,0,0.1)]">
          <div className="w-full text-center border-b border-zinc-200 pb-3 mb-2">
            <span className="text-sm font-semibold tracking-wider text-[#cc4400] uppercase">System Administrator</span>
          </div>
          <Logo size={160} />
          <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
            <div className="relative">
              <Image
                src="/assets/user-svgrepo-com.svg"
                alt="user"
                width={20}
                height={20}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 pl-10 pr-4 py-3 text-base outline-none focus:border-[#cc4400]"
              />
            </div>
            <div className="relative">
              <Image
                src="/assets/lock-closed-svgrepo-com.svg"
                alt="lock"
                width={20}
                height={20}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 pl-10 pr-4 py-3 text-base outline-none focus:border-[#cc4400]"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#cc4400] py-3 text-base font-semibold text-white hover:bg-[#e65c00]"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
