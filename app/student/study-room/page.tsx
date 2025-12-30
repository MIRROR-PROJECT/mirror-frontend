"use client";

import { useState, useRef, useEffect } from "react";
import { useStudy } from "../../context/StudyContext"; // Context import
import { 
  CalendarDays, CheckCircle2,
  Clock, PenTool, Lock, Settings, 
  BookOpen, Target, Plus, X,
  Calendar as CalendarIcon
} from "lucide-react";

// --- 타입 정의 ---
type TimeSlotSet = Set<string>;

type SubjectProgress = {
  id: number;
  subject: string;
  textbook: string; 
  currentUnit: string; 
  progress: number; 
  color: string;
};

// [더미 데이터] 과목별 진도 현황
const INITIAL_SUBJECTS: SubjectProgress[] = [
  { id: 1, subject: "수학", textbook: "신사고 교과서", currentUnit: "II. 함수의 극한 ~ III. 미분법", progress: 65, color: "bg-blue-500" },
  { id: 2, subject: "영어", textbook: "EBS 수능특강", currentUnit: "Part 1. 유형편 (3강 ~ 10강)", progress: 40, color: "bg-yellow-400" },
  { id: 3, subject: "과학", textbook: "완자 화학 I", currentUnit: "1. 화학의 첫걸음 (대단원 전체)", progress: 20, color: "bg-purple-500" },
];

