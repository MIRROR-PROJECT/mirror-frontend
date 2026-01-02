"use client";

import { useState, useEffect } from "react";
import { useStudy } from "../../context/StudyContext"; 
import { 
  CheckCircle2, TrendingUp, Calendar, 
  Flame, Zap, BrainCircuit, Target,
  ChevronRight, Clock, MessageCircle, BookOpen, History,
  Settings, Lock, Edit3
} from "lucide-react";
import Link from "next/link";

// --- 타입 정의 ---
interface UserProps {
  id: string;
  name: string;
  role: string;
  streak?: number;
}

interface WeaknessItem {
  label: string;
  score: number;
  color: string;
}

interface TimeSlot {
  hour: number;
  type: "study" | "school" | "academy" | "rest" | "sleep";
  label: string;
  taskId?: number;   // 매핑된 태스크 ID (study인 경우)
  isDone?: boolean;  // 태스크 완료 여부
  isLocked?: boolean; // 클릭 불가능 여부
}

// 더미 데이터: 과목별 취약점
const WEAKNESS_DATA: { [key: string]: WeaknessItem[] } = {
  "수학": [
    { label: "지수함수의 활용", score: 45, color: "bg-red-500" },
    { label: "로그의 성질", score: 72, color: "bg-yellow-400" },
    { label: "삼각함수 그래프", score: 88, color: "bg-green-500" },
  ],
  "영어": [
    { label: "빈칸 추론", score: 50, color: "bg-red-500" },
    { label: "순서 배열", score: 65, color: "bg-yellow-400" },
    { label: "도표 분석", score: 95, color: "bg-green-500" },
  ],
  "과학": [
    { label: "역학적 에너지", score: 30, color: "bg-red-500" },
    { label: "산화와 환원", score: 60, color: "bg-yellow-400" },
  ]
};

