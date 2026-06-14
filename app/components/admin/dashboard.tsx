"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import Sidebar from "@/app/components/sidebar";

type User = {
  id: number;
  username: string;
  full_name: string;
  role: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("nyapui_user");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header user={user} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold text-zinc-800">Dashboard Overview</h2>
        </main>
      </div>
    </div>
  );
}
