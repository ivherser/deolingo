import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

export const dynamic = "force-dynamic";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Deolingo — alemán para tu día a día",
  description: "Aprende alemán A1 con lecciones breves, gramática y vocabulario.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${nunito.variable} antialiased`}>{children}</body>
    </html>
  );
}
