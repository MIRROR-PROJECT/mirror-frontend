"use client";

import { useState } from "react";
import { 
  Sparkles, Printer, FileText, 
  Search, Calendar, CheckCircle2, 
  Brain, Clock, PenTool, MessageSquare,
  ChevronDown, BarChart, Users
} from "lucide-react";

// [Mock Data] 여러 반의 데이터 시뮬레이션
const CLASS_DATA = [
  {
    id: 1,
    name: "고2 수리논술 심화반 A",
    studentCount: 42,
    avgProgress: 78, // 반 평균 학습 완료율 (학생 개개인 달성률의 평균)
    briefing: {
      mood: "🔥 자습 열기 고조",
      moodDesc: "어제 밤 10시 이후 접속자가 30명 이상이었습니다.",
      weakness: "삼각함수 합성",
      weaknessRate: 65,
      careAction: "수업 도입부 '합성 공식' 10분 복습"
    },
    careList: [
      { name: "박민수", issue: "성적 급락", urgent: true },
      { name: "최유리", issue: "진로 상담 요청", urgent: false }
    ]
  },
  {
    id: 2,
    name: "고1 수학 개념완성반 B",
    studentCount: 35,
    avgProgress: 45, // 학습률이 저조한 반 예시
    briefing: {
      mood: "📉 학습량 부족",
      moodDesc: "전체적으로 완강률이 떨어지고 있습니다. 독려가 필요합니다.",
      weakness: "나머지정리",
      weaknessRate: 52,
      careAction: "오답 노트 숙제 검사 꼼꼼히 진행"
    },
    careList: [
      { name: "김철수", issue: "3일 연속 미접속", urgent: true }
    ]
  }
];

