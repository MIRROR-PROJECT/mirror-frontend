// src/components/LandingPage.tsx (또는 app/components/LandingPage.tsx)
"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle, TrendingUp, Sparkles, Brain, Target } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function LandingPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // 로그인 안 된 사람만 이 버튼을 누르게 됨 (로그인 된 사람은 이미 납치당함)
  const handleStartClick = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar는 layout.tsx에서 제어합니다 */}

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 lg:flex lg:items-center lg:gap-12">
        {/* Left: Copy */}
        <div className="lg:w-1/2 space-y-4 md:space-y-8">
          <div className="inline-block bg-blue-50 text-blue-700 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-semibold">
            {t('landing.cases')}
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
            {t('landing.hero1')}<br />
            {t('landing.hero2')}<br />
            <span className="text-blue-600">{t('landing.hero3')}<br />{t('landing.hero4')}</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-600">
            {t('landing.subtitle1')}<br />
            {t('landing.subtitle2')}
          </p>

          <div className="flex gap-3 md:gap-4">
            <button
              onClick={handleStartClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base lg:text-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-blue-200"
            >
              {t('landing.startButton')}
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
          <p className="text-xs md:text-sm text-red-500 font-medium">
            {t('landing.warning')}
          </p>
        </div>

        {/* Right: Visual Concept */}
        <div className="lg:w-1/2 mt-8 md:mt-12 lg:mt-0 relative">
          <div className="bg-gray-100 rounded-2xl md:rounded-3xl p-4 md:p-8 border border-gray-200 relative z-10">
            <div className="absolute top-3 right-3 md:top-4 md:right-4 bg-green-500 text-white text-[10px] md:text-xs px-2 py-1 rounded-full animate-pulse">
              {t('landing.liveUsers')}
            </div>
            {/* Simulation UI */}
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 space-y-3 md:space-y-4">
              <div className="flex justify-between items-center border-b pb-3 md:pb-4">
                <span className="font-bold text-sm md:text-base text-gray-800">{t('landing.todayPattern')}</span>
                <span className="text-blue-600 font-bold text-sm md:text-base">{t('landing.achievement')}</span>
              </div>
              <div className="space-y-2 md:space-y-3">
                {[t('landing.task1'), t('landing.task2'), t('landing.task3')].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 md:gap-3">
                    <CheckCircle className={`w-4 h-4 md:w-5 md:h-5 shrink-0 ${i < 2 ? 'text-blue-500' : 'text-gray-300'}`} />
                    <span className={`text-xs md:text-sm ${i < 2 ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-white p-3 md:p-4 rounded-xl shadow-xl border border-blue-100 flex items-center gap-2 md:gap-3">
              <div className="bg-blue-100 p-1.5 md:p-2 rounded-lg">
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-gray-500">{t('landing.gradeImprovement')}</p>
                <p className="text-sm md:text-lg font-bold text-gray-900">{t('landing.topPercentile')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
