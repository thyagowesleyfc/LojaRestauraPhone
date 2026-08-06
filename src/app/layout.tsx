import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RestauraPhone",
  description: "Catalogo publico e painel administrativo da RestauraPhone."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
