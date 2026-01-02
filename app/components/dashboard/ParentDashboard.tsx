"use client";

import { useState, useEffect } from "react";
import { 
  Clock, Calendar, TrendingUp, Brain, 
  CheckCircle2, AlertCircle, ChevronRight, 
  Activity, MessageSquareQuote, User, School
} from "lucide-react";

// --- 타입 정의 (데이터 구조 명세) ---
interface TimelineItem {
  id: number;
  title: string;
  desc?: string;
  time: string;
  status: "current" | "completed" | "upcoming";
  color: string;
}

interface UserData {
  name: string;
  role: string;
  grade: string;
  className: string;
  attendanceRate: number;
  studyTime: { hours: number; minutes: number };
  focusLevel: "High" | "Medium" | "Low";
}

// --- 더미 데이터 (실제 API 연동 시 교체) ---
const TODAY_TIMELINE: TimelineItem[] = [
  {
    id: 1,
    title: "AI 튜터와 질의응답 중",
    desc: "'삼각함수의 합성' 관련 심화 문제를 질문하고 있습니다.",
    time: "19:45 ~ 현재",
    status: "current",
    color: "bg-green-500"
  },
  {
    id: 2,
    title: "수학 과제 제출 완료",
    desc: "[필수] 지수로그 기출 20제 풀이 및 채점",
    time: "18:30",
    status: "completed",
    color: "bg-blue-600"
  },
  {
    id: 3,
    title: "학원 등원 및 출석 체크",
    time: "17:50",
    status: "completed",
    color: "bg-gray-400"
  }
];

