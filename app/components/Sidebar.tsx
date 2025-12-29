"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, BarChart2, Highlighter, MessageCircle } from "lucide-react";
// [수정] 상대 경로로 변경 (점 1개)
import { useStudy } from "../context/StudyContext"; 

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useStudy();

// ... (아래 코드는 기존과 동일)

  // 메뉴 목록 정의
  const MENU_ITEMS = [
    { name: "대시보드", path: "/dashboard", icon: LayoutDashboard },
    { name: "나의 학습방", path: "/study-room", icon: BookOpen },
    { name: "리포트 모아보기", path: "/report", icon: BarChart2 }, // 나중에 만들 것
    { name: "AI 튜터", path: "/chat", icon: MessageCircle }, // 나중에 만들 것
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-6 sticky top-0 h-screen z-50">
      {/* 로고 */}
      <div className="text-2xl font-bold text-blue-600 mb-10 pl-2">Mirror.</div>
      
      {/* 메뉴 네비게이션 */}
      <nav className="space-y-2 flex-1">
        {MENU_ITEMS.map((item) => {
          // 현재 주소가 메뉴의 경로와 일치하면 활성화 (파란색)
          const isActive = pathname === item.path; 
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      
      {/* 하단 프로필 (Context 데이터 연동) */}
      <div className="flex items-center gap-3 p-3 border-t border-gray-100 pt-6">
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center text-lg">
           🧸
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">고2 이과반</p>
        </div>
      </div>
    </aside>
  );
}