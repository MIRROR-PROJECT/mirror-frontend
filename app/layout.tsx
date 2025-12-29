import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StudyProvider } from "@/app/context/StudyContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mirror - AI Study Solution",
  description: "Personalized study platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* ⚠️ 수정됨: 주석을 <body> 태그 안으로 옮기거나 삭제해야 합니다. */}
      <body className={inter.className}>
        <StudyProvider>
          {children}
        </StudyProvider>
      </body>
    </html>
  );
}