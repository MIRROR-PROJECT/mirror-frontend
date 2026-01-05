"use client";

import { usePathname } from "next/navigation";
import "./globals.css";
import Navbar from "./components/Sidebar";
import MobileBottomNav from "./components/MobileBottomNav";
import { StudyProvider } from "./context/StudyContext";
import { LanguageProvider } from "./context/LanguageContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // [수정 포인트] Navbar를 숨길 경로들을 정의합니다.
  // 1. 랜딩 페이지 ("/")
  // 2. 로그인 ("/login")
  // 3. 회원가입 ("/signup")
  // 4. 진단 페이지 ("/student/diagnosis" 로 시작하는 모든 경로)
  const hideNavbar =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/onboarding/info" ||
    pathname == "/onboarding/role" ||
    pathname === "/payment" ||
    pathname === "/teacher/benefits" ||
    pathname?.startsWith("/student/diagnosis");

  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <LanguageProvider>
          <StudyProvider>
            <div className="flex min-h-screen">

              {/* 조건에 맞지 않을 때만 사이드바 표시 */}
              {!hideNavbar && <Navbar />}

              <main className="flex-1 pb-16 md:pb-0">
                {children}
              </main>

            </div>

            {/* 모바일 하단 네비게이션 */}
            <MobileBottomNav />
          </StudyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}