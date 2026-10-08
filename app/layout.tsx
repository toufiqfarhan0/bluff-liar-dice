import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bluff — Private Liar's Dice on Solana",
  description:
    "Encrypted dice in hardware TEE enclaves, zero-gas sub-second bids on MagicBlock Ephemeral Rollups, instant Solana Devnet settlement.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c0f0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&family=Unbounded:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0c0f0b] text-[#f1f4ec] min-h-screen antialiased selection:bg-[#FBD53D] selection:text-[#141004]">
        {children}
      </body>
    </html>
  );
}
