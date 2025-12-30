"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, TrendingUp } from "lucide-react";
// 전역 상태(Context) 사용 (로그인 정보 확인용)
import { useStudy } from "./context/StudyContext"; 

export default function Home() {
  const router = useRouter();
  const { user } = useStudy(); // user 정보 가져오기 (name, role 등)

  const handleDiagnosisClick = () => {
    // 1. 비로그인 상태일 경우 -> 회원가입 페이지로 유도
    // (실제 앱에서는 user 객체가 null인지 체크하는 로직이 필요합니다)
    const isLoggedIn = user && user.name !== ""; // 예시: 이름이 있으면 로그인된 것으로 간주

    if (!isLoggedIn) {
      router.push("/signup"); 
      return;
    }

    // 2. 로그인 상태일 경우 -> 역할에 따라 이동
    if (user.role === "student") {
      router.push("/diagnosis"); // 학생 -> 진단 페이지
    } else {
      router.push("/dashboard"); // 선생님/학부모 -> 대시보드
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar는 layout.tsx에서 제어합니다 */}

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:flex lg:items-center lg:gap-12">
        {/* Left: Copy */}
        <div className="lg:w-1/2 space-y-8">
          <div className="inline-block bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
            📉 2개월 만에 4등급 → 1등급 사례 1,240건 돌파
          </div>
          <h1 className="text-5xl font-extrabold leading-tight text-gray-900">
            옆집 철수가<br />
            머리가 좋은 게 아닙니다.<br />
            <span className="text-blue-600">자기 '유형'을 알고<br />덤볐을 뿐입니다.</span>
          </h1>
          <p className="text-xl text-gray-600">
            무작정 문제만 풀던 시간을 30% 줄이고,<br />
            점수는 20점 올리는 <strong>Mirroring & Morphing</strong> 기술.
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={handleDiagnosisClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-200"
            >
              🚀 무료로 내 '승리 패턴' 진단받기
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-red-500 font-medium">
            ⚠️ 현재 접속자가 많아 리포트 생성이 1분 정도 지연될 수 있습니다.
          </p>
        </div>

        {/* Right: Visual Concept */}
        <div className="lg:w-1/2 mt-12 lg:mt-0 relative">
          <div className="bg-gray-100 rounded-3xl p-8 border border-gray-200 relative z-10">
            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
              Live: 15,400명 공부 중
            </div>
            {/* Simulation UI */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b pb-4">
                <span className="font-bold text-gray-800">오늘의 승리 패턴</span>
                <span className="text-blue-600 font-bold">92% 달성</span>
              </div>
              <div className="space-y-3">
                {['수학 I : 지수함수 필수 예제 (20분)', '영어 : 빈칸 추론 오답 분석 (15분)', '휴식 : 뇌과학적 휴식 (10분)'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className={`w-5 h-5 ${i < 2 ? 'text-blue-500' : 'text-gray-300'}`} />
                    <span className={i < 2 ? 'text-gray-400 line-through' : 'text-gray-700'}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-blue-100 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">성적 향상률</p>
                <p className="text-lg font-bold text-gray-900">상위 12% 진입 🚀</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}