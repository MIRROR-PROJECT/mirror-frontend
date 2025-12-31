"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ExtraInfoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "teacher"; // 쿼리파라미터에서 역할 가져오기

  const [formData, setFormData] = useState({
    phoneNumber: "",
    organization: "", // 학교/학원명 (선생님용)
    childName: ""     // 자녀 이름 (학부모용)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("추가 정보 제출:", formData);
    
    // API 전송 후 대시보드로 이동
    router.push(`/${role}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {role === 'teacher' ? '선생님 정보 입력' : '학부모 정보 입력'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 공통: 전화번호 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">휴대폰 번호</label>
            <input 
              type="tel" 
              placeholder="010-1234-5678"
              className="w-full px-4 py-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
            />
          </div>

          {/* 선생님일 때만 표시 */}
          {role === 'teacher' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">소속 (학교/학원)</label>
              <input 
                type="text" 
                placeholder="예: 미러 고등학교"
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setFormData({...formData, organization: e.target.value})}
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
                className="w-full px-4 py-3 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => setFormData({...formData, childName: e.target.value})}
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