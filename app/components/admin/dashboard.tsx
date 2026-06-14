"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";

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
    <div className="min-h-screen bg-zinc-50">
      <Header user={user} />
    </div>
  );
}
