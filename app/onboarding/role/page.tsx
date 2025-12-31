"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, School, Users } from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();

  const selectRole = (role: string) => {
    // 1. 여기서 백엔드에 '이 유저는 [role]입니다' 라고 업데이트 API 호출 필요
    // await updateRoleAPI(role);
    
    console.log(`역할 선택됨: ${role}`);

    if (role === 'student') {
      // 학생 -> 바로 진단 검사로 이동
      router.push("/student/diagnosis");
    } else {
      // 선생님/학부모 -> 추가 정보 입력 페이지로 이동
      router.push(`/onboarding/info?role=${role}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full text-center space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">어떤 목적으로 오셨나요?</h1>
          <p className="text-gray-500">서비스 이용을 위해 역할을 선택해주세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 학생 버튼 */}
          <button onClick={() => selectRole('student')} className="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-lg font-bold text-gray-800">학생</span>
            <span className="text-sm text-gray-400 mt-2">성적 향상을 위해</span>
          </button>

          {/* 선생님 버튼 */}
          <button onClick={() => selectRole('teacher')} className="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-transparent hover:border-indigo-500 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
              <School className="w-8 h-8 text-indigo-600" />
            </div>
            <span className="text-lg font-bold text-gray-800">선생님</span>
            <span className="text-sm text-gray-400 mt-2">학생 관리를 위해</span>
          </button>

          {/* 학부모 버튼 */}
          <button onClick={() => selectRole('parent')} className="group flex flex-col items-center justify-center p-8 bg-white rounded-2xl border-2 border-transparent hover:border-green-500 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-lg font-bold text-gray-800">학부모</span>
            <span className="text-sm text-gray-400 mt-2">자녀 확인을 위해</span>
          </button>
        </div>
      </div>
    </div>
  );
}