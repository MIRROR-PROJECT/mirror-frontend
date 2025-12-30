"use client";

import { 
  Clock, Calendar, TrendingUp, Brain, 
  CheckCircle2, AlertCircle, ChevronRight, 
  Activity, MessageSquareQuote 
} from "lucide-react";

export default function ParentDashboard() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in bg-gray-50/50 min-h-screen">
      
      {/* 1. 헤더 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <span className="text-sm font-bold text-gray-500 mb-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> 2025년 12월 29일 리포트
          </span>
          <h1 className="text-2xl font-bold text-gray-900">
            안녕하세요, 민수 어머님! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            오늘 민수는 계획된 학습량의 <span className="text-blue-600 font-bold">92%</span>를 달성했습니다.
          </p>
        </div>
        <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-sm font-bold text-gray-700">현재 학습 중 (AI 튜터와 대화)</span>
        </div>
      </div>

      {/* 2. 메인 요약 카드 (히어로 섹션) - 배경 흰색, 글씨 검정색으로 변경 */}
      <div className="bg-white rounded-3xl p-6 shadow-lg relative overflow-hidden border border-gray-200">
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl shadow-inner">
                🧑‍🎓
              </div>
              <div>
                {/* 이름과 반 정보를 검정색 계열로 변경 */}
                <h2 className="text-2xl font-black text-gray-900">김민수 학생</h2>
                <p className="text-blue-600 font-bold text-sm mt-0.5">고2 수리논술 심화반 A</p>
              </div>
            </div>
            
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1 uppercase tracking-wide">
                  <Clock className="w-3 h-3" /> 이번 주 누적 학습
                </p>
                {/* 숫자 데이터 검정색으로 변경 */}
                <p className="text-3xl font-black text-gray-900">14<span className="text-lg font-bold text-gray-500 ml-1">시간</span> 30<span className="text-lg font-bold text-gray-500 ml-1">분</span></p>
              </div>
              
              {/* 구분선 색상 조정 */}
              <div className="w-px h-12 bg-gray-200"></div>
              
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1 uppercase tracking-wide">
                  <Activity className="w-3 h-3" /> 평균 집중도
                </p>
                <p className="text-3xl font-black text-gray-900">High <span className="text-sm font-bold text-green-500">▲</span></p>
              </div>
            </div>
          </div>

          {/* 출석 현황 미니 카드 - 스타일 조정 */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 min-w-[220px]">
             <p className="text-xs text-gray-500 mb-2 font-bold flex justify-between">
               이번 달 출석률
               <span className="text-green-600">Excellent</span>
             </p>
             <div className="flex justify-between items-end mb-3">
                <span className="text-3xl font-black text-gray-900">98%</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-bold">개근 유력</span>
             </div>
             <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-[98%] shadow-sm"></div>
             </div>
          </div>
        </div>
      </div>

      {/* 3. 상세 분석 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: 오늘의 학습 타임라인 */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            오늘의 학습 타임라인
          </h3>
          
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-6 py-3">
              
              {/* 타임라인 아이템 1 */}
              <div className="relative pl-12">
                <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-green-500 border-4 border-white shadow-sm"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded mb-1 inline-block">Current</span>
                    <h4 className="text-base font-bold text-gray-900">AI 튜터와 질의응답 중</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      '삼각함수의 합성' 관련 심화 문제를 질문하고 있습니다.
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-400">19:45 ~ 현재</span>
                </div>
              </div>

              {/* 타임라인 아이템 2 */}
              <div className="relative pl-12">
                <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow-sm"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h4 className="text-base font-bold text-gray-900">수학 과제 제출 완료</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      [필수] 지수로그 기출 20제 풀이 및 채점
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-400">18:30</span>
                </div>
              </div>

              {/* 타임라인 아이템 3 */}
              <div className="relative pl-12">
                <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-gray-300 border-4 border-white"></div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h4 className="text-base font-bold text-gray-600">학원 등원 및 출석 체크</h4>
                  </div>
                  <span className="text-sm font-bold text-gray-400">17:50</span>
                </div>
              </div>

            </div>
            
            <button className="w-full mt-4 py-3 bg-gray-50 text-gray-500 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors">
              더 많은 기록 보기
            </button>
          </div>
        </div>

        {/* Right: AI 분석 및 선생님 코멘트 */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            주간 AI 학습 분석
          </h3>

          {/* AI 강약점 분석 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
             <div className="mb-4">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Strong Point</p>
               <div className="flex items-center gap-2 text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-bold">함수의 극한 (상위 5%)</span>
               </div>
             </div>
             
             <div className="mb-4">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Weak Point</p>
               <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-bold">삼각함수 활용 (보충 필요)</span>
               </div>
             </div>
             
             <p className="text-xs text-gray-500 leading-relaxed">
               * 민수는 계산 속도는 빠르지만, 도형이 나오는 삼각함수 문제에서 오답률이 높습니다. 이번 주말 보충 과제로 해당 파트를 집중 케어할 예정입니다.
             </p>
          </div>

          {/* 선생님 코멘트 (Notice) */}
          <div className="bg-yellow-50 rounded-3xl border border-yellow-100 p-6 relative">
             <h4 className="font-bold text-gray-800 mb-2">👨‍🏫 담임 선생님 코멘트</h4>
             <p className="text-sm text-gray-700 leading-relaxed font-medium">
               "어머니, 민수가 요즘 수학에 자신감이 많이 붙었습니다. 특히 서술형 풀이 과정이 아주 깔끔해졌어요. 집에서도 칭찬 많이 부탁드립니다!"
             </p>
             <p className="text-xs text-gray-400 mt-3 text-right">2025.12.28 작성됨</p>
          </div>

        </div>
      </div>
    </div>
  );
}