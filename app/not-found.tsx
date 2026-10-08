import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0c0f0b] text-[#f1f4ec] space-y-4 select-none">
      <h2 className="text-2xl font-black font-mono text-[#FBD53D]">404 — Page Not Found</h2>
      <p className="text-xs text-[#98a08e]">The table or page you are looking for does not exist.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#171b14] border border-[#2a3122] hover:border-[#FBD53D]/40 rounded-xl text-xs font-bold text-[#f1f4ec] transition-colors"
      >
        Return to Table
      </Link>
    </div>
  );
}
