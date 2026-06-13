"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import dualBall from "@/public/Dual Ball@1x-1.0s-200px-200px.json";

export default function Loading() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push("/login"), 3500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Lottie animationData={dualBall} loop style={{ width: 200, height: 200 }} />
    </div>
  );
}
