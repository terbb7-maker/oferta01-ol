import type { Metadata } from "next";
import "./globals.css";
import { TikTokPixel } from "@/components/tiktok-pixel";

export const metadata: Metadata = {
  title: "Olympikus · Viva o movimento",
  description: "Tênis Olympikus para corrida, treino e movimento todos os dias.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="pt-BR">
      <body className="antialiased"><TikTokPixel />{children}</body>
    </html>
  );
}