export default function StudentDashboard({ user }: { user: UserProps }) {
  const { tasks, schedule, toggleTask } = useStudy();
  
  const [selectedSubject, setSelectedSubject] = useState("수학");
  const [mounted, setMounted] = useState(false);
  const [todayMinutes, setTodayMinutes] = useState(0);
  
  // 시간표 렌더링을 위한 상태
  const [timeline, setTimeline] = useState<TimeSlot[]>([]);

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    
    // 1. 요일 인덱스 보정 (월:0 ~ 일:6)
    // today.getDay()는 일:0, 월:1 ... 토:6
    const jsDay = today.getDay(); 
    const scheduleDayKey = jsDay === 0 ? 6 : jsDay - 1; // 월(0) ~ 일(6) 형태로 변환

    // 2. 가용 시간 계산 및 타임라인 생성
    let slotsCount = 0;
    const tempTimeline: TimeSlot[] = [];
    const currentTasks = tasks || []; // Context에서 가져온 할 일 목록
    let taskIndex = 0;

    // 오전 9시부터 밤 23시까지 표시 (범위 조절 가능)
    const startHour = 9;
    const endHour = 23;

    for (let h = startHour; h <= endHour; h++) {
      const key = `${scheduleDayKey}-${h}`; // 예: "0-9" (월요일 9시)
      
      // schedule 데이터가 없으면 기본값 'rest'
      // schedule 값 예시: "school", "academy", "study", "rest" 등
      const activityType = schedule ? (schedule[key] as string) || "rest" : "rest";
      
      let slot: TimeSlot = {
        hour: h,
        type: "rest",
        label: "휴식",
        isLocked: true
      };

      if (activityType === "school") {
        slot = { ...slot, type: "school", label: "학교 수업", isLocked: true };
      } else if (activityType === "academy") {
        slot = { ...slot, type: "academy", label: "학원", isLocked: true };
      } else if (activityType === "sleep") {
        slot = { ...slot, type: "sleep", label: "수면", isLocked: true };
      } else if (activityType === "study") {
        slotsCount++;
        // "study" 슬롯에 tasks를 순서대로 매핑
        const assignedTask = currentTasks[taskIndex];
        
        slot = {
          hour: h,
          type: "study",
          label: assignedTask ? assignedTask.title : "자율 학습", // 할 일이 부족하면 자율 학습
          taskId: assignedTask ? assignedTask.id : undefined,
          isDone: assignedTask ? assignedTask.done : false,
          isLocked: false // 클릭 가능!
        };

        // 다음 할 일로 인덱스 이동 (할 일이 있으면)
        if (assignedTask) taskIndex++;
      }

      tempTimeline.push(slot);
    }

    setTimeline(tempTimeline);
    setTodayMinutes(slotsCount * 60);

  }, [schedule, tasks]); 
  // tasks가 업데이트(체크)될 때마다 타임라인도 다시 그려짐

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.isLocked || !slot.taskId) return;
    toggleTask(slot.taskId);
  };

  // 진행률 계산
  const currentTasks = tasks || [];
  const progress = currentTasks.length > 0 
    ? Math.round((currentTasks.filter(t => t.done).length / currentTasks.length) * 100) 
    : 0;

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;

  return (
    <div className="min-h-screen bg-gray-50 flex animate-fade-in">
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto">
        
        {/* 상단 헤더 */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              반가워요, {user?.name || '학생'}님! 👋
            </h1>
            <p className="text-gray-500 text-sm">
              오늘의 목표를 달성하고 스트릭을 이어가세요!
            </p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span className="font-bold text-gray-700">{user?.streak || 1}일 연속</span>
            </div>
            
            <Link 
              href="/student/schedule/edit" 
              className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700"
            >
              <Edit3 className="w-4 h-4" />
              <span className="font-bold text-xs">시간표 수정하기</span>
            </Link>
          </div>
        </header>

        {/* 대시보드 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* [Left Column] 메인 콘텐츠: 시간표 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 시간표 카드 */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
              
              {/* 헤더 부분 */}
              <div className="flex justify-between items-end mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 px-2 py-1 rounded text-xs font-bold text-blue-600">Today's Schedule</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    오늘의 학습 시간표
                  </h2>
                </div>
                
                {/* 진행률 표시 */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="block text-xs text-gray-400 font-medium">달성률</span>
                    <span className="block text-xl font-bold text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-gray-100 flex items-center justify-center relative">
                    <div 
                      className="absolute inset-0 rounded-full border-4 border-blue-500"
                      style={{ 
                        clipPath: `inset(${100 - progress}% 0 0 0)` // 간단한 CSS 클리핑으로 게이지 효과
                      }}
                    ></div>
                    <CheckCircle2 className={`w-5 h-5 ${progress === 100 ? 'text-blue-500' : 'text-gray-300'}`} />
                  </div>
                </div>
              </div>

              {/* 타임라인 (시간표) */}
              <div className="space-y-3 relative">
                {/* 세로줄 장식 */}
                <div className="absolute left-[3.25rem] top-4 bottom-4 w-0.5 bg-gray-100 hidden md:block"></div>

                {timeline.map((slot) => {
                  // 스타일 로직
                  const isStudy = slot.type === "study";
                  const isCompleted = slot.isDone;
                  
                  // 배경색 및 테두리 결정
                  let cardClass = "border border-gray-100 bg-gray-50 text-gray-400"; // 기본 (잠김)
                  
                  if (isStudy) {
                    if (isCompleted) {
                      cardClass = "bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-200 ring-offset-1";
                    } else {
                      cardClass = "bg-white border-blue-200 text-gray-700 hover:border-blue-400 hover:shadow-md cursor-pointer group";
                    }
                  } else if (slot.type === "school") {
                    cardClass = "bg-yellow-50 border-yellow-100 text-yellow-600/70";
                  } else if (slot.type === "academy") {
                    cardClass = "bg-purple-50 border-purple-100 text-purple-600/70";
                  }

                  return (
                    <div key={slot.hour} className="flex items-center gap-4 relative z-10">
                      
                      {/* 시간 표시 (09:00) */}
                      <div className="w-12 text-right text-sm font-bold text-gray-400 font-mono shrink-0">
                        {String(slot.hour).padStart(2, '0')}:00
                      </div>

                      {/* 시간표 블록 */}
                      <div 
                        onClick={() => handleSlotClick(slot)}
                        className={`flex-1 p-4 rounded-2xl flex justify-between items-center transition-all duration-200 ${cardClass} ${slot.isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          {isStudy ? (
                            // 자습(Study) 아이콘
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-white/20' : 'bg-blue-50'}`}>
                              {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : <BookOpen className="w-4 h-4 text-blue-500" />}
                            </div>
                          ) : (
                            // 기타(학교, 학원 등) 아이콘
                            <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center">
                              <Lock className="w-4 h-4 opacity-50" />
                            </div>
                          )}
                          
                          <div className="flex flex-col">
                            <span className={`font-bold text-sm ${isStudy && !isCompleted ? 'group-hover:text-blue-600' : ''}`}>
                              {slot.label}
                            </span>
                            {isStudy && (
                              <span className={`text-[10px] ${isCompleted ? 'text-blue-100' : 'text-gray-400'}`}>
                                {isCompleted ? '완료됨' : '클릭하여 완료 표시'}
                              </span>
                            )}
                            {!isStudy && (
                              <span className="text-[10px] opacity-70">
                                고정 일정
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 우측 태그 */}
                        {isStudy && (
                           <div className={`text-xs px-2 py-1 rounded font-bold ${isCompleted ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                             60분
                           </div>
                        )}
                        {!isStudy && (
                           <div className="text-xs px-2 py-1 rounded bg-black/5 font-bold opacity-60">
                             {slot.type === 'school' ? '학교' : slot.type === 'academy' ? '학원' : '휴식'}
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 빈 시간이 없을 때 안내 */}
                {timeline.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    등록된 일정이 없습니다. 시간표를 설정해보세요!
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <Link href="/student/chat" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  시간표가 마음에 안 드나요? AI와 상담하기
                </Link>
              </div>
            </div>

          </div>

          {/* [Right Column] 사이드 패널 */}
          <div className="space-y-6">
            
            {/* C. AI 코치 메시지 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-20 h-20 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Mirror AI 코칭
              </h3>
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed mb-4 relative z-10">
                "{user?.name || '학생'}님, 어제 <span className="font-bold text-blue-600">지수법칙</span> 유형에서 계산 실수가 잦았어요. 오늘은 문제 풀 때 <span className="bg-yellow-200 px-1 font-bold">암산 금지!</span> 풀이 과정을 꼭 적어보세요."
              </div>
              <Link href="/student/chat" className="text-xs text-blue-500 hover:underline flex items-center gap-1 relative z-10 font-bold">
                AI 튜터에게 자세한 조언 듣기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            {/* D. 과목별 취약점 분석 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" /> 취약 유형
                </h3>
              </div>
              
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {Object.keys(WEAKNESS_DATA).map(subject => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                      selectedSubject === subject 
                        ? "bg-gray-800 text-white" 
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {WEAKNESS_DATA[selectedSubject]?.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                      <span>{item.label}</span>
                      <span>{item.score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} 
                        style={{ width: mounted ? `${item.score}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 text-xs text-gray-500 font-medium border border-gray-200 py-3 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors">
                <BookOpen className="w-3 h-3" /> 해당 유형 문제 더 풀기
              </button>
            </div>

            {/* E. 랭킹 */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-3xl text-white shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" /> 실시간 랭킹
                </h3>
                <span className="text-xs bg-white/20 px-2 py-1 rounded font-medium">교내 12위</span>
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((rank) => (
                  <div key={rank} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                    <span className={`w-6 text-center font-bold italic ${rank === 1 ? 'text-yellow-400' : 'text-gray-400'}`}>{rank}</span>
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                        {String.fromCharCode(65 + rank)} 
                    </div>
                    <span className="text-sm flex-1 font-medium">User_{rank * 234}</span>
                    <span className="text-xs text-green-400 font-mono">+{100 - rank * 10}pts</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}