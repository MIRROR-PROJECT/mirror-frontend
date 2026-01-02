"use client";

import { useState, useEffect } from "react";
import { useStudy } from "../../context/StudyContext"; // 경로 확인 필요
import { 
  CheckCircle2, TrendingUp, Flame, 
  BrainCircuit, Target, ChevronRight, 
  MessageCircle, BookOpen, Lock, Edit3
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
  startHour: number;
  endHour: number;
  duration: number;
  type: "study" | "rest"; // 타입을 단순화했습니다.
  label: string;
  taskId?: number;   
  isDone?: boolean;  
  isLocked?: boolean; 
}

// 더미 데이터 (기존 유지)
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
  // tasks와 toggleTask를 Context에서 가져와야 에러가 나지 않습니다.
  const { schedule, tasks, toggleTask } = useStudy();
  
  const [selectedSubject, setSelectedSubject] = useState("수학");
  const [mounted, setMounted] = useState(false);
  const [timeline, setTimeline] = useState<TimeSlot[]>([]);
  
  // tasks가 undefined일 경우를 대비해 빈 배열 처리
  const currentTasksList = tasks || [];

  useEffect(() => {
    setMounted(true);
    const today = new Date();
    const jsDay = today.getDay(); 
    const scheduleDayKey = jsDay === 0 ? 6 : jsDay - 1; 

    const tempTimeline: TimeSlot[] = [];
    let taskIndex = 0;

    const startHour = 9;
    const endHour = 23;

    for (let h = startHour; h <= endHour; h++) {
      const key = `${scheduleDayKey}-${h}`;
      
      // 1. 스케줄 데이터 확인 (단순화: study인가 아닌가)
      const rawType = schedule ? (schedule[key] as string) : "";
      const isStudyable = rawType === "study";
      
      let currentType: TimeSlot["type"] = "rest";
      let currentLabel = "일정 있음"; // 기본값
      let currentIsLocked = true;
      let currentTaskId: number | undefined = undefined;
      let currentIsDone: boolean | undefined = undefined;

      if (isStudyable) {
        currentType = "study";
        currentIsLocked = false;
        
        // 할 일(Task) 매핑 로직
        const assignedTask = currentTasksList[taskIndex];
        if (assignedTask) {
          currentLabel = assignedTask.title;
          currentTaskId = assignedTask.id;
          currentIsDone = assignedTask.done;
          taskIndex++; // 다음 할 일로 포인터 이동
        } else {
          currentLabel = "자율 학습"; // 할 일이 더 이상 없을 때
        }
      } else {
        // 공부 불가능한 시간 (학교, 학원, 수면 등 모두 포함)
        currentType = "rest";
        currentLabel = "학습 불가 (일정 있음)";
        currentIsLocked = true;
      }

      // 2. 병합 로직 (Merging Logic)
      const prevSlot = tempTimeline[tempTimeline.length - 1];

      // 병합 조건:
      // (1) 이전 슬롯이 존재하고
      // (2) 타입이 같아야 함 (rest끼리만 병합)
      // (3) 'study'는 병합하지 않음 (체크박스를 시간별로 찍기 위해)
      const canMerge = prevSlot && 
                       prevSlot.type === currentType && 
                       currentType !== 'study'; 

      if (canMerge) {
        // 병합: 시간 연장
        prevSlot.endHour = h + 1;
        prevSlot.duration += 1;
      } else {
        // 신규 추가
        tempTimeline.push({
          startHour: h,
          endHour: h + 1,
          duration: 1,
          type: currentType,
          label: currentLabel,
          isLocked: currentIsLocked,
          taskId: currentTaskId,
          isDone: currentIsDone
        });
      }
    }

    setTimeline(tempTimeline);

  }, [schedule, tasks]); // tasks가 변경될 때도 재계산

  // 진행률 계산
  const calcProgress = currentTasksList.length > 0 
    ? Math.round((currentTasksList.filter(t => t.done).length / currentTasksList.length) * 100) 
    : 0;

  const handleSlotClick = (slot: TimeSlot) => {
    // 잠겨있거나 Task ID가 없으면 무시
    if (slot.isLocked || !slot.taskId) return;
    
    // Context의 toggleTask 호출
    if (toggleTask) {
      toggleTask(slot.taskId);
    }
  };

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
            <Link href="/student/schedule/edit" className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700">
              <Edit3 className="w-4 h-4" />
              <span className="font-bold text-xs">시간표 수정하기</span>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* [Left Column] 타임라인 */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 px-2 py-1 rounded text-xs font-bold text-blue-600">Today's Schedule</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">오늘의 학습 시간표</h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                    <span className="block text-xs text-gray-400 font-medium">달성률</span>
                    <span className="block text-xl font-bold text-blue-600">{calcProgress}%</span>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-gray-100 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500" style={{ clipPath: `inset(${100 - calcProgress}% 0 0 0)` }}></div>
                    <CheckCircle2 className={`w-5 h-5 ${calcProgress === 100 ? 'text-blue-500' : 'text-gray-300'}`} />
                  </div>
                </div>
              </div>

              {/* 타임라인 리스트 */}
              <div className="space-y-3 relative">
                <div className="absolute left-[3.25rem] top-4 bottom-4 w-0.5 bg-gray-100 hidden md:block"></div>

                {timeline.map((slot, index) => {
                  const isStudy = slot.type === "study";
                  const isCompleted = slot.isDone;
                  
                  let cardClass = ""; 
                  
                  if (isStudy) {
                    if (isCompleted) {
                      cardClass = "bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-200 ring-offset-1";
                    } else {
                      cardClass = "bg-white border-blue-200 text-gray-700 hover:border-blue-400 hover:shadow-md cursor-pointer group";
                    }
                  } else {
                    // Rest (학습 불가) 스타일 통일
                    cardClass = "bg-gray-50 border-gray-200 text-gray-400";
                  }

                  const startTime = `${String(slot.startHour).padStart(2, '0')}:00`;

                  return (
                    <div key={`${slot.startHour}-${index}`} className="flex items-start gap-4 relative z-10">
                      
                      {/* 시간 표시 */}
                      <div className="w-12 text-right pt-4 shrink-0">
                        <div className="text-sm font-bold text-gray-400 font-mono">{startTime}</div>
                        {slot.duration > 1 && (
                           <div className="text-[10px] text-gray-300 font-mono h-4">
                             ~ {String(slot.endHour).padStart(2, '0')}:00
                           </div>
                        )}
                      </div>

                      {/* 카드 */}
                      <div 
                        onClick={() => handleSlotClick(slot)}
                        className={`flex-1 p-4 rounded-2xl flex justify-between items-center transition-all duration-200 ${cardClass} ${slot.isLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          {isStudy ? (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-white/20' : 'bg-blue-50'}`}>
                              {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : <BookOpen className="w-4 h-4 text-blue-500" />}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200/50 flex items-center justify-center">
                              <Lock className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="flex flex-col">
                            <span className={`font-bold text-sm ${isStudy && !isCompleted ? 'group-hover:text-blue-600' : ''}`}>
                              {slot.label}
                            </span>
                            {/* 상세 텍스트 */}
                            {isStudy ? (
                              <span className={`text-[10px] ${isCompleted ? 'text-blue-100' : 'text-gray-400'}`}>
                                {isCompleted ? '완료됨' : '클릭하여 완료 표시'}
                              </span>
                            ) : (
                               <span className="text-[10px] opacity-70">
                                 다른 일정 진행 중 ({slot.duration}시간)
                               </span>
                            )}
                          </div>
                        </div>

                        {/* 우측 태그 */}
                        {isStudy && (
                           <div className={`text-xs px-2 py-1 rounded font-bold ${isCompleted ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                             {slot.duration * 60}분
                           </div>
                        )}
                        {!isStudy && (
                           <div className="text-xs px-2 py-1 rounded bg-black/5 font-bold opacity-60">
                             잠김
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {timeline.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    등록된 일정이 없습니다.
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end">
                <Link href="/student/chat" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  AI와 상담하기
                </Link>
              </div>
            </div>
          </div>

          {/* [Right Column] 사이드 패널 (기존 유지) */}
          <div className="space-y-6">
             {/* Mirror AI 코칭 */}
             <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-20 h-20 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                <Target className="w-5 h-5 text-blue-600" /> Mirror AI 코칭
              </h3>
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed mb-4 relative z-10">
                "{user?.name || '학생'}님, 어제 <span className="font-bold text-blue-600">지수법칙</span> 유형에서 계산 실수가 잦았어요."
              </div>
              <Link href="/student/chat" className="text-xs text-blue-500 hover:underline flex items-center gap-1 relative z-10 font-bold">
                조언 듣기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {/* 과목별 취약점 */}
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
            </div>

            {/* 랭킹 */}
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