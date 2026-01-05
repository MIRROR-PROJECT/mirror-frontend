"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useStudy } from "@/app/context/StudyContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { ROLE_MENUS } from "@/app/constants/navigation";
import { Home, BookOpen, BarChart2, MessageCircle, User, LogOut, X, RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import LanguageToggle from "./LanguageToggle";

export default function MobileBottomNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useStudy();
    const { t } = useLanguage();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // URL 파라미터로 역할 오버라이드
    const paramRole = searchParams.get("role");
    const currentRole = (paramRole || user.role) as "student" | "teacher" | "parent";

    // 네비게이션을 숨길 경로들
    const hideNav =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/onboarding/info" ||
        pathname === "/onboarding/role" ||
        pathname === "/payment" ||
        pathname === "/teacher/benefits" ||
        pathname?.startsWith("/student/diagnosis");

    if (hideNav) return null;

    const menuItems = ROLE_MENUS[currentRole] || [];

    // 아이콘 매핑
    const iconMap: Record<string, any> = {
        "Dashboard": Home,
        "대시보드": Home,
        "My Study Room": BookOpen,
        "나의 학습방": BookOpen,
        "Report": BarChart2,
        "리포트": BarChart2,
        "AI Tutor": MessageCircle,
        "AI 튜터": MessageCircle,
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.clear();
        router.push('/login');
    };

    // 역할 변경 처리
    const handleRoleChange = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            // 1. users 테이블에서 role 삭제 (NULL로 설정)
            const { error: updateError } = await supabase
                .from('users')
                .update({ role: null })
                .eq('id', session.user.id);

            if (updateError) {
                console.error('Role 삭제 실패:', updateError);
                alert('역할 변경에 실패했습니다.');
                return;
            }

            // 2. 로컬 스토리지 초기화
            localStorage.clear();
            sessionStorage.clear();

            // 3. 역할 선택 페이지로 이동
            setShowProfileMenu(false);
            router.push('/onboarding/role');
        } catch (error) {
            console.error('역할 변경 중 오류:', error);
            alert('역할 변경 중 오류가 발생했습니다.');
        }
    };

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    {menuItems.slice(0, 4).map((item) => {
                        const isActive = pathname === item.path;
                        const Icon = iconMap[item.name] || Home;

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                    ? "text-blue-600"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 mb-1 ${isActive ? "stroke-[2.5]" : ""}`} />
                                <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
                                    {t(item.nameKey)}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Profile/More 메뉴 */}
                    <button
                        onClick={() => setShowProfileMenu(true)}
                        className="flex flex-col items-center justify-center flex-1 h-full text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <User className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-medium">{t('nav.profile')}</span>
                    </button>
                </div>
            </nav>

            {/* Profile Menu Modal */}
            {showProfileMenu && (
                <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
                    <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900">{t('nav.profile')}</h3>
                            <button onClick={() => setShowProfileMenu(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Language Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <span className="text-sm font-medium text-gray-700">Language</span>
                                <LanguageToggle />
                            </div>

                            {/* Role Change Button */}
                            <button
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    handleRoleChange();
                                }}
                                className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                            >
                                <RefreshCw className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-bold text-purple-600">역할 변경하기</span>
                            </button>

                            {/* Logout Button */}
                            <button
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    setShowLogoutModal(true);
                                }}
                                className="w-full flex items-center gap-3 p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                            >
                                <LogOut className="w-5 h-5 text-red-600" />
                                <span className="text-sm font-bold text-red-600">{t('common.logout')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{t('nav.logoutConfirm')}</h3>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white transition-colors"
                            >
                                {t('common.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
