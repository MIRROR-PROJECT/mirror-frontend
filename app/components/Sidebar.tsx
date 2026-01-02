"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useStudy } from "@/app/context/StudyContext";
import { ROLE_MENUS } from "@/app/constants/navigation";
import { Suspense } from "react";

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, userInfo } = useStudy();

  // URL 파라미터로 역할 오버라이드 (데모/테스트용)
  const paramRole = searchParams.get("role");
  const currentRole = (paramRole || user.role) as "student" | "teacher" | "parent";

  // 홈('/')에서는 사이드바를 숨김
  if (pathname === "/") return null;

  // 현재 유저 역할에 맞는 메뉴 리스트 가져오기 (없으면 학생꺼 기본)
  const currentMenus = ROLE_MENUS[currentRole] || ROLE_MENUS.student;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-6 sticky top-0 h-screen z-50">
      <div className="text-2xl font-bold text-blue-600 mb-10 pl-2">Mirror.</div>

      <div className="mb-4 px-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {currentRole === 'teacher' ? 'Instructor Mode' :
            currentRole === 'parent' ? 'Parent Mode' : 'Student Mode'}
        </span>
      </div>

      <nav className="space-y-2 flex-1">
        {currentMenus.map((item) => {
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

      {/* 프로필 영역 */}
      <div className="flex items-center gap-3 p-3 border-t border-gray-100 pt-6">
        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
          {/* 역할별 아이콘 다르게 */}
          {currentRole === 'teacher' ? '👨‍🏫' : currentRole === 'parent' ? '👨‍👩‍👧' : '🧸'}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{userInfo?.name || "GUEST"}</p>
          <p className="text-xs text-gray-500 capitalize">{currentRole}</p>
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="w-64 bg-white border-r border-gray-200 hidden md:flex" />}>
      <SidebarContent />
    </Suspense>
  );
}