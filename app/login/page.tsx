"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase"; 
import { ArrowLeft, Sparkles, Target, TrendingUp, Brain } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      
    } catch (error) {
      console.error("로그인 에러:", error);
      alert("로그인 중 문제가 발생했습니다.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-white">
      {/* 좌측 브랜딩 영역 - 콘텐츠 추가 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 text-white flex-col justify-between px-16 xl:px-20 py-16 relative overflow-hidden">
        {/* 배경 데코레이션 */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full blur-3xl opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-3xl opacity-20 transform -translate-x-1/3 translate-y-1/3"></div>

        {/* 상단: 로고 & 헤드라인 */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Mirror</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl xl:text-6xl font-extrabold leading-tight">
              AI가 만드는<br />
              <span className="text-blue-500">맞춤형 학습</span>
            </h1>
            <p className="text-gray-400 text-lg xl:text-xl leading-relaxed max-w-md">
              당신의 학습 습관을 분석하고, 최적화된 커리큘럼을 제공합니다.
            </p>
          </div>
        </div>

        {/* 중단: 주요 기능 카드 */}
        <div className="relative z-10 space-y-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">AI 진단 시스템</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  학습 성향과 풀이 습관을 분석해 약점을 정확히 파악합니다
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">개인 맞춤 커리큘럼</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  당신의 학년, 과목, 가용 시간에 딱 맞는 학습 계획을 설계합니다
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">실시간 성과 추적</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  학습 데이터를 기반으로 성장 과정을 시각화하고 동기부여를 제공합니다
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 통계/Social Proof */}
        <div className="relative z-10 flex items-center gap-8 text-sm">
          <div>
            <div className="text-3xl font-bold text-white">1,200+</div>
            <div className="text-gray-400 mt-1">활성 사용자</div>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div>
            <div className="text-3xl font-bold text-white">95%</div>
            <div className="text-gray-400 mt-1">성적 향상률</div>
          </div>
          <div className="w-px h-12 bg-white/10"></div>
          <div>
            <div className="text-3xl font-bold text-white">4.8/5</div>
            <div className="text-gray-400 mt-1">평균 만족도</div>
          </div>
        </div>
      </div>

      {/* 우측 로그인 영역 */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-8 lg:px-12 py-8 bg-white">
        <div className="w-full max-w-md space-y-10">
          {/* 헤더 섹션 */}
          <div className="text-center space-y-4">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
              메인으로 돌아가기
            </Link>
            
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                시작하기
              </h2>
              <p className="text-gray-500 text-base">
                지금 바로 당신만의 학습 여정을 시작하세요
              </p>
            </div>
          </div>

          {/* 구글 로그인 버튼 */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold text-base hover:bg-gray-50 hover:border-gray-400 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{loading ? "Google 연결 중..." : "Google로 계속하기"}</span>
          </button>

          {/* 안내 문구 */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 leading-relaxed">
              계속 진행하면 Mirror의 <Link href="/terms" className="underline hover:text-gray-600">이용약관</Link> 및 <Link href="/privacy" className="underline hover:text-gray-600">개인정보처리방침</Link>에 동의하게 됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
