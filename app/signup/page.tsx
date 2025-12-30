"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Check, GraduationCap, School, Users, ArrowLeft } from "lucide-react";

type Role = "student" | "teacher" | "parent";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    console.log("회원가입 시도:", { ...formData, role });
    
    // ✅ [수정됨] 역할별 라우팅 분기 처리
    if (role === 'student') {
        // 학생은 학습 진단 페이지로 이동
        router.push("/student/diagnosis");
    } else {
        // 선생님(teacher)과 학부모(parent)는 각자의 대시보드로 바로 이동
        // 예: /teacher/dashboard 또는 /parent/dashboard
        router.push(`/${role}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      
      {/* 1. 좌측 브랜딩 영역 (PC에서만 보임 - 너비 50% 고정) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-center px-12 xl:px-24 relative overflow-hidden">
        {/* 배경 데코레이션 */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600 rounded-full blur-3xl opacity-20 transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10 space-y-8">
          <div>
            <span className="bg-blue-600/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
              Smart Learning Partner
            </span>
            <h2 className="text-5xl font-extrabold mt-4 mb-6 leading-tight">
              <span className="text-blue-500">Mirror</span>와 함께<br />
              성장의 한계를<br />넘어보세요.
            </h2>
            <p className="text-gray-400 text-lg">
              단순한 문제 풀이가 아닙니다.<br/>
              나의 학습 패턴을 분석하고 최적의 경로를 제안합니다.
            </p>
          </div>

          <ul className="space-y-5">
            {[
              "AI 기반 정밀 학습 진단",
              "실시간 성취도 대시보드",
              "선생님/학부모 연동 리포트"
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-4 text-lg text-gray-300">
                <div className="bg-gray-800 p-2 rounded-full border border-gray-700">
                  <Check className="w-5 h-5 text-blue-400" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 2. 우측 회원가입 폼 영역 (반응형 - 모바일 100%, PC 50%) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 xl:px-24 bg-white overflow-y-auto">
        <div className="w-full max-w-[440px] space-y-8">
          
          {/* 헤더 섹션 */}
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-1" /> 메인으로 돌아가기
            </Link>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">회원가입</h2>
            <p className="mt-2 text-gray-500 text-sm">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                로그인하기
              </Link>
            </p>
          </div>

          {/* 역할 선택 (디자인 개선) */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 block">가입 유형 선택</label>
            <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "student", label: "학생", icon: GraduationCap },
                  { id: "teacher", label: "선생님", icon: School },
                  { id: "parent", label: "학부모", icon: Users }
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = role === type.id;
                  return (
                    <button 
                      key={type.id}
                      type="button"
                      onClick={() => setRole(type.id as Role)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 h-24 rounded-xl border-2 transition-all duration-200 ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm ring-1 ring-blue-600 ring-offset-2" 
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="text-sm font-bold">{type.label}</span>
                    </button>
                  )
                })}
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">이름</label>
                <div className="relative group">
                  <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    required
                    placeholder="홍길동"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">이메일</label>
                <div className="relative group">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    required
                    placeholder="example@mirror.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">비밀번호</label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="8자 이상 입력해주세요"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">비밀번호 확인</label>
                <div className="relative group">
                  <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    required
                    placeholder="비밀번호를 한 번 더 입력해주세요"
                    className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border focus:bg-white focus:ring-4 outline-none transition-all placeholder:text-gray-400 font-medium ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' 
                      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/10'
                    }`}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1 font-medium ml-1">비밀번호가 일치하지 않습니다.</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg hover:shadow-blue-500/30 mt-6"
            >
              회원가입 완료
            </button>
          </form>
          
          <p className="text-xs text-center text-gray-400 leading-relaxed">
            가입 시 Mirror의 <Link href="#" className="underline hover:text-gray-600">이용약관</Link> 및 <Link href="#" className="underline hover:text-gray-600">개인정보처리방침</Link>에<br/>
            동의하는 것으로 간주합니다.
          </p>
        </div>
      </div>
    </div>
  );
}