export default function ParentDashboard({ user }: { user: any }) {
  // 실제 user prop이 없을 경우를 대비한 기본값 병합
  const studentInfo: UserData = {
    name: user?.name || "김민수",
    role: "student",
    grade: "고2",
    className: "수리논술 심화반 A",
    attendanceRate: 98,
    studyTime: { hours: 14, minutes: 30 },
    focusLevel: "High"
  };

  const [currentDate, setCurrentDate] = useState("");

  // 클라이언트 사이드에서만 날짜 계산 (Hydration Error 방지)
  useEffect(() => {
    const now = new Date();
    const formatted = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 리포트`;
    setCurrentDate(formatted);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in bg-gray-50/50 min-h-screen">
      
      {/* 1. 헤더 영역 */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <span className="text-sm font-bold text-gray-500 mb-1 flex items-center gap-1 bg-white px-3 py-1 rounded-full w-fit border border-gray-200 shadow-sm">
            <Calendar className="w-4 h-4 text-blue-500" /> 
            {currentDate || "날짜 불러오는 중..."}
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">
            안녕하세요, {studentInfo.name} 부모님! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            오늘 {studentInfo.name} 학생은 계획된 학습량의 <span className="text-blue-600 font-black">92%</span>를 달성했습니다.
          </p>
        </div>
        
        {/* 실시간 상태 뱃지 */}
        <div className="bg-white border border-blue-100 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
           <div className="relative">
             <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
             <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-green-500 animate-ping opacity-75"></div>
           </div>
           <div>
             <p className="text-xs text-gray-400 font-bold">Current Status</p>
             <span className="text-sm font-bold text-gray-800">학습 진행 중 (AI 튜터)</span>
           </div>
        </div>
      </div>

      {/* 2. 메인 요약 카드 (히어로 섹션) */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-100/50 border border-gray-100 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
          
          {/* 학생 프로필 */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl shadow-lg ring-4 ring-white">
              🧑‍🎓
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-black text-gray-900">{studentInfo.name} 학생</h2>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-bold">{studentInfo.grade}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 font-medium">
                <School className="w-4 h-4" />
                {studentInfo.className}
              </div>
            </div>
          </div>
          
          {/* 주요 지표 3가지 */}
          <div className="flex flex-wrap gap-8 md:gap-12 w-full xl:w-auto bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            {/* 시간 */}
            <div className="flex-1 min-w-[140px]">
              <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Clock className="w-3 h-3" /> 이번 주 누적 학습
              </p>
              <p className="text-3xl font-black text-gray-900">
                {studentInfo.studyTime.hours}<span className="text-lg font-bold text-gray-400 ml-1">시간</span> 
                {' '}
                {studentInfo.studyTime.minutes}<span className="text-lg font-bold text-gray-400 ml-1">분</span>
              </p>
            </div>
            
            {/* 구분선 (PC에서만) */}
            <div className="hidden md:block w-px h-12 bg-gray-200 self-center"></div>
            
            {/* 집중도 */}
            <div className="flex-1 min-w-[120px]">
              <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Activity className="w-3 h-3" /> 평균 집중도
              </p>
              <p className="text-3xl font-black text-gray-900 flex items-center gap-2">
                {studentInfo.focusLevel} 
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">▲ 상승세</span>
              </p>
            </div>

            {/* 구분선 (PC에서만) */}
            <div className="hidden md:block w-px h-12 bg-gray-200 self-center"></div>

            {/* 출석률 */}
            <div className="flex-1 min-w-[140px]">
               <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1 uppercase tracking-wide">
                 <CheckCircle2 className="w-3 h-3" /> 이번 달 출석률
               </p>
               <div className="flex items-end gap-2">
                 <span className="text-3xl font-black text-gray-900">{studentInfo.attendanceRate}%</span>
               </div>
               <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                 <div className="bg-green-500 h-full rounded-full" style={{ width: `${studentInfo.attendanceRate}%` }}></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 상세 분석 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: 오늘의 학습 타임라인 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              오늘의 학습 타임라인
            </h3>
            <span className="text-xs font-medium text-gray-400">실시간 업데이트됨</span>
          </div>
          
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm h-full">
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 py-2">
              
              {TODAY_TIMELINE.map((item) => (
                <div key={item.id} className="relative pl-10 group">
                  {/* 타임라인 점 */}
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-transform group-hover:scale-125 ${item.color}`}></div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      {item.status === 'current' && (
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded mb-1.5 inline-block border border-green-100">
                          NOW PLAYING
                        </span>
                      )}
                      <h4 className={`text-base font-bold ${item.status === 'current' ? 'text-gray-900' : 'text-gray-700'}`}>
                        {item.title}
                      </h4>
                      {item.desc && (
                        <p className="text-sm text-gray-500 mt-1 bg-gray-50 p-2 rounded-lg inline-block">
                          {item.desc}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-bold text-gray-400 font-mono whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}

            </div>
            
            <button className="w-full mt-8 py-3 bg-white border border-gray-200 text-gray-500 text-sm font-bold rounded-xl hover:bg-gray-50 hover:text-gray-800 transition-all flex items-center justify-center gap-1">
              더 많은 기록 보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: AI 분석 및 선생님 코멘트 */}
        <div className="space-y-6">
          
          {/* 1. AI 강약점 분석 */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
                <Brain className="w-5 h-5 text-purple-600" />
                주간 AI 학습 분석
             </h3>

             <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Strong Point</span>
                    <span className="text-xs text-gray-400">상위 5%</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                     <div className="bg-white p-2 rounded-lg shadow-sm">
                       <TrendingUp className="w-5 h-5 text-blue-500" />
                     </div>
                     <span className="text-sm font-bold text-gray-800">함수의 극한</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">Weak Point</span>
                    <span className="text-xs text-gray-400">보충 필요</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                     <div className="bg-white p-2 rounded-lg shadow-sm">
                       <AlertCircle className="w-5 h-5 text-red-500" />
                     </div>
                     <span className="text-sm font-bold text-gray-800">삼각함수 활용</span>
                  </div>
                </div>
             </div>
             
             <div className="mt-5 pt-5 border-t border-gray-100">
               <p className="text-xs text-gray-500 leading-relaxed">
                 <span className="font-bold text-purple-600">AI Insight:</span> 민수는 계산 속도는 빠르지만, 도형이 나오는 삼각함수 문제에서 오답률이 높습니다. 이번 주말 보충 과제로 해당 파트를 집중 케어할 예정입니다.
               </p>
             </div>
          </div>

          {/* 2. 선생님 코멘트 (Notice) */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl border border-yellow-100 p-6 relative">
             <div className="absolute top-4 right-4 text-yellow-300 opacity-20">
               <MessageSquareQuote className="w-16 h-16" />
             </div>
             
             <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
               👨‍🏫 담임 선생님 코멘트
             </h4>
             
             <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm">
               <p className="text-sm text-gray-700 leading-relaxed font-medium">
                 "어머니, 민수가 요즘 수학에 자신감이 많이 붙었습니다. 특히 서술형 풀이 과정이 아주 깔끔해졌어요. 집에서도 칭찬 많이 부탁드립니다!"
               </p>
             </div>
             <p className="text-xs text-gray-400 mt-3 text-right font-medium">2025.12.28 작성됨</p>
          </div>

        </div>
      </div>
    </div>
  );
}