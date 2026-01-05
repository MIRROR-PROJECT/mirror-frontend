"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, School, Users, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import LanguageToggle from "@/app/components/LanguageToggle";
import { useLanguage } from "@/app/context/LanguageContext";

// API 응답 타입 정의
interface RoleResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    user_id: string;
    role: string;
    role_id: string;
  } | null;
}

export default function RoleSelectionPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [checking, setChecking] = useState(true);

  // 페이지 로드 시 로그인 확인만 수행 (role 체크 제거)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          router.replace('/login');
          return;
        }

        console.log('✅ [Role Selection] 로그인 확인 완료');
      } catch (error) {
        console.error("Auth 체크 에러:", error);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const selectRole = async (role: string) => {
    console.log(`🔄 [Role Selection] ${role} 선택됨 - 진단 페이지로 이동`);

    // Role을 저장하지 않고 URL 파라미터로만 전달
    if (role === 'student') {
      // 학생 -> 진단 페이지로 (role을 URL 파라미터로 전달)
      router.push(`/student/diagnosis?role=${role}`);
    } else {
      // 선생님/학부모 -> 추가 정보 입력 페이지로
      router.push(`/onboarding/info?role=${role}`);
    }
  };

  // 체크 중일 때는 로딩 표시
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-gray-500 font-medium">확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 relative">
      {/* 언어 토글 버튼 - 우측 상단 */}
      <div className="absolute top-6 right-6">
        <LanguageToggle />
      </div>

      <div className="max-w-2xl w-full text-center space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('onboarding.role.title')}</h1>
          <p className="text-gray-500">{t('onboarding.role.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 학생 버튼 */}
          <button onClick={() => selectRole('student')} className="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-lg font-bold text-gray-800">{t('onboarding.role.student')}</span>
            <span className="text-sm text-gray-400 mt-2">{t('onboarding.role.studentDesc')}</span>
          </button>

          {/* 선생님 버튼 */}
          <button onClick={() => selectRole('teacher')} className="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-transparent hover:border-indigo-500 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <School className="w-8 h-8 text-indigo-600" />
            </div>
            <span className="text-lg font-bold text-gray-800">{t('onboarding.role.teacher')}</span>
            <span className="text-sm text-gray-400 mt-2">{t('onboarding.role.teacherDesc')}</span>
          </button>

          {/* 학부모 버튼 */}
          <button onClick={() => selectRole('parent')} className="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-transparent hover:border-green-500 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-lg font-bold text-gray-800">{t('onboarding.role.parent')}</span>
            <span className="text-sm text-gray-400 mt-2">{t('onboarding.role.parentDesc')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}