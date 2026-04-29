import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Direction Distiller / 方向压缩器",
  description: "把零散灵感压成可提案的视觉方向。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