export default function TeacherWorkspace() {
  // 현재 선택된 반 (기본값: 첫 번째 반)
  const [selectedClassId, setSelectedClassId] = useState(1);
  
  // 선택된 반의 데이터 찾기
  const currentClass = CLASS_DATA.find(c => c.id === selectedClassId) || CLASS_DATA[0];

  return (
    <div className="p-8 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in bg-gray-50/50 min-h-screen">
      
      {/* 1. 상단 헤더 & 반 선택기 */}
      <div className="flex flex-col md:flex-row justify-between items-end pb-2 gap-4">
        <div className="w-full md:w-auto">
          <span className="text-sm font-bold text-blue-600 mb-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> 2025년 12월 29일 (월)
          </span>
          
          {/* 반 선택 Dropdown UI */}
          <div className="relative group inline-block">
            <button className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-blue-700 transition-colors">
              {currentClass.name}
              <ChevronDown className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
            </button>
            
            {/* 드롭다운 메뉴 (Hover시 표시) */}
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2">
                <p className="text-xs font-bold text-gray-400 px-2 py-2">내 클래스 목록</p>
                {CLASS_DATA.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center
                      ${selectedClassId === cls.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}
                    `}
                  >
                    {cls.name}
                    {selectedClassId === cls.id && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 우측 상단 지표 (출석 삭제 -> 학습 완료율 강조) */}
        <div className="flex gap-2">
           <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
             <div className="flex flex-col items-end leading-tight">
               <span className="text-[10px] text-gray-500 font-bold">총 수강생</span>
               <span className="text-sm font-bold text-gray-900">{currentClass.studentCount}명</span>
             </div>
             <div className="w-px h-6 bg-gray-200"></div>
             <div className="flex flex-col items-end leading-tight">
               <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                 평균 학습 완료율 <Brain className="w-3 h-3 text-blue-500"/>
               </span>
               <span className={`text-lg font-extrabold ${currentClass.avgProgress >= 70 ? 'text-blue-600' : 'text-orange-500'}`}>
                 {currentClass.avgProgress}%
               </span>
             </div>
           </div>
        </div>
      </div>

      {/* 2. 데일리 학습 브리핑 (선택된 반 데이터 연동) */}
      <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden transition-all">
        <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
          <div>
             <h2 className="text-xl font-bold flex items-center gap-2">
               <BarChart className="w-6 h-6 text-yellow-400" />
               Daily Class Briefing
             </h2>
             <p className="text-gray-400 text-sm mt-1">
               <span className="text-white font-bold">{currentClass.name}</span> 학생들의 어제 활동 분석입니다.
             </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* A. 학습 활동 요약 */}
          <div className="space-y-4 border-r border-gray-100 pr-0 md:pr-8">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> 어제 학습 요약
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                 <span className="text-lg">{currentClass.avgProgress >= 70 ? '🔥' : '💧'}</span>
                 <div>
                   <p className="text-sm font-bold text-gray-900">{currentClass.briefing.mood}</p>
                   <p className="text-xs text-gray-600 leading-relaxed">
                     {currentClass.briefing.moodDesc}
                   </p>
                 </div>
              </li>
              <li className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
                 <span className="text-lg">📉</span>
                 <div>
                   <p className="text-sm font-bold text-gray-900">최대 취약점: {currentClass.briefing.weakness}</p>
                   <p className="text-xs text-gray-600 leading-relaxed">
                     해당 유형 오답률이 <span className="text-red-500 font-bold">{currentClass.briefing.weaknessRate}%</span>입니다. 집중 케어가 필요합니다.
                   </p>
                 </div>
              </li>
            </ul>
          </div>

          {/* B. 오늘의 케어 가이드 */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> 오늘의 추천 액션
            </h3>
            <div className="space-y-2">
               <div className="flex items-center gap-3 p-3 border border-blue-100 bg-blue-50/50 rounded-xl">
                 <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                 <span className="text-sm font-bold text-gray-700">{currentClass.briefing.careAction}</span>
               </div>
               {currentClass.careList.length > 0 && (
                 <div className="flex items-center gap-3 p-3 border border-red-100 bg-red-50/50 rounded-xl">
                   <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300" />
                   <span className="text-sm font-bold text-gray-700">
                     {currentClass.careList[0].name} 학생 면담 ({currentClass.careList[0].issue})
                   </span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* 하단 2단 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. AI 오답 클리닉 (취약점 기반) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" /> AI 오답 클리닉
          </h2>
          
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
             <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
             
             <div className="relative z-10">
               <div className="flex justify-between items-start mb-4">
                 <div>
                   <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded backdrop-blur">
                     {currentClass.name} 전용
                   </span>
                   <h3 className="text-2xl font-bold mt-2">맞춤형 보충 문제지 생성</h3>
                 </div>
                 <Printer className="w-8 h-8 text-purple-200 opacity-80" />
               </div>
               
               <p className="text-purple-100 text-sm mb-6 max-w-md leading-relaxed">
                 <span className="font-bold text-white underline">{currentClass.briefing.weakness}</span> 등 
                 이번 주 취약 유형을 모아 보충 자료를 생성합니다.
               </p>

               <div className="flex gap-3">
                 <button className="bg-white text-purple-700 px-5 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-purple-50 transition-all flex items-center gap-2">
                   <Sparkles className="w-4 h-4" />
                   문제지 자동 생성
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* 4. 학생 케어 CRM (반별 필터링됨) */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-pink-500" /> 케어 필요 학생 ({currentClass.careList.length})
          </h2>
          
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm h-full flex flex-col">
             {currentClass.careList.length > 0 ? (
               <div className="space-y-2 mb-4">
                 {currentClass.careList.map((student, idx) => (
                   <div key={idx} className={`p-3 border rounded-xl flex gap-3 items-start ${student.urgent ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${student.urgent ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{student.issue}</p>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="text-center py-8 text-gray-400 text-sm">
                 오늘의 긴급 케어 대상이 없습니다. 🎉
               </div>
             )}

             <button className="mt-auto w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors">
                <PenTool className="w-4 h-4" />
                상담 일지 작성
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}