import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TACO-IDE",
  description:
    "A plataforma inteligente para professores criarem exercícios de Python com suporte de IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
