import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "个人成长记录",
  description: "记录成长，追踪进步，成为更好的自己",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className="antialiased bg-gray-950 text-white min-h-screen"
      >
        {children}
      </body>
    </html>
  );
}
