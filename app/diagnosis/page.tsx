"use client";

// 1. React 필수 훅
import { useState, useRef, useEffect, useMemo } from "react";
import { useStudy } from "../context/StudyContext";

// 2. 아이콘들
import { 
  Loader2, Camera, Clock, Check, GraduationCap, BookOpen, 
  ChevronRight, ChevronLeft, Eraser, PenTool, RefreshCcw, 
  Maximize, Map, CalendarCheck, RefreshCw, ArrowRight,
  Flag, Trophy, Target, ListTodo, FileText, AlertCircle, 
  ChevronDown, ChevronUp, CheckCircle2, Calendar
} from "lucide-react";

import Link from "next/link";

// --- 타입 정의 ---
type SchoolType = "middle" | "high" | "";
type StudyMode = "routine" | "exam" | "";
type TimeSlotSet = Set<string>;
type WeekData = { [key: string]: string };

export default function DiagnosisPage() {
  const { updateSchedule } = useStudy(); 
  const [step, setStep] = useState<number>(1);
  
  // --- 데이터 상태 관리 ---
  const [info, setInfo] = useState({
    school: "" as SchoolType,
    grade: "",
    semester: "1",
    subjects: [] as string[],
  });
  
  const [mode, setMode] = useState<{ type: StudyMode }>({ type: "" });
  
  // [NEW] 과목별 시험 날짜 저장 (과목명: 날짜String)
  const [examDates, setExamDates] = useState<Record<string, string>>({});

  // Step 3: 시간표 관련 상태
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotSet>(new Set());
  const [examWeekTab, setExamWeekTab] = useState<1 | 2>(1); 
  
  // 드래그 로직
  const isDragging = useRef(false);
  const dragAction = useRef<"add" | "remove">("add"); 

  // Step 4 상태
  const [todayData, setTodayData] = useState({ time: "", image: null });
  const [showSubSubjects, setShowSubSubjects] = useState(false);

  // --- 설정 (Constants) ---
  const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); // 08:00 ~ 24:00
  const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const MAIN_SUBJECTS = ["국어", "수학", "영어"];
  const DETAIL_SUBJECTS = [
    { category: "과학 탐구", items: ["물리", "화학", "생명과학", "지구과학", "통합과학"] },
    { category: "사회/역사 탐구", items: ["한국사", "윤리", "지리", "역사", "일반사회", "통합사회"] },
    { category: "기타", items: ["정보", "제2외국어", "한문", "기가"] }
  ];

  // --- [NEW] 최대 D-Day 계산 로직 ---
  // 입력된 시험 날짜 중 가장 늦은 날짜까지의 남은 일수를 계산
  const maxDDay = useMemo(() => {
    if (mode.type !== 'exam') return 0;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let maxDiff = 0;

    Object.values(examDates).forEach(dateStr => {
      if (!dateStr) return;
      const target = new Date(dateStr);
      target.setHours(0,0,0,0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > maxDiff) maxDiff = diffDays;
    });

    return maxDiff;
  }, [examDates, mode.type]);

  // --- Step 6 'schedule' 데이터 자동 계산 ---
  const schedule = useMemo(() => {
    const data: WeekData = {};
    WEEK_DAYS.forEach((day, idx) => {
      let count = 0;
      selectedSlots.forEach(slot => {
        const [d] = slot.split('-');
        if (parseInt(d) % 7 === idx) count++;
      });
      data[day] = (count * 60).toString();
    });
    return data;
  }, [selectedSlots]);

  // --- 헬퍼 함수 ---
  const toggleSubject = (subject: string) => {
    setInfo(prev => {
      const exists = prev.subjects.includes(subject);
      return { ...prev, subjects: exists ? prev.subjects.filter(s => s !== subject) : [...prev.subjects, subject] };
    });
  };

  // 날짜 계산 (maxDDay 사용)
  const isShortTerm = mode.type === "exam" && maxDDay > 0 && maxDDay <= 7;
  
  // 시험 모드일 때 보여줄 요일 (짧으면 1주, 길면 탭에 따라 다름)
  const displayDays = useMemo(() => {
    if (mode.type === 'routine') return WEEK_DAYS;
    
    const days = [];
    // 1주차 탭이거나 벼락치기면 앞쪽 날짜
    if (isShortTerm || examWeekTab === 1) {
        // D-Day 역순 표시 대신, 그냥 1일차~7일차 개념으로 표시 (간단화)
        // 여기서는 기존 로직 유지하되 maxDDay 기반으로 표시
        const limit = isShortTerm ? maxDDay : 7;
        for (let i = 0; i < limit; i++) {
            const d = maxDDay - i;
            days.push(d === 0 ? "D-Day" : `D-${d}`);
        }
        // 칸 채우기용 더미 (그리드 깨짐 방지)
        while (days.length < 7) days.push("-");
    } else {
        // 2주차 (7일 전 ~ 14일 전)
        for (let i = 7; i < 14; i++) {
            const d = maxDDay - i;
            if (d < 0) days.push("-"); // 이미 지난 날짜
            else days.push(d === 0 ? "D-Day" : `D-${d}`);
        }
    }
    return days;
  }, [mode.type, maxDDay, isShortTerm, examWeekTab]);


  const getActualDayIdx = (dayIdx: number) => {
    if (mode.type === "exam" && !isShortTerm && examWeekTab === 2) return dayIdx + 7;
    return dayIdx;
  };

  // --- 시간표 수정 로직 ---
  const updateSlot = (dayIdx: number, hour: number, action: "add" | "remove") => {
    const actual = getActualDayIdx(dayIdx);
    const key = `${actual}-${hour}`;
    
    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (action === "add") next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const handleMouseDown = (dayIdx: number, hour: number) => {
    isDragging.current = true;
    const actual = getActualDayIdx(dayIdx);
    const key = `${actual}-${hour}`;
    dragAction.current = selectedSlots.has(key) ? "remove" : "add";
    updateSlot(dayIdx, hour, dragAction.current);
  };

  const handleMouseEnter = (dayIdx: number, hour: number) => {
    if (!isDragging.current) return;
    updateSlot(dayIdx, hour, dragAction.current);
  };

  useEffect(() => {
    const onUp = () => { isDragging.current = false; };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

  const clearCurrentWeek = () => setSelectedSlots(new Set());

  const fillCurrentWeek = () => {
    const next = new Set<string>();
    // 시험 기간이면 최대 날짜만큼, 루틴이면 7일치
    const daysToFill = mode.type === 'exam' ? Math.min(maxDDay, 14) : 7;
    
    for (let d = 0; d < daysToFill; d++) {
      for (let h of HOURS) next.add(`${d}-${h}`);
    }
    setSelectedSlots(next);
  };

  const calculateTotalHours = () => selectedSlots.size;

  const startAnalysis = () => {
    setStep(5);
    setTimeout(() => setStep(6), 3000);
  };

  const canGoNext = () => {
    if (step === 1) return info.school && info.grade && info.semester && info.subjects.length > 0;
    if (step === 2) {
        if (mode.type === "routine") return true;
        if (mode.type === "exam") {
            // 선택된 과목들에 대해 날짜가 하나라도 입력되어 있어야 함
            return info.subjects.some(sub => !!examDates[sub]);
        }
        return false;
    }
    if (step === 3) return selectedSlots.size > 0;
    if (step === 4) return mode.type === 'exam' ? true : todayData.time; 
    return false;
  };

  const getTodayExamTime = () => "180"; 
  const finalTime = mode.type === 'exam' ? getTodayExamTime() : todayData.time;

  const handleNext = () => {
    if (step === 3) {
      const newSchedule: Record<string, "study" | "fixed"> = {};
      selectedSlots.forEach(k => newSchedule[k] = "study");
      updateSchedule(newSchedule);
      setStep(4);
      return;
    }
    if (step === 4) {
      startAnalysis();
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 select-none">
      
      {/* Progress Bar */}
      {step < 5 && (
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
            <span className={step >= 1 ? "text-blue-600" : ""}>Info</span>
            <span className={step >= 2 ? "text-blue-600" : ""}>Goal</span>
            <span className={step >= 3 ? "text-blue-600" : ""}>Schedule</span>
            <span className={step >= 4 ? "text-blue-600" : ""}>Today</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* --- STEP 1: 기본 정보 --- */}
      {step === 1 && (
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in-up">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">기본 정보 설정</h2>
            <p className="text-gray-500 text-sm mt-1">학년과 집중할 과목을 선택해주세요.</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {["middle", "high"].map((type) => (
                  <button key={type} onClick={() => setInfo({ ...info, school: type as SchoolType })} className={`p-4 rounded-xl border-2 font-bold transition-all ${info.school === type ? "border-blue-600 bg-blue-50 text-blue-700 shadow-inner" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                    {type === "middle" ? "중학교" : "고등학교"}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">학년</label>
                  <div className="flex gap-1">{["1", "2", "3"].map((g) => (<button key={g} onClick={() => setInfo({ ...info, grade: g })} className={`flex-1 py-2.5 rounded-lg border-2 font-bold ${info.grade === g ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>{g}</button>))}</div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">학기</label>
                  <div className="flex gap-1">{["1", "2"].map((s) => (<button key={s} onClick={() => setInfo({ ...info, semester: s })} className={`flex-1 py-2.5 rounded-lg border-2 font-bold ${info.semester === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>{s}학기</button>))}</div>
                </div>
              </div>
            </div>
            <hr className="border-gray-100" />
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3 ml-1">어떤 과목을 공부할까요? <span className="text-gray-400 font-normal text-xs">(중복 가능)</span></label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {MAIN_SUBJECTS.map((subject) => {
                  const isSelected = info.subjects.includes(subject);
                  return (
                    <button key={subject} onClick={() => toggleSubject(subject)} className={`py-4 rounded-xl font-bold border-2 transition-all relative ${isSelected ? "bg-blue-600 border-blue-600 text-white shadow-lg transform scale-105" : "bg-white border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50"}`}>
                      {subject}
                      {isSelected && <Check className="w-4 h-4 absolute top-2 right-2 text-white/80" />}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setShowSubSubjects(!showSubSubjects)} className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 font-medium py-3 hover:bg-gray-50 rounded-lg transition-colors border border-dashed border-gray-300">
                {showSubSubjects ? "탐구 및 기타 과목 접기" : "탐구 및 기타 과목 선택하기"}
                {showSubSubjects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showSubSubjects && (
                <div className="mt-4 space-y-4 animate-fade-in bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {DETAIL_SUBJECTS.map((group) => (
                    <div key={group.category}>
                      <h4 className="text-xs font-bold text-gray-400 mb-2">{group.category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((subject) => {
                          const isSelected = info.subjects.includes(subject);
                          return (
                            <button key={subject} onClick={() => toggleSubject(subject)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isSelected ? "bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`}>
                              {subject}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 2: 공부 모드 (시험 날짜 개별 입력 수정) --- */}
      {step === 2 && (
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in-up">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">현재 목표는?</h2>
            <p className="text-gray-500 text-sm mt-1">시험 기간에는 과목별 일정을 관리합니다.</p>
          </div>
          <div className="space-y-4">
            <button onClick={() => setMode({ type: "routine" })} className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-start justify-between ${mode.type === "routine" ? "border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}>
              <div><div className="font-bold text-gray-900 text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-green-500" /> 평상시 루틴</div></div>
              {mode.type === "routine" && <Check className="w-6 h-6 text-blue-600" />}
            </button>
            <button onClick={() => setMode({ type: "exam" })} className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-start justify-between ${mode.type === "exam" ? "border-red-500 bg-red-50 shadow-md ring-1 ring-red-200" : "border-gray-200 hover:border-red-300"}`}>
              <div><div className="font-bold text-gray-900 text-lg flex items-center gap-2"><GraduationCap className="w-5 h-5 text-red-500" /> 시험 대비</div></div>
              {mode.type === "exam" && <Check className="w-6 h-6 text-red-600" />}
            </button>
            
            {/* [수정됨] 과목별 시험 날짜 입력 섹션 */}
            {mode.type === "exam" && (
              <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in space-y-3">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-extrabold text-red-600">과목별 시험 날짜</label>
                    <span className="text-xs text-gray-400 font-bold">최대 D-{maxDDay}일 남음</span>
                </div>
                
                {info.subjects.length > 0 ? (
                    <div className="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-200 max-h-60 overflow-y-auto custom-scrollbar">
                        {info.subjects.map(subject => {
                            const date = examDates[subject] || "";
                            const today = new Date(); today.setHours(0,0,0,0);
                            const target = date ? new Date(date) : null;
                            const diff = target ? Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

                            return (
                                <div key={subject} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                                    <span className="font-bold text-sm text-gray-700 ml-1">{subject}</span>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="date" 
                                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:border-red-500 focus:outline-none"
                                            value={date}
                                            onChange={(e) => setExamDates(prev => ({ ...prev, [subject]: e.target.value }))}
                                        />
                                        <span className={`text-[10px] w-12 text-center font-bold px-1.5 py-0.5 rounded ${diff !== null && diff >= 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                            {diff !== null ? (diff === 0 ? "D-Day" : diff > 0 ? `D-${diff}` : "종료") : "-"}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-4 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        선택한 과목이 없습니다.<br/>Step 1에서 과목을 선택해주세요.
                    </div>
                )}
                
                {isShortTerm && (
                  <p className="text-xs text-red-500 mt-1 font-bold text-center">⚡ 벼락치기 모드 (7일 이내)</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- STEP 3: 시간표 그리드 (심플 버전) --- */}
      {step === 3 && (
        <div className="bg-white max-w-xl w-full p-6 rounded-3xl shadow-xl space-y-4 animate-fade-in-up">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {mode.type === 'exam' ? `시험 대비 집중 스케줄` : '주간 루틴 설정'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
                {mode.type === 'exam' ? `가장 늦은 시험까지 D-${maxDDay}일 남았습니다.` : "드래그하여 공부 가능한 시간을 색칠하세요."}
            </p>
          </div>

          <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-xl">
            {mode.type === "exam" && !isShortTerm && (
              <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                <button onClick={() => setExamWeekTab(1)} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${examWeekTab === 1 ? 'bg-red-100 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>1주차</button>
                <button onClick={() => setExamWeekTab(2)} className={`flex-1 py-1.5 text-sm font-bold rounded-md transition-all ${examWeekTab === 2 ? 'bg-red-100 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>2주차</button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
               <button onClick={clearCurrentWeek} className="flex items-center justify-center gap-1 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 shadow-sm"><RefreshCcw className="w-3 h-3" /> 전체 비우기</button>
               <button onClick={fillCurrentWeek} className="flex items-center justify-center gap-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shadow-sm"><Maximize className="w-3 h-3" /> 전체 채우기</button>
            </div>
            
            <div className="flex justify-between items-center px-1 pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-2">확보: <span className="text-blue-600 text-lg font-black">{calculateTotalHours()}시간</span></span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div>공부 가능</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border rounded-sm"></div>불가능</div>
              </div>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden shadow-inner bg-white select-none">
            <div className="grid border-b bg-gray-50" style={{ gridTemplateColumns: `40px repeat(${displayDays.length}, 1fr)` }}>
              <div className="p-2 text-[10px] font-bold text-gray-400 text-center border-r flex items-center justify-center">Time</div>
              {displayDays.map((dayLabel, i) => (
                <div key={i} className={`p-2 text-xs font-bold text-center border-r last:border-r-0 ${mode.type === 'exam' ? 'text-red-600' : 'text-gray-700'}`}>
                  {dayLabel}
                </div>
              ))}
            </div>

            <div className="h-64 overflow-y-auto custom-scrollbar relative">
              {HOURS.map((hour) => (
                <div key={hour} className="grid h-8 border-b last:border-b-0" style={{ gridTemplateColumns: `40px repeat(${displayDays.length}, 1fr)` }}>
                  <div className="text-[10px] text-gray-400 font-medium flex items-center justify-center border-r bg-gray-50 sticky left-0">{hour}:00</div>
                  {displayDays.map((_, dayIdx) => {
                    const actual = getActualDayIdx(dayIdx);
                    const key = `${actual}-${hour}`;
                    const isSelected = selectedSlots.has(key);

                    return (
                      <div
                        key={key}
                        onMouseDown={() => handleMouseDown(dayIdx, hour)}
                        onMouseEnter={() => handleMouseEnter(dayIdx, hour)}
                        className={`cursor-pointer transition-colors duration-75 border-r last:border-r-0 ${isSelected ? "bg-blue-500 hover:bg-blue-400" : "bg-white hover:bg-gray-100"}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 4: 오늘의 진단 --- */}
      {step === 4 && (
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in-up">
           <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">오늘의 현실 진단</h2>
            <p className="text-gray-500 text-sm mt-1">
              {mode.type === 'exam' ? '설정한 스케줄에 맞춰 문제를 배달합니다.' : '오늘 공부할 계획을 구체화합니다.'}
            </p>
          </div>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 cursor-pointer bg-white group transition-colors">
              <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
              <p className="text-sm font-bold text-gray-700">틀렸거나 막힌 문제 업로드</p>
              <p className="text-xs text-gray-400 mt-1">AI가 취약 유형을 분석해 족보를 매칭합니다.</p>
            </div>
            
            {mode.type !== 'exam' && (
              <div>
                <label className="block text-sm font-extrabold text-gray-800 mb-2">오늘 남은 가용 시간</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input 
                    type="number" 
                    placeholder="90" 
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl font-black text-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-gray-900 bg-white placeholder:text-gray-300"
                    value={todayData.time} 
                    onChange={(e) => setTodayData({ ...todayData, time: e.target.value })} 
                  />
                  <span className="absolute right-4 top-4 text-gray-500 font-bold">분</span>
                </div>
              </div>
            )}

            {mode.type === 'exam' && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                   <CalendarCheck className="w-5 h-5 text-blue-600" />
                   <span className="font-bold text-blue-700">스케줄 자동 반영됨</span>
                </div>
                <p className="text-sm text-blue-600">
                  과목별 시험 날짜와 가용 시간을 고려하여<br/>최적의 학습량을 자동 배정합니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- 네비게이션 버튼 --- */}
      {step < 5 && (
        <div className="max-w-md w-full mt-6 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <button 
            onClick={handleNext}
            disabled={!canGoNext()}
            className="flex-1 bg-blue-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
          >
            {step === 4 ? "분석 시작하기" : "다음으로"}
            {step !== 4 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* --- STEP 5: AI 분석 중 --- */}
      {step === 5 && (
        <div className="text-center space-y-6 animate-fade-in">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Mirror AI가 분석 중입니다...</h2>
          <div className="space-y-3 text-gray-500">
            <p className="flex items-center justify-center gap-2">
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-xs font-bold">Data</span>
              {info.school === 'high' ? '고등학교' : '중학교'} {info.grade}학년 {info.semester}학기 족보 로딩...
            </p>
            <p>📐 {finalTime}분에 맞춰 문제 압축 (Morphing)...</p>
          </div>
        </div>
      )}

      {/* --- STEP 6: 최종 처방 --- */}
      {step === 6 && (
        <div className="max-w-6xl w-full space-y-6 animate-scale-in pb-10">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {info.grade}학년 {info.semester}학기 <span className="text-blue-600">Mirror Morphing</span> 솔루션
            </h2>
            <p className="text-gray-500">
              상위 1% 패턴을 기반으로, 당신의 가용시간 <strong>{finalTime}분</strong>에 맞춘 최적화 전략입니다.
            </p>
          </div>
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col h-full">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                   <div className={`p-2 rounded-lg ${mode.type === 'exam' ? 'bg-red-100' : 'bg-blue-100'}`}>
                     {mode.type === 'exam' ? <Flag className="w-5 h-5 text-red-600" /> : <Map className="w-5 h-5 text-blue-600" />}
                   </div>
                   <h3 className="font-bold text-gray-800 text-lg">
                     {mode.type === 'exam' ? `D-${maxDDay} 필승 전략 로드맵` : '이번 주 맞춤 커리큘럼'}
                   </h3>
                 </div>
                 <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">AI Generated</span>
               </div>
               
               <div className="flex-1 overflow-hidden">
                {mode.type === 'exam' ? (
                  <div className="space-y-4 relative">
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 z-0"></div>
                    <div className="relative z-10 flex gap-4 opacity-50">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-sm shrink-0 font-bold text-gray-500 text-sm">1</div>
                      <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="flex justify-between mb-1"><span className="text-xs font-bold text-gray-500">Phase 1</span><span className="text-xs font-bold text-gray-400">완료</span></div>
                        <p className="font-bold text-gray-700">교과서 및 부교재 개념 1회독</p>
                      </div>
                    </div>
                    <div className="relative z-10 flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center border-4 border-white shadow-lg shrink-0 text-white animate-pulse"><Target className="w-5 h-5" /></div>
                      <div className="flex-1 bg-white p-5 rounded-xl border-2 border-red-500 shadow-lg transform scale-102">
                        <div className="flex justify-between mb-2"><span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Phase 2 (현재 단계)</span><span className="text-xs font-bold text-red-600">진행 중</span></div>
                        <h4 className="font-bold text-lg text-gray-900 mb-1">고난도 기출 & 족보 분석</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-red-500" /> 우리 학교 기출 변형 (최근 3년)</li>
                          <li className="flex items-center gap-2"><Check className="w-3 h-3 text-red-500" /> 오답 유형 집중 클리닉</li>
                        </ul>
                      </div>
                    </div>
                    <div className="relative z-10 flex gap-4 opacity-60">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-4 border-gray-200 shadow-sm shrink-0 font-bold text-gray-400 text-sm">3</div>
                      <div className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 border-dashed">
                        <div className="flex justify-between mb-1"><span className="text-xs font-bold text-gray-500">Phase 3</span><span className="text-xs font-bold text-gray-400">예정</span></div>
                        <p className="font-bold text-gray-600">실전 모의고사 & 타임어택 훈련</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-4 h-full">
                    <div className="space-y-3">
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, idx) => {
                         const isToday = idx === 0; 
                         return (
                          <div key={day} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isToday ? 'bg-white shadow-md border border-blue-200 scale-102' : 'hover:bg-white hover:shadow-sm'}`}>
                            <div className={`w-12 py-2 rounded-lg text-center font-bold text-sm ${isToday ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{day}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-xs font-bold px-1.5 rounded ${idx % 2 === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>{idx % 2 === 0 ? "진도(Concept)" : "복습(Review)"}</span>
                                {isToday && <span className="text-[10px] font-bold text-red-500 animate-pulse">● Today</span>}
                              </div>
                              <p className={`text-sm font-semibold ${isToday ? 'text-gray-900' : 'text-gray-500'}`}>{idx % 2 === 0 ? "수학 I: 지수함수와 로그함수" : "지수함수 필수 유형 문제풀이"}</p>
                            </div>
                            <div className="text-right min-w-[60px]"><span className="text-xs font-bold text-gray-400 block">목표</span><span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{schedule[day] || 0}분</span></div>
                          </div>
                         )
                      })}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center px-2"><span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">Weekend</span><span className="text-sm text-gray-600">주간 오답 모의고사 + 취약점 보완</span></div>
                    </div>
                  </div>
                )}
               </div>
            </div>

            <div className="md:col-span-5 flex flex-col h-full">
              <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-200 flex flex-col relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex items-center gap-2 mb-6 relative z-10">
                  <div className="bg-white/20 p-2 rounded-lg"><ListTodo className="w-5 h-5 text-white" /></div>
                  <h3 className="font-bold text-lg">오늘의 미션 (Today)</h3>
                </div>
                <div className="flex-1 space-y-4 relative z-10">
                  <div className="bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-end mb-4 border-b border-white/20 pb-4">
                      <span className="text-blue-100 text-sm font-medium">확보 시간</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold">{finalTime}분</span>
                        <span className="text-xs text-blue-200 block">예상 성취도 +1.5%</span>
                      </div>
                    </div>
                    <ul className="space-y-0">
                      <li className="flex gap-4 pb-6 border-l-2 border-blue-400/30 pl-4 relative">
                        <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-blue-400 border-4 border-blue-600"></div>
                        <div><span className="text-xs font-bold text-blue-200 block mb-1">워밍업</span><p className="font-bold">기출 오답 복습</p></div>
                      </li>
                        <li className="flex gap-4 pl-4 relative">
                        <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-600"></div>
                        <div><span className="text-xs font-bold text-white bg-blue-500/50 px-2 py-0.5 rounded-full mb-1 inline-block">메인</span><p className="font-bold text-xl">필수 유형 10선 풀이</p></div>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-auto">
                    <Link href="/dashboard" className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-center block">시작하기</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}