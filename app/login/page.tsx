"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, BrainCircuit, Check, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  // 입력 데이터 상태
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 에러 메시지 상태 (이메일, 비밀번호 각각 관리)
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 유효성 검사 로직
  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    // 1. 이메일 검사
    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다.";
      isValid = false;
    }

    // 2. 비밀번호 검사
    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 입력 변경 핸들러 (입력 시 에러 초기화)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // 사용자가 다시 입력하기 시작하면 해당 필드의 에러를 지워줌 (UX 향상)
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사 실패 시 중단
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // ⏳ 로그인 처리 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log("로그인 시도:", { ...formData, rememberMe });
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50 font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. 좌측 브랜딩 영역 */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full blur-[80px]"></div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-lg">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-white">Mirror.</span>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="mb-4 inline-flex px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-blue-100 backdrop-blur-sm">
            Welcome Back
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
            성장의 시작,<br/>
            나를 마주하다.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            데이터로 기록되는 나의 학습 여정.<br/>
            오늘의 목표를 달성할 준비가 되셨나요?
          </p>
        </div>

        <div className="relative z-10 text-blue-200 text-sm font-medium">
          © 2024 Mirror Inc. All rights reserved.
        </div>
      </div>

      {/* 2. 우측 로그인 폼 */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[440px] space-y-8 bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              로그인
            </h2>
            <p className="text-gray-500 text-sm">
              아직 계정이 없으신가요?{" "}
              <Link href="/signup" className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                회원가입하기
              </Link>
            </p>
          </div>

          {/* noValidate를 추가하여 브라우저 기본 팝업 비활성화 */}
          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            
            <div className="space-y-5">
              
              {/* 이메일 입력 */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 pl-1">이메일</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 transition-colors duration-300 ${
                      errors.email ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-500"
                    }`} />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 outline-none font-medium transition-all duration-300
                      ${errors.email 
                        ? "border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10" 
                        : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      }
                    `}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {/* 커스텀 에러 메시지 */}
                {errors.email && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-red-500 animate-in slide-in-from-top-1 fade-in duration-200 pl-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* 비밀번호 입력 */}
              <div>
                <div className="flex items-center justify-between mb-2 pl-1">
                  <label className="block text-sm font-bold text-gray-700">비밀번호</label>
                  <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-500 hover:underline">
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 transition-colors duration-300 ${
                      errors.password ? "text-red-500" : "text-gray-400 group-focus-within:text-blue-500"
                    }`} />
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="8자 이상 입력"
                    className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 outline-none font-medium transition-all duration-300
                      ${errors.password 
                        ? "border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10" 
                        : "border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      }
                    `}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {/* 커스텀 에러 메시지 */}
                {errors.password && (
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-red-500 animate-in slide-in-from-top-1 fade-in duration-200 pl-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password}
                  </div>
                )}
              </div>
            </div>

            {/* 로그인 유지 체크박스 */}
            <div className="flex items-center pl-1 cursor-pointer" onClick={() => setRememberMe(!rememberMe)}>
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                rememberMe ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 hover:border-blue-500"
              }`}>
                {rememberMe && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="ml-2 text-sm text-gray-600 font-medium select-none">로그인 상태 유지</span>
            </div>

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-lg shadow-blue-600/20 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "로그인 중..." : "로그인하기"}
              {!isSubmitting && <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
            </button>
          </form>

          {/* 소셜 로그인 구분선 */}
          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">또는 소셜 계정으로 로그인</span>
            </div>
          </div>

          {/* 소셜 로그인 버튼 */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-white hover:border-gray-300 transition-all shadow-sm active:scale-[0.98]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 border border-[#FAE100] rounded-xl bg-[#FAE100] text-[#3c1e1e] font-bold hover:bg-[#FCE720] transition-all shadow-sm active:scale-[0.98]">
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                 <path d="M12 3C7.58 3 4 6.13 4 10C4 12.38 5.55 14.5 7.96 15.75L7.25 18.25C7.15 18.63 7.55 18.9 7.85 18.68L11.5 16.2C11.66 16.22 11.83 16.23 12 16.23C16.42 16.23 20 13.1 20 9.23C20 5.37 16.42 3 12 3Z"/>
               </svg>
              <span>Kakao</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}