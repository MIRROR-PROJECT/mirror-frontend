"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, School, Users, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

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
    console.group(`🔄 [Role Selection] ${role}`);
    console.log(`역할 선택됨: ${role}`);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("❌ 인증 토큰이 없습니다.");
        alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        router.push("/login");
        return;
      }

      // API 호출 (명세서: POST /onboarding/role)
      console.log("📡 [API] 서버로 POST 요청 전송...");
      console.log("📡 [API] URL:", "https://mirror-backend-5j11.onrender.com/onboarding/role");
      console.log("📡 [API] Headers:", {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token.substring(0, 20)}...`
      });
      console.log("📡 [API] Body:", JSON.stringify({ role }));

      const res = await fetch("https://mirror-backend-5j11.onrender.com/onboarding/role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ role })
      });

      console.log(`📥 [API] 응답 상태 코드: ${res.status}`);
      console.log(`📥 [API] 응답 상태 텍스트: ${res.statusText}`);
      console.log(`📥 [API] 응답 헤더:`, Object.fromEntries(res.headers.entries()));

      // 응답 텍스트 먼저 가져오기 (JSON 파싱 실패 대비)
      const responseText = await res.text();
      console.log("📦 [Raw] 서버 응답 원본:", responseText);

      // JSON 파싱 시도
      let json: RoleResponse | any;
      try {
        json = JSON.parse(responseText);
        console.log("📦 [Parsed] 서버 응답 데이터:", json);
      } catch (parseError) {
        console.error("❌ [Parse Error] JSON 파싱 실패:", parseError);
        console.error("❌ [Parse Error] 응답이 JSON이 아닙니다. 원본:", responseText);
        alert(`서버 응답 오류: JSON 형식이 아닙니다.\n상태: ${res.status}\n응답: ${responseText.substring(0, 200)}`);
        return;
      }

      // 500 에러 상세 로깅
      if (res.status === 500) {
        console.error("❌❌❌ [500 Internal Server Error] ❌❌❌");
        console.error("서버 내부 오류 발생!");
        console.error("응답 데이터:", json);
        console.error("에러 메시지:", json.message || json.detail || "메시지 없음");
        alert(`서버 오류 (500)\n메시지: ${json.message || json.detail || "알 수 없는 오류"}\n\n콘솔을 확인해주세요.`);
        return;
      }

      // FastAPI 422 Validation Error 처리
      if (res.status === 422 && json.detail) {
        console.error("❌ [422] Validation Error:", json.detail);
        const errorMsg = Array.isArray(json.detail)
          ? json.detail.map((e: any) => `${e.loc?.join('.')}: ${e.msg}`).join(', ')
          : "요청 데이터 형식이 올바르지 않습니다.";
        alert(`입력값 오류: ${errorMsg}`);
        return;
      }

      // 에러 처리
      if (!json.success) {
        console.error(`❌ [${json.code}] ${json.message}`);
        alert(json.message || "역할 등록에 실패했습니다.");
        return;
      }

      // 성공 처리 (201 Created)
      if (json.success && json.data) {
        console.log(`✅ [Success] ${json.message}`);
        console.log(`📋 등록된 정보:`, json.data);

        // 역할에 따라 다음 페이지로 이동
        if (role === 'student') {
          // 학생 -> 바로 진단 검사로 이동
          router.push("/student/diagnosis");
        } else {
          // 선생님/학부모 -> 추가 정보 입력 페이지로 이동
          router.push(`/onboarding/info?role=${role}`);
        }
      }

    } catch (error) {
      console.error("❌ [Error] 네트워크 오류 또는 예외 발생:", error);
      alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      console.groupEnd();
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