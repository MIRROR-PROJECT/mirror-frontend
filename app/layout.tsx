import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { StudyProvider } from "@/app/context/StudyContext";
import Sidebar from "./components/Sidebar";

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
      <body className={inter.className}>
        <StudyProvider>
          <div className="min-h-screen flex bg-gray-50">
            <Sidebar />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </StudyProvider>
      </body>
    </html>
  );
}