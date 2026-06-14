"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import dualBall from "@/public/Dual Ball@1x-1.0s-200px-200px.json";

type LoadingProps = {
  redirectTo?: string;
  delay?: number;
};

export default function Loading({ redirectTo, delay }: LoadingProps) {
  const router = useRouter();

  useEffect(() => {
    if (!redirectTo) return;
    const timer = setTimeout(() => router.push(redirectTo), delay ?? 3500);
    return () => clearTimeout(timer);
  }, [router, redirectTo, delay]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Lottie animationData={dualBall} loop style={{ width: 200, height: 200 }} />
    </div>
  );
}
