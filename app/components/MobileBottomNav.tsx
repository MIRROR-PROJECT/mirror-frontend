"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useStudy } from "@/app/context/StudyContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { ROLE_MENUS } from "@/app/constants/navigation";
import { Home, BookOpen, BarChart2, MessageCircle } from "lucide-react";

export default function MobileBottomNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user } = useStudy();
    const { t } = useLanguage();

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

    return (
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
            </div>
        </nav>
    );
}
