'use client';

import dynamic from "next/dynamic";

const BluffApp = dynamic(() => import("@/components/BluffApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0f0b] text-[#f1f4ec] space-y-3">
      <div className="w-8 h-8 border-2 border-[#FBD53D] border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono text-[#98a08e] uppercase tracking-widest">
        Loading Bluff…
      </span>
    </div>
  ),
});

export default function Home() {
  return <BluffApp />;
}
