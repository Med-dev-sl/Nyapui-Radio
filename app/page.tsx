"use client";

import Loading from "@/app/components/loading";

export default function Home() {
  return <Loading redirectTo="/login" delay={3500} />;
}
