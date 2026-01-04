"use client";

import { Suspense } from 'react';
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { supabase } from "../../lib/supabase";

// 1. 알맹이 컴포넌트 (이름을 ExtraInfoPage -> InfoContent로 변경)
// export default를 뺐습니다.
function InfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "teacher";

  const [formData, setFormData] = useState({
    phoneNumber: "",
    organization: "",
    childName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("추가 정보 제출:", formData);

    // API 전송: 추가 정보 업데이트
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // 1. Supabase users 테이블 업데이트 (기본 정보 + Role)
        // [Fix] 'organization', 'child_name' 컬럼이 Supabase에 없다면 에러가 발생하므로,
        // 오직 phone_number와 role만 업데이트합니다.
        const updateData: any = { phone_number: formData.phoneNumber };

        // [Fix] Role 정보도 함께 저장 (대문자로 표준화) -> RLS 문제로 백엔드 API 사용 권장
        // if (role) updateData.role = role.toUpperCase();

        // (주의) 아래 필드들이 Supabase 'users' 테이블에 실제로 존재하는지 확인 필요
        // 존재하지 않아서 400 에러가 뜬다면, 백엔드 API로만 전송해야 합니다.
        // 현재 에러(Could not find the 'organization' column)가 발생하므로 제거합니다.
        // if (role === 'teacher') updateData.organization = formData.organization;
        // if (role === 'parent') updateData.child_name = formData.childName;

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', session.user.id);

        if (error) console.warn("Info update warning:", error);

        // [Fix] 백엔드 DB에 유저가 없을 수 있으므로 동기화(Sync) API를 먼저 호출합니다.
        try {
          console.log("🔄 [Backend Sync] 프로필 생성 전 유저 동기화 시도...");
          const syncRes = await fetch("https://mirror-backend-5j11.onrender.com/auth/sync-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email
            })
          });

          if (syncRes.ok) {
            console.log("✅ [Backend Sync] 유저 동기화 성공");
          } else {
            console.warn("⚠️ [Backend Sync] 유저 동기화 응답:", await syncRes.text());
          }

          // [Fix] Role 설정을 위한 API 호출 (Role Update RLS 우회)
          if (role) {
            console.log(`🔄 [Role Setup] Role 설정 API 호출: ${role}`);
            const roleRes = await fetch("https://mirror-backend-5j11.onrender.com/onboarding/role", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              },
              body: JSON.stringify({ role: role.toUpperCase() })
            });

            if (roleRes.ok) {
              console.log("✅ [Role Setup] Role 설정 성공");
            } else {
              console.warn("⚠️ [Role Setup] Role 설정 실패:", await roleRes.text());
            }
          }

        } catch (syncError) {
          console.error("❌ [Backend Sync/Role] 호출 중 에러:", syncError);
        }

        // 2. [NEW] 선생님 프로필 API 호출 (명세서 반영)
        if (role === 'teacher') {
          try {
            const payload = {
              phone_number: formData.phoneNumber,
              academy_name: formData.organization
            };
            console.log("📤 선생님 프로필 요청 데이터:", payload);

            const apiRes = await fetch("https://mirror-backend-5j11.onrender.com/teacher/profile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              },
              body: JSON.stringify(payload)
            });

            const apiData = await apiRes.json();

            if (apiRes.ok && apiData.success) {
              console.log("✅ 선생님 프로필 등록 성공:", apiData);
              // [Fix] 성공 시에만 대시보드 이동 (선생님)
              alert("가입이 완료되었습니다! 대시보드로 이동합니다.");
              router.push(`/dashboard?role=${role}`);
            } else {
              console.error("❌ 선생님 프로필 등록 실패:", apiData);
              // [Fix] 에러 상세 내용을 보여주기 위해 JSON.stringify 사용
              const errorMsg = apiData.detail
                ? typeof apiData.detail === 'string' ? apiData.detail : JSON.stringify(apiData.detail, null, 2)
                : apiData.message || "알 수 없는 오류";

              alert(`선생님 프로필 등록 실패:\n${errorMsg}`);
            }
          } catch (apiError) {
            console.error("❌ 선생님 프로필 API 호출 에러:", apiError);
            alert("서버 연결 실패. 잠시 후 다시 시도해주세요.");
          }
        }

        // 3. [NEW] 학부모 프로필 API 호출 (명세서 반영)
        if (role === 'parent') {
          try {
            const apiRes = await fetch("https://mirror-backend-5j11.onrender.com/parents/profile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.access_token}`
              },
              body: JSON.stringify({
                child_name: formData.childName,
                parent_phone: formData.phoneNumber
              })
            });

            const apiData = await apiRes.json();

            if (apiRes.ok && apiData.success) {
              console.log("✅ 학부모 프로필 등록 성공:", apiData);
              // [Fix] 성공 시에만 대시보드 이동 (학부모)
              alert("가입이 완료되었습니다! 대시보드로 이동합니다.");
              router.push(`/dashboard?role=${role}`);
            } else {
              console.error("❌ 학부모 프로필 등록 실패:", apiData);
              alert("학부모 프로필 등록 중 문제가 발생했습니다.");
            }
          } catch (apiError) {
            console.error("❌ 학부모 프로필 API 호출 에러:", apiError);
            alert("서버 연결 실패. 잠시 후 다시 시도해주세요.");
          }
        }
      }
    } catch (err) {
      console.error("Info update error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-black mb-6">
          {role === 'teacher' ? '선생님 정보 입력' : '학부모 정보 입력'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 공통: 전화번호 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">휴대폰 번호</label>
            <input
              type="tel"
              placeholder="010-1234-5678"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium placeholder-gray-400"
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          {/* 선생님일 때만 표시 */}
          {role === 'teacher' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">학원명</label>
              <input
                type="text"
                placeholder="예: 미러 학원"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium placeholder-gray-400"
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>
          )}

          {/* 학부모일 때만 표시 */}
          {role === 'parent' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">자녀 이름</label>
              <input
                type="text"
                placeholder="자녀 이름을 입력하세요"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-medium placeholder-gray-400"
                onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">* 추후 학생 계정과 연동할 수 있습니다.</p>
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors mt-4">
            가입 완료 및 시작하기
          </button>
        </form>
      </div>
    </div>
  );
}

// 2. 껍데기 컴포넌트 (새로 만듦)
// Suspense로 감싸서 내보내는 역할만 합니다.
export default function ExtraInfoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <InfoContent />
    </Suspense>
  );
}