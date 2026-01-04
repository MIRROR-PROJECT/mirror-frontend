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
        // 컬럼명은 DB 스키마에 따라 다를 수 있으나, 일반적인 snake_case 가정
        const updateData: any = { phone_number: formData.phoneNumber };
        if (role === 'teacher') updateData.organization = formData.organization;
        if (role === 'parent') updateData.child_name = formData.childName;

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', session.user.id);

        if (error) console.warn("Info update warning:", error);
      }
    } catch (err) {
      console.error("Info update error:", err);
    }

    // 대시보드로 이동 (중앙 대시보드 라우트 사용 + Role 전달)
    router.push(`/dashboard?role=${role}`);
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