"use client";

import { useState, useEffect } from "react";
import { useStudy } from "../../context/StudyContext"; 
import { 
  CheckCircle2, TrendingUp, Flame, 
  BrainCircuit, Target, ChevronRight, 
  MessageCircle, BookOpen, Lock, Edit3,
  PieChart, BarChart3 // 아이콘 추가
} from "lucide-react";
import Link from "next/link";

// --- 타입 정의 ---
interface UserProps {
  id: string;
  name: string;
  role: string;
  streak?: number;
}

// [수정] 과목별 미션 현황 데이터 타입
interface SubjectMission {
  subject: string;
  progress: number;    // 달성률 (%)
  completed: number;   // 완료한 미션 수
  total: number;       // 전체 미션 수
  color: string;       // 막대 색상
}

interface TimeSlot {
  startHour: number;
  endHour: number;
  duration: number;
  type: "study" | "rest";
  label: string;
  taskId?: number;   
  isDone?: boolean;  
  isLocked?: boolean; 
}

// [수정] 더미 데이터: 과목별 미션 현황
const MISSION_STATUS: SubjectMission[] = [
  { subject: "수학", progress: 75, completed: 3, total: 4, color: "bg-blue-500" },
  { subject: "영어", progress: 40, completed: 2, total: 5, color: "bg-yellow-400" },
  { subject: "국어", progress: 100, completed: 3, total: 3, color: "bg-green-500" },
  { subject: "탐구", progress: 20, completed: 1, total: 5, color: "bg-purple-500" },
];

export default function StudentDashboard({ user }: { user: UserProps }) {
  const { schedule, tasks, toggleTask } = useStudy();
  
  // selectedSubject 상태는 더 이상 필요 없으므로 삭제하거나 유지해도 무방 (여기선 삭제)
  const [mounted, setMounted] = useState(false);
  const [timeline, setTimeline] = useState<TimeSlot[]>([]);
  
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
      
      const rawType = schedule ? (schedule[key] as string) : "";
      const isStudyable = rawType === "study";
      
      let currentType: TimeSlot["type"] = "rest";
      let currentLabel = "일정 있음"; 
      let currentIsLocked = true;
      let currentTaskId: number | undefined = undefined;
      let currentIsDone: boolean | undefined = undefined;

      if (isStudyable) {
        currentType = "study";
        currentIsLocked = false;
        
        const assignedTask = currentTasksList[taskIndex];
        if (assignedTask) {
          currentLabel = assignedTask.title;
          currentTaskId = assignedTask.id;
          currentIsDone = assignedTask.done;
          taskIndex++; 
        } else {
          currentLabel = "자율 학습"; 
        }
      } else {
        currentType = "rest";
        currentLabel = "학습 불가 (일정 있음)";
        currentIsLocked = true;
      }

      const prevSlot = tempTimeline[tempTimeline.length - 1];
      const canMerge = prevSlot && 
                       prevSlot.type === currentType && 
                       currentType !== 'study'; 

      if (canMerge) {
        prevSlot.endHour = h + 1;
        prevSlot.duration += 1;
      } else {
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

  }, [schedule, tasks]); 

  const calcProgress = currentTasksList.length > 0 
    ? Math.round((currentTasksList.filter(t => t.done).length / currentTasksList.length) * 100) 
    : 0;

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.isLocked || !slot.taskId) return;
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
                    cardClass = "bg-gray-50 border-gray-200 text-gray-400";
                  }

                  const startTime = `${String(slot.startHour).padStart(2, '0')}:00`;

                  return (
                    <div key={`${slot.startHour}-${index}`} className="flex items-start gap-4 relative z-10">
                      
                      <div className="w-12 text-right pt-4 shrink-0">
                        <div className="text-sm font-bold text-gray-400 font-mono">{startTime}</div>
                        {slot.duration > 1 && (
                           <div className="text-[10px] text-gray-300 font-mono h-4">
                             ~ {String(slot.endHour).padStart(2, '0')}:00
                           </div>
                        )}
                      </div>

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

          {/* [Right Column] 사이드 패널 */}
          <div className="space-y-6">
             {/* 1. Mirror AI 코칭 */}
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

            {/* 2. [변경됨] 과목별 미션 달성도 (막대 그래프) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-500" /> 과목별 미션 현황
                </h3>
              </div>
              
              <div className="space-y-5">
                {MISSION_STATUS.map((item) => (
                  <div key={item.subject}>
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700 text-sm">{item.subject}</span>
                        <span className="text-xs text-gray-400 font-medium">
                          ({item.completed}/{item.total} 완료)
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${item.progress === 100 ? 'text-green-500' : 'text-blue-600'}`}>
                        {item.progress}%
                      </span>
                    </div>
                    
                    {/* 막대 바 */}
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} 
                        style={{ width: mounted ? `${item.progress}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <p className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100">
                 💡 <span className="font-bold text-indigo-600">영어</span> 미션 2개가 밀려있어요!
              </p>
            </div>

            {/* 3. 랭킹 */}
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