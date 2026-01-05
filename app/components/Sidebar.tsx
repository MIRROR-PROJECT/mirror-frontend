"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useStudy } from "@/app/context/StudyContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { ROLE_MENUS } from "@/app/constants/navigation";
import { Suspense, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { LogOut, X } from "lucide-react";
import { useRouter } from "next/navigation";
import LanguageToggle from "./LanguageToggle";

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userInfo } = useStudy();
  const { t } = useLanguage();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userName, setUserName] = useState("");

  // URL 파라미터로 역할 오버라이드 (데모/테스트용)
  const paramRole = searchParams.get("role");
  const currentRole = (paramRole || user.role) as "student" | "teacher" | "parent";

  // 홈('/')에서는 사이드바를 숨김
  if (pathname === "/") return null;

  // 실제 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Supabase users 테이블에서 이름 가져오기
        const { data: userData } = await supabase
          .from('users')
          .select('name')
          .eq('id', session.user.id)
          .single();

        if (userData?.name) {
          setUserName(userData.name);
        } else {
          // users 테이블에 없으면 auth 메타데이터에서
          setUserName(session.user.user_metadata?.name || session.user.email?.split('@')[0] || "사용자");
        }
      }
    };

    fetchUserData();
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); // 모든 튜토리얼 상태 초기화
    router.push('/login');
  };

  // 현재 유저 역할에 맞는 메뉴 리스트 가져오기 (없으면 학생꺼 기본)
  const currentMenus = ROLE_MENUS[currentRole] || ROLE_MENUS.student;

  return (
    <>
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col p-6 sticky top-0 h-screen z-50">
        <div className="text-2xl font-bold text-blue-600 mb-10 pl-2">Mirror.</div>

        <div className="mb-4 px-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {currentRole === 'teacher' ? t('nav.teacherMode') :
              currentRole === 'parent' ? t('nav.parentMode') : t('nav.studentMode')}
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
                  <span>{t(item.nameKey)}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* 언어 전환 버튼 */}
        <div className="px-2 mb-4">
          <LanguageToggle />
        </div>

        {/* 프로필 영역 - 클릭 가능하게 */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-3 p-3 border-t border-gray-100 pt-6 hover:bg-gray-50 rounded-lg transition-colors w-full text-left"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-lg">
            {/* 역할별 아이콘 다르게 */}
            {currentRole === 'teacher' ? '👨‍🏫' : currentRole === 'parent' ? '👨‍👩‍👧' : '🧸'}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{userName || userInfo?.name || t('common.loading')}</p>
            <p className="text-xs text-gray-500 capitalize">{currentRole}</p>
          </div>
        </button>
      </aside>

      {/* 로그아웃 모달 */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 w-full">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{t('common.logout')}</h3>
              <button onClick={() => setShowLogoutModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              {t('nav.logoutConfirm')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="w-64 bg-white border-r border-gray-200 hidden md:flex" />}>
      <SidebarContent />
    </Suspense>
  );
}