// [더미 데이터] 주간 달성률 (%) - 그래프용
const ACHIEVEMENT_DATA = [
  { day: "월", rate: 85 }, { day: "화", rate: 100 }, { day: "수", rate: 60 },
  { day: "목", rate: 90 }, { day: "금", rate: 45 }, { day: "토", rate: 0 }, { day: "일", rate: 0 },
];

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); // 08:00 ~ 24:00
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudyRoomPage() {
  // ✨ Context에서 데이터와 함수들을 모두 가져옵니다.
  const { tasks, toggleTask, schedule, updateSchedule } = useStudy(); 
  
  // 모달 상태
  const [isScheduleOpen, setIsScheduleOpen] = useState(false); 
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);   

  const [subjects, setSubjects] = useState<SubjectProgress[]>(INITIAL_SUBJECTS);

  // [주간 날짜 생성 로직]
  const [weekDates, setWeekDates] = useState<{ day: string, date: number, isToday: boolean }[]>([]);

  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0(일) ~ 6(토)
    // 월요일을 시작(0)으로 맞추기 위한 조정: 일(0) -> 6, 월(1) -> 0 ...
    const dayIndex = (currentDay + 6) % 7; 
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayIndex);

    const tempWeek = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      tempWeek.push({
        day: WEEK_DAYS[i], 
        date: d.getDate(),
        isToday: i === dayIndex, 
      });
    }
    setWeekDates(tempWeek);
  }, []);

  // --- [시간표 로직] 상태 관리 ---
  const [studySlots, setStudySlots] = useState<TimeSlotSet>(new Set());
  const [fixedSlots, setFixedSlots] = useState<TimeSlotSet>(new Set());
  const [inputMode, setInputMode] = useState<"study" | "fixed">("study");
  
  const isDragging = useRef(false);
  const dragAction = useRef<"add" | "remove">("add");

  // ✨ [초기화] Context의 schedule 데이터가 변경되면 로컬 상태(studySlots, fixedSlots)에 반영
  useEffect(() => {
    const newStudySlots = new Set<string>();
    const newFixedSlots = new Set<string>();

    if (schedule) {
      Object.entries(schedule).forEach(([key, type]) => {
        if (type === "study") newStudySlots.add(key);
        else if (type === "fixed") newFixedSlots.add(key);
      });
    }
    setStudySlots(newStudySlots);
    setFixedSlots(newFixedSlots);
  }, [schedule]); // schedule이 로드되거나 변경될 때 실행

  // ✨ [저장] 사용자가 수정한 시간표를 Context에 저장 (전역 반영)
  const handleSaveSchedule = () => {
    const newSchedule: Record<string, "study" | "fixed"> = {};
    studySlots.forEach(key => newSchedule[key] = "study");
    fixedSlots.forEach(key => newSchedule[key] = "fixed");
    
    updateSchedule(newSchedule); // Context 업데이트 -> Dashboard에도 즉시 반영됨
    setIsScheduleOpen(false);
  };

  // --- [시간표 수정 인터랙션] 핸들러 ---
  const updateSlot = (dayIdx: number, hour: number, action: "add" | "remove") => {
    const key = `${dayIdx}-${hour}`;
    if (inputMode === "study") {
      setStudySlots(prev => {
        const next = new Set(prev);
        if (action === "add") { next.add(key); setFixedSlots(f => { const nf = new Set(f); nf.delete(key); return nf; }); } 
        else { next.delete(key); }
        return next;
      });
    } else {
      setFixedSlots(prev => {
        const next = new Set(prev);
        if (action === "add") { next.add(key); setStudySlots(s => { const ns = new Set(s); ns.delete(key); return ns; }); } 
        else { next.delete(key); }
        return next;
      });
    }
  };

  const handleMouseDown = (dayIdx: number, hour: number) => { 
    isDragging.current = true;
    const key = `${dayIdx}-${hour}`;
    const currentSet = inputMode === "study" ? studySlots : fixedSlots;
    dragAction.current = currentSet.has(key) ? "remove" : "add";
    updateSlot(dayIdx, hour, dragAction.current);
  };

  const handleMouseEnter = (dayIdx: number, hour: number) => { 
    if (isDragging.current) updateSlot(dayIdx, hour, dragAction.current); 
  };
  
  const handleMouseUp = () => { isDragging.current = false; };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const calculateTotalHours = () => studySlots.size;
  const clearAll = () => { setStudySlots(new Set()); setFixedSlots(new Set()); };
  const fillAll = () => {
    const newStudy = new Set<string>();
    for(let d=0; d<7; d++) for(let h of HOURS) newStudy.add(`${d}-${h}`);
    setStudySlots(newStudy); setFixedSlots(new Set());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
        
        {/* 헤더 */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-blue-600" />
              주간 루틴 스케줄
            </h1>
            <p className="text-gray-500 text-sm">
              꾸준함이 실력입니다. 계획 달성률을 확인하고 관리하세요.
            </p>
          </div>
          
          <button 
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-blue-200 shadow-sm text-blue-600 hover:bg-blue-50 transition-colors font-bold text-sm"
          >
            <Clock className="w-4 h-4" /> 시간표 설정
          </button>
        </header>

        {/* 1. 상단 현황판 (과목 진도 & 달성률) */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* [좌측] 과목별 진도 현황 */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" /> 과목별 학습 진도
                </h3>
                <button 
                  onClick={() => setIsSubjectOpen(true)}
                  className="text-xs text-gray-400 hover:text-blue-600 font-medium flex items-center gap-1 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" /> 관리
                </button>
             </div>

             <div className="flex-1 space-y-4 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
                {subjects.map((sub, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-gray-800 text-sm block mb-0.5">{sub.subject}</span>
                        <span className="text-xs text-gray-500">{sub.textbook}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-100">{sub.progress}%</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                         <Target className="w-3 h-3 text-gray-400" />
                         <span className="truncate">{sub.currentUnit}</span>
                      </div>
                      <div className="h-2 bg-white rounded-full overflow-hidden border border-gray-100">
                        <div className={`h-full ${sub.color}`} style={{ width: `${sub.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50 hover:border-gray-300 transition-all">
                   <Plus className="w-3.5 h-3.5" /> 과목 추가
                </button>
             </div>
          </div>

          {/* [우측] 주간 달성률 그래프 */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-green-500" /> 이번 주 달성률
               </h3>
               {/* Context의 tasks를 이용해 실시간 달성률 표시 */}
               <span className="text-2xl font-black text-gray-900">
                 {Math.round((tasks.filter(t => t.done).length / (tasks.length || 1)) * 100)}%
               </span>
            </div>
            <p className="text-xs text-gray-400 mb-6">지난주보다 <span className="text-red-500 font-bold">5% 하락</span>했어요. 조금 더 분발해볼까요?</p>

            <div className="flex-1 w-full relative flex items-end justify-between px-2 pb-2 min-h-[160px]">
               {/* 배경 그리드 */}
               <div className="absolute inset-0 flex flex-col justify-between py-2 px-2 pointer-events-none">
                 <div className="border-b border-dashed border-gray-100 w-full h-full"></div>
               </div>
               
               {/* 그래프 라인 및 포인트 */}
               <svg className="absolute inset-0 w-full h-full overflow-visible py-2 px-2" preserveAspectRatio="none">
                 {ACHIEVEMENT_DATA.map((data, i) => {
                   if (i === ACHIEVEMENT_DATA.length - 1) return null;
                   const nextData = ACHIEVEMENT_DATA[i + 1];
                   const x1 = i * (100 / 6); const y1 = 100 - data.rate;
                   const x2 = (i + 1) * (100 / 6); const y2 = 100 - nextData.rate;
                   return <line key={`line-${i}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" className="transition-all duration-500" />;
                 })}
                 {ACHIEVEMENT_DATA.map((data, i) => {
                    const x = i * (100 / 6); const y = 100 - data.rate;
                    return (
                       <g key={i}>
                         <circle cx={`${x}%`} cy={`${y}%`} r="4" className="fill-white stroke-blue-600 stroke-2 z-10" />
                         <rect x={`${x}%`} y="0" width="20" height="100%" transform="translate(-10, 0)" fill="transparent" className="peer cursor-pointer" />
                         {data.rate > 0 && <text x={`${x}%`} y={`${y}%`} dy="-10" textAnchor="middle" className="fill-gray-500 text-[10px] font-bold select-none opacity-0 peer-hover:opacity-100 transition-opacity">{data.rate}%</text>}
                       </g>
                    )
                 })}
               </svg>
               
               {/* X축 레이블 */}
               {ACHIEVEMENT_DATA.map((data, i) => (
                 <div key={i} className="z-10 flex flex-col items-center w-8">
                   <span className={`text-xs mt-2 ${data.day === '월' ? 'font-bold text-blue-600' : 'text-gray-400'}`}>{data.day}</span>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* 2. 주간 계획표 (Weekly Plan) - 클릭 시 토글 연동 ✨ */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Weekly Plan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDates.map((plan, idx) => (
              <div key={idx} className={`min-h-48 p-3 rounded-2xl border flex flex-col gap-2 transition-all ${plan.isToday ? 'bg-white border-blue-400 shadow-md ring-2 ring-blue-50 transform scale-105 z-10' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
                <div className={`text-center pb-2 border-b border-gray-50 ${plan.isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                  <span className="text-xs font-bold block mb-0.5">{plan.day}</span>
                  <span className="text-lg font-black">{plan.date}</span>
                </div>
                
                <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1 max-h-40">
                  {/* ✨ 오늘 날짜인 경우 Context의 Tasks를 렌더링하고 클릭 이벤트 연결 */}
                  {plan.isToday ? (
                    tasks.length > 0 ? (
                      tasks.map((task) => (
                        <div 
                          key={task.id} 
                          onClick={() => toggleTask(task.id)} // ✨ 클릭 시 toggleTask 호출 -> Context 업데이트
                          className={`p-2 rounded-lg text-[11px] leading-tight font-medium cursor-pointer transition-all hover:opacity-80 select-none ${
                            task.done 
                              ? 'bg-blue-100 text-blue-400 line-through opacity-60' 
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          <div className="font-extrabold mb-0.5 opacity-80 flex items-center gap-1">
                             {task.done && <CheckCircle2 className="w-3 h-3" />}
                             Mission
                          </div>
                          <div>{task.title}</div>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-1">
                         <span className="text-[10px]">할 일 없음</span>
                      </div>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-1">
                       <CalendarIcon className="w-4 h-4 opacity-50" />
                       <span className="text-[10px]">일정 없음</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 🕒 [모달 1] 시간표 설정 */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" /> 고정 시간표 설정</h3>
              <button onClick={() => setIsScheduleOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-2xl mb-6">
                <div className="flex p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <button onClick={() => setInputMode("study")} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${inputMode === "study" ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200" : "text-gray-400 hover:text-gray-600"}`}><PenTool className="w-4 h-4" /> 공부 가능</button>
                  <button onClick={() => setInputMode("fixed")} className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${inputMode === "fixed" ? "bg-gray-100 text-gray-700 ring-1 ring-gray-300" : "text-gray-400 hover:text-gray-600"}`}><Lock className="w-4 h-4" /> 고정 일정</button>
                </div>
                <div className="flex justify-between items-center px-1">
                   <span className="text-xs font-bold text-gray-500">주간 확보 시간: <span className="text-blue-600 text-sm">{calculateTotalHours()}시간</span></span>
                   <div className="flex gap-3">
                      <button onClick={clearAll} className="text-xs font-bold text-gray-400 hover:text-red-500 underline decoration-gray-300 underline-offset-2">전체 삭제</button>
                      <button onClick={fillAll} className="text-xs font-bold text-blue-400 hover:text-blue-600 underline decoration-blue-200 underline-offset-2">전체 채우기</button>
                   </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-white select-none">
                <div className="grid border-b border-gray-100 bg-gray-50/80" style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}>
                  <div className="p-2 text-[10px] text-center border-r border-gray-100 text-gray-400 font-medium">Time</div>
                  {WEEK_DAYS.map((day, i) => <div key={i} className="p-2 text-xs font-bold text-center border-r border-gray-100 last:border-r-0 text-gray-600">{day}</div>)}
                </div>
                <div className="h-64 overflow-y-auto custom-scrollbar relative">
                  {HOURS.map((hour) => (
                    <div key={hour} className="grid h-8 border-b border-gray-100 last:border-b-0" style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}>
                      <div className="text-[10px] text-gray-400 font-medium flex items-center justify-center border-r border-gray-100 bg-gray-50 sticky left-0">{hour}:00</div>
                      {WEEK_DAYS.map((_, dayIdx) => {
                        const key = `${dayIdx}-${hour}`;
                        return <div key={key} onMouseDown={() => handleMouseDown(dayIdx, hour)} onMouseEnter={() => handleMouseEnter(dayIdx, hour)} className={`cursor-pointer border-r border-gray-50 last:border-r-0 transition-colors ${studySlots.has(key) ? "bg-blue-500 hover:bg-blue-400" : fixedSlots.has(key) ? "bg-gray-200 hover:bg-gray-300" : "bg-white hover:bg-gray-50"}`} />
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
               {/* ✨ 저장 버튼: handleSaveSchedule 호출 */}
               <button onClick={handleSaveSchedule} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all">저장 완료</button>
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ [모달 2] 과목 설정 (단순화된 버전) */}
      {isSubjectOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 text-center">
              <h3 className="text-lg font-bold mb-2">과목 관리 준비 중</h3>
              <p className="text-gray-500 text-sm mb-6">현재 과목 및 진도 설정 기능은 업데이트 예정입니다.<br/>빠른 시일 내에 제공해 드릴게요! 🚧</p>
              <button onClick={() => setIsSubjectOpen(false)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">확인</button>
           </div>
        </div>
      )}
    </div>
  );
}