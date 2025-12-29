"use client";

export default function StudyRoomPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold">나의 학습방</h1>
      <p className="text-sm text-gray-500 mt-2">학습방 상세 내용이 이곳에 표시됩니다. (임시)</p>
    </div>
  );
}
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useStudy } from "../../context/StudyContext"; 
import { 
  CalendarDays, ToggleLeft, ToggleRight, 
  TrendingUp, Info, Flag,
  Settings, X, Plus, Save, Layers, CheckCircle2,
  Clock, PenTool, Lock, Eraser, RefreshCcw, Maximize, Calendar
} from "lucide-react";

// --- 타입 정의 ---
type TimeSlotSet = Set<string>;

type ExamScope = {
  id: number;
  subject: string;
  examDate: string; // YYYY-MM-DD
  dDay: number;     // 계산된 D-Day
  textbook: string;
  range: string;
  progress: number;
  color: string;
};

// [더미 데이터] 주간 계획
const WEEKLY_PLAN = [
  { 
    day: "월", date: 29, isToday: true, dDay: "D-4", 
    tasks: [
      { id: 1, subject: "수학", title: "미분계수 필수 예제 20문항", done: true, color: "bg-blue-100 text-blue-700" },
      { id: 2, subject: "영어", title: "수특 3강 빈칸추론", done: false, color: "bg-yellow-100 text-yellow-700" }
    ]
  },
  { day: "화", date: 30, isToday: false, dDay: "D-3", tasks: [{ id: 3, subject: "과학", title: "화학1 산화환원 개념 정리", done: false, color: "bg-purple-100 text-purple-700" }] },
  { day: "수", date: 1, isToday: false, dDay: "D-2", tasks: [{ id: 4, subject: "수학", title: "도함수 기출 모의고사 풀이", done: false, color: "bg-blue-100 text-blue-700" }] },
  { day: "목", date: 2, isToday: false, dDay: "D-1", tasks: [{ id: 5, subject: "수학", title: "오답노트 최종 점검", done: false, color: "bg-red-100 text-red-700 font-bold" }] },
  { day: "금", date: 3, isToday: false, dDay: "D-Day", isExamDay: true, examSubject: "수학 중간고사", tasks: [] },
  { day: "토", date: 4, isToday: false, dDay: null, tasks: [] },
  { day: "일", date: 5, isToday: false, dDay: null, tasks: [] },
];

// [더미 데이터] 시험 범위 현황 (날짜 포함)
const getTodayString = () => new Date().toISOString().split('T')[0];
const getFutureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const INITIAL_EXAM_SCOPE: ExamScope[] = [
  { id: 1, subject: "수학", examDate: getTodayString(), dDay: 0, textbook: "신사고 교과서", range: "II. 함수의 극한 ~ III. 미분법", progress: 98, color: "bg-blue-500" },
  { id: 2, subject: "영어", examDate: getFutureDate(4), dDay: 4, textbook: "EBS 수능특강", range: "Part 1. 유형편 (3강 ~ 10강)", progress: 40, color: "bg-yellow-400" },
  { id: 3, subject: "과학", examDate: getFutureDate(7), dDay: 7, textbook: "완자 화학 I", range: "1. 화학의 첫걸음 (대단원 전체)", progress: 20, color: "bg-purple-500" },
];

