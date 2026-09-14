import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Olympikus · Celebração 51 anos (demonstração)",
  description: "Protótipo navegável da experiência de comemoração de 51 anos da Olympikus. Demonstração sem vendas ou pagamentos reais.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