// [더미 데이터] 주간 달성률 (%)
const ACHIEVEMENT_DATA = [
  { day: "월", rate: 85 }, { day: "화", rate: 100 }, { day: "수", rate: 60 },
  { day: "목", rate: 90 }, { day: "금", rate: 45 }, { day: "토", rate: 0 }, { day: "일", rate: 0 },
];

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); // 08:00 ~ 24:00
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudyRoomPage() {
  const { user } = useStudy();
  const [isExamMode, setIsExamMode] = useState(true);
  const [isSettingOpen, setIsSettingOpen] = useState(false); // 시험 설정 모달
  const [isScheduleOpen, setIsScheduleOpen] = useState(false); // 시간표 모달
  
  const [examScopes, setExamScopes] = useState<ExamScope[]>(INITIAL_EXAM_SCOPE);

  // --- [시간표 로직] 상태 관리 (기존 유지) ---
  const [studySlots, setStudySlots] = useState<TimeSlotSet>(new Set());
  const [fixedSlots, setFixedSlots] = useState<TimeSlotSet>(new Set());
  const [inputMode, setInputMode] = useState<"study" | "fixed">("study");
  
  const isDragging = useRef(false);
  const dragAction = useRef<"add" | "remove">("add");

  // --- [시험 날짜 로직] ---
  const calculateDDay = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleExamDateChange = (id: number, newDate: string) => {
    setExamScopes(prev => prev.map(exam => {
      if (exam.id === id) {
        return { ...exam, examDate: newDate, dDay: calculateDDay(newDate) };
      }
      return exam;
    }));
  };

  // --- [시간표 로직] 핸들러 ---
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
              {isExamMode ? "중간고사 대비 스케줄" : "주간 루틴 스케줄"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isExamMode 
                ? "시험이 코앞입니다! 과목별 D-Day를 확인하세요." 
                : "꾸준함이 답입니다. 계획 달성률을 확인하세요."}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsScheduleOpen(true)}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-blue-200 shadow-sm text-blue-600 hover:bg-blue-50 transition-colors font-bold text-xs"
            >
              <Clock className="w-4 h-4" /> 시간표 설정
            </button>

            <button 
              onClick={() => setIsExamMode(!isExamMode)}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <span className={`text-xs font-bold ${isExamMode ? 'text-gray-400' : 'text-blue-600'}`}>평소</span>
              {isExamMode 
                ? <ToggleRight className="w-8 h-8 text-red-500 fill-red-100" /> 
                : <ToggleLeft className="w-8 h-8 text-gray-300" />
              }
              <span className={`text-xs font-bold ${isExamMode ? 'text-red-500' : 'text-gray-400'}`}>시험기간</span>
            </button>
          </div>
        </header>

        {/* 1. 상단 현황판 */}
        <section className="mb-10 transition-all duration-500">
          {isExamMode ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-red-500" /> 과목별 시험 범위 & D-Day
                </h3>
                <button 
                  onClick={() => setIsSettingOpen(true)}
                  className="text-xs flex items-center gap-1 text-gray-500 hover:text-blue-600 font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" /> 시험 일정 관리
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {examScopes.map((exam, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-red-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-bold text-lg text-gray-800">{exam.subject}</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${exam.dDay <= 3 ? 'bg-red-600 text-white animate-pulse' : 'bg-red-100 text-red-600'}`}>
                        {exam.dDay === 0 ? "D-Day" : exam.dDay < 0 ? "종료" : `D-${exam.dDay}`}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-2 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <span className="block text-gray-400 font-bold mb-0.5">시험 날짜</span>
                          <span className="text-gray-700 font-medium">{exam.examDate}</span>
                        </div>
                        <Calendar className="w-4 h-4 text-gray-300" />
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                          <Layers className="w-3 h-3 text-blue-500" /> {exam.range}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${exam.color}`} style={{ width: `${exam.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-gray-600">{exam.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" /> 주간 목표 달성률 (%)
                </h3>
                <span className="text-xs text-gray-400">이번 주 평균 달성률 76%</span>
              </div>
              {/* 그래프 부분 (생략 없이 유지) */}
              <div className="h-48 w-full relative flex items-end justify-between px-4 pb-2">
                <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none">
                  <div className="border-b border-dashed border-gray-200 w-full flex items-center"><span className="text-[10px] text-gray-400 absolute -left-0 -top-2">100%</span></div>
                  <div className="border-b border-dashed border-gray-100 w-full flex items-center"><span className="text-[10px] text-gray-300 absolute -left-0">50%</span></div>
                  <div className="border-b border-gray-200 w-full"><span className="text-[10px] text-gray-400 absolute -left-0 -bottom-4">0%</span></div>
                </div>
                <svg className="absolute inset-0 w-full h-full overflow-visible py-6 px-4" preserveAspectRatio="none">
                  {ACHIEVEMENT_DATA.map((data, i) => {
                    if (i === ACHIEVEMENT_DATA.length - 1) return null;
                    const nextData = ACHIEVEMENT_DATA[i + 1];
                    const x1 = i * (100 / 6); const y1 = 100 - data.rate;
                    const x2 = (i + 1) * (100 / 6); const y2 = 100 - nextData.rate;
                    return <line key={`line-${i}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`} stroke="#3B82F6" strokeWidth="2" className="transition-all duration-500" />;
                  })}
                  {ACHIEVEMENT_DATA.map((data, i) => {
                     const x = i * (100 / 6); const y = 100 - data.rate;
                     return (
                        <g key={i}>
                          <circle cx={`${x}%`} cy={`${y}%`} r="4" className="fill-white stroke-blue-600 stroke-2 z-10" />
                          {data.rate > 0 && <text x={`${x}%`} y={`${y}%`} dy="-12" textAnchor="middle" className="fill-blue-600 text-[10px] font-bold select-none">{data.rate}%</text>}
                        </g>
                     )
                  })}
                </svg>
                {ACHIEVEMENT_DATA.map((data, i) => (
                  <div key={i} className="z-10 flex flex-col items-center">
                    <span className={`text-xs mt-4 ${data.day === '월' ? 'font-bold text-gray-800' : 'text-gray-400'}`}>{data.day}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 2. 메인 스케줄 (기존 유지) */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Weekly Plan</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              <Info className="w-3.5 h-3.5 text-gray-400" />
              <span>리포트와 수행 여부에 따라 일정이 변동될 수 있습니다.</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {WEEKLY_PLAN.map((plan, idx) => (
              <div key={idx} className={`min-h-[200px] p-4 rounded-2xl border flex flex-col gap-3 ${plan.isToday ? 'bg-white border-blue-400 shadow-md ring-1 ring-blue-100' : 'bg-gray-50/50 border-gray-200 hover:bg-white'}`}>
                <div className={`text-center pb-2 border-b ${plan.isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className="flex justify-center items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{plan.day}</span>
                    {isExamMode && plan.dDay && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${plan.dDay === "D-Day" ? "bg-red-600 text-white" : "bg-red-100 text-red-500"}`}>{plan.dDay}</span>}
                  </div>
                  <span className={`text-xl font-bold ${plan.isExamDay ? 'text-red-600' : ''}`}>{plan.date}</span>
                </div>
                <div className="flex-1 space-y-2">
                  {plan.isExamDay ? (
                    <div className="h-full flex flex-col items-center justify-center text-red-600 animate-pulse">
                      <Flag className="w-8 h-8 mb-2" />
                      <span className="font-black text-sm text-center">{plan.examSubject}</span>
                      <span className="text-xs font-medium mt-1">화이팅! 💯</span>
                    </div>
                  ) : plan.tasks.length > 0 ? (
                    plan.tasks.map((task) => (
                      <div key={task.id} className={`p-2 rounded-lg text-xs leading-tight ${task.color} ${task.done ? 'opacity-50 line-through' : ''}`}>
                        <div className="font-bold mb-1 opacity-70">{task.subject}</div>
                        <div>{task.title}</div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-300 text-xs">일정 없음</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 🕒 [모달 1] 시간표 수정 (기존 유지) */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" /> 고정 시간표 설정</h3>
              <button onClick={() => setIsScheduleOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-xl mb-4">
                <div className="flex p-1 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <button onClick={() => setInputMode("study")} className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 ${inputMode === "study" ? "bg-blue-100 text-blue-700" : "text-gray-400"}`}><PenTool className="w-4 h-4" /> 공부 가능</button>
                  <button onClick={() => setInputMode("fixed")} className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 ${inputMode === "fixed" ? "bg-gray-200 text-gray-700" : "text-gray-400"}`}><Lock className="w-4 h-4" /> 고정 시간</button>
                </div>
                <div className="flex justify-between px-1"><span className="text-xs font-bold text-gray-500">확보: <span className="text-blue-600">{calculateTotalHours()}시간</span></span><div className="flex gap-2"><button onClick={clearAll} className="text-xs font-bold text-gray-400">초기화</button><button onClick={fillAll} className="text-xs font-bold text-blue-400">채우기</button></div></div>
              </div>
              <div className="border rounded-xl overflow-hidden shadow-inner bg-white">
                <div className="grid border-b bg-gray-50" style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}>
                  <div className="p-2 text-[10px] text-center border-r">Time</div>{WEEK_DAYS.map((day, i) => <div key={i} className="p-2 text-xs font-bold text-center border-r last:border-r-0">{day}</div>)}
                </div>
                <div className="h-64 overflow-y-auto custom-scrollbar relative">
                  {HOURS.map((hour) => (
                    <div key={hour} className="grid h-8 border-b last:border-b-0" style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}>
                      <div className="text-[10px] font-medium flex items-center justify-center border-r bg-gray-50 sticky left-0">{hour}:00</div>
                      {WEEK_DAYS.map((_, dayIdx) => {
                        const key = `${dayIdx}-${hour}`;
                        return <div key={key} onMouseDown={() => handleMouseDown(dayIdx, hour)} onMouseEnter={() => handleMouseEnter(dayIdx, hour)} className={`cursor-pointer border-r last:border-r-0 ${studySlots.has(key) ? "bg-blue-500" : fixedSlots.has(key) ? "bg-gray-300" : "bg-white"}`} />
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end"><button onClick={() => setIsScheduleOpen(false)} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">저장 완료</button></div>
          </div>
        </div>
      )}

      {/* ⚙️ [모달 2] 시험 날짜 설정 (업그레이드됨 ✨) */}
      {isSettingOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-500" /> 시험 일정 관리
              </h3>
              <button onClick={() => setIsSettingOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800">등록된 과목별 시험 날짜</h4>
                <div className="space-y-3">
                  {examScopes.map(exam => (
                    <div key={exam.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-10 rounded-full ${exam.color}`}></div>
                        <div>
                          <div className="font-bold text-gray-800">{exam.subject}</div>
                          <div className="text-xs text-gray-500">{exam.range}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {/* ✨ 날짜 선택기: 여기서 날짜를 바꾸면 D-Day가 자동 계산됨 */}
                        <input 
                          type="date" 
                          value={exam.examDate}
                          onChange={(e) => handleExamDateChange(exam.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 bg-gray-50 focus:outline-none focus:border-blue-500"
                        />
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${exam.dDay <= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                          {exam.dDay === 0 ? "D-Day" : exam.dDay < 0 ? "종료됨" : `${exam.dDay}일 남음`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 과목 추가 섹션 (간소화) */}
              <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-500 transition-all">
                <Plus className="w-4 h-4" /> 새 시험 과목 추가하기
              </button>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setIsSettingOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200">취소</button>
              <button onClick={() => setIsSettingOpen(false)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700">저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}