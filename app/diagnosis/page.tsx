"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useStudy } from "../context/StudyContext";
import { 
  Loader2, Camera, Clock, Check, GraduationCap, BookOpen, 
  ChevronRight, ChevronLeft, Eraser, PenTool, RefreshCcw, 
  Maximize, Map, CalendarCheck, RefreshCw, ArrowRight,
  Flag, Trophy, Target, ListTodo, FileText, AlertCircle, 
  ChevronDown, ChevronUp, CheckCircle2, Calendar, BrainCircuit,
  ScanLine, FileSearch // OCR 아이콘 추가
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
  
  // --- Data States ---
  const [info, setInfo] = useState({ school: "" as SchoolType, grade: "", semester: "1", subjects: [] as string[] });
  const [mode, setMode] = useState<{ type: StudyMode; dDay: string }>({ type: "", dDay: "" });
  const [examDates, setExamDates] = useState<Record<string, string>>({});
  
  // Step 3: 성향
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // [NEW] Step 4: OCR 진단 상태
  const [ocrStatus, setOcrStatus] = useState<"idle" | "scanning" | "analyzing" | "done">("idle");
  const [ocrResult, setOcrResult] = useState<string>("");

  // Step 5: 시간표
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotSet>(new Set());
  const [examWeekTab, setExamWeekTab] = useState<1 | 2>(1); 
  const isDragging = useRef(false);
  const dragAction = useRef<"add" | "remove">("add"); 

  const [todayData, setTodayData] = useState({ time: "", image: null });
  const [showSubSubjects, setShowSubSubjects] = useState(false);

  // --- Constants ---
  const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); 
  const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const MAIN_SUBJECTS = ["국어", "수학", "영어"];
  const DETAIL_SUBJECTS = [
    { category: "과학 탐구", items: ["물리", "화학", "생명과학", "지구과학", "통합과학"] },
    { category: "사회/역사 탐구", items: ["한국사", "윤리", "지리", "역사", "일반사회", "통합사회"] },
    { category: "기타", items: ["정보", "제2외국어", "한문", "기가"] }
  ];

  // [Step 3] 성향 질문 (MBTI 스타일)
  const QUIZ_QUESTIONS = [
    { id: 1, question: "문제를 풀 때 나의 모습은?", options: [
      { value: "A", label: "빠르게 훑어보고 답을 선택한 뒤 넘어간다", desc: "'대충 맞겠지' 하는 직감적 풀이, 핵심 키워드 위주" },
      { value: "B", label: "완벽히 이해할 때까지 붙잡고 고민한다", desc: "이해 안 되면 못 넘어감, 한 문제에 10분 이상 소요" },
      { value: "C", label: "문제집을 펼치기까지가 제일 어렵다", desc: "시작하면 잘하는데 시작이 힘듦, 마감 직전 몰아서 함" }
    ]},
    { id: 2, question: "시험 공부를 할 때 나는?", options: [
      { value: "A", label: "여러 문제를 빠르게 풀면서 감을 익힌다", desc: "양치기 선호, 틀린 문제는 가볍게 패스" },
      { value: "B", label: "한 개념을 여러 자료로 비교하며 이해한다", desc: "교과서/인강/참고서 모두 확인, 개념 노트 정리" },
      { value: "C", label: "평소엔 안 하다가 시험 직전에 집중한다", desc: "시험 기간에만 도서관 행, 압박감을 즐김" }
    ]},
    { id: 3, question: "학습 후 복습할 때 나는?", options: [
      { value: "A", label: "복습은 잘 안 한다. 한 번 푼 건 끝", desc: "'이건 아니까 패스', 실수도 '아차' 하고 끝냄" },
      { value: "B", label: "틀린 문제를 완전히 이해할 때까지 파고든다", desc: "원인 분석, 관련 개념 확인, 복습 노트 작성" },
      { value: "C", label: "복습 계획은 세우지만 실천은 잘 안 된다", desc: "'내일부터 해야지' 미루다가 시험 직전 벼락치기" }
    ]}
  ];

  // --- Helpers & Logic ---
  const toggleSubject = (subject: string) => {
    setInfo(prev => {
      const exists = prev.subjects.includes(subject);
      return { ...prev, subjects: exists ? prev.subjects.filter(s => s !== subject) : [...prev.subjects, subject] };
    });
  };

  const maxDDay = useMemo(() => {
    if (mode.type !== 'exam') return 0;
    const today = new Date(); today.setHours(0,0,0,0);
    let maxDiff = 0;
    Object.values(examDates).forEach(dateStr => {
      if (!dateStr) return;
      const target = new Date(dateStr); target.setHours(0,0,0,0);
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > maxDiff) maxDiff = diffDays;
    });
    return maxDiff;
  }, [examDates, mode.type]);

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

  const isShortTerm = mode.type === "exam" && maxDDay > 0 && maxDDay <= 7;
  const displayDays = useMemo(() => {
    if (mode.type === 'routine') return WEEK_DAYS;
    const days = [];
    if (isShortTerm || examWeekTab === 1) {
        const limit = isShortTerm ? maxDDay : 7;
        for (let i = 0; i < limit; i++) {
            const d = maxDDay - i;
            days.push(d === 0 ? "D-Day" : `D-${d}`);
        }
        while (days.length < 7) days.push("-");
    } else {
        for (let i = 7; i < 14; i++) {
            const d = maxDDay - i;
            if (d < 0) days.push("-"); else days.push(d === 0 ? "D-Day" : `D-${d}`);
        }
    }
    return days;
  }, [mode.type, maxDDay, isShortTerm, examWeekTab]);

  const getActualDayIdx = (dayIdx: number) => (mode.type === "exam" && !isShortTerm && examWeekTab === 2) ? dayIdx + 7 : dayIdx;

  const updateSlot = (dayIdx: number, hour: number, action: "add" | "remove") => {
    const actual = getActualDayIdx(dayIdx);
    const key = `${actual}-${hour}`;
    setSelectedSlots(prev => {
      const next = new Set(prev);
      if (action === "add") next.add(key); else next.delete(key);
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
    const daysToFill = mode.type === 'exam' ? Math.min(maxDDay, 14) : 7;
    for (let d = 0; d < daysToFill; d++) for (let h of HOURS) next.add(`${d}-${h}`);
    setSelectedSlots(next);
  };
  const calculateTotalHours = () => selectedSlots.size;

  // [NEW] OCR 시뮬레이션 함수
  const handleFileUpload = () => {
    setOcrStatus("scanning");
    // 1. 스캔 중 애니메이션 (2초)
    setTimeout(() => setOcrStatus("analyzing"), 2000);
    // 2. 분석 완료 (4.5초 후)
    setTimeout(() => {
      setOcrStatus("done");
      setOcrResult("풀이 과정이 논리적이나, 중간 식을 생략하여 계산 실수가 발생할 확률이 30% 높습니다.");
    }, 4500);
  };

  const startAnalysis = () => {
    setStep(6);
    setTimeout(() => setStep(7), 3000);
  };

  const canGoNext = () => {
    if (step === 1) return info.school && info.grade && info.semester && info.subjects.length > 0;
    if (step === 2) {
        if (mode.type === "routine") return true;
        if (mode.type === "exam") return info.subjects.some(sub => !!examDates[sub]);
        return false;
    }
    if (step === 3) return Object.keys(answers).length === 3;
    if (step === 4) return ocrStatus === "done"; // OCR 분석 완료되어야 함
    if (step === 5) return selectedSlots.size > 0;
    return false;
  };

  const getTodayExamTime = () => "180"; 
  const finalTime = mode.type === 'exam' ? getTodayExamTime() : todayData.time;

  const handleNext = () => {
    if (step === 5) { // 시간표 저장 단계
      const newSchedule: Record<string, "study" | "fixed"> = {};
      selectedSlots.forEach(k => newSchedule[k] = "study");
      updateSchedule(newSchedule);
      startAnalysis();
      return;
    }
    setStep(step + 1);
  };

  const getAnalysisText = () => {
    const types = Object.values(answers);
    const countA = types.filter(t => t === 'A').length;
    const countB = types.filter(t => t === 'B').length;
    if (countA >= 2) return "직관적이고 빠른 '스피드 러너' 타입";
    if (countB >= 2) return "깊이 있는 이해를 추구하는 '딥 다이버' 타입";
    return "집중력이 폭발하는 '벼락치기 마스터' 타입";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 select-none">
      
      {/* Progress Bar (총 7단계 중 1~6단계 표시) */}
      {step < 6 && (
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
            <span className={step >= 1 ? "text-blue-600" : ""}>Info</span>
            <span className={step >= 2 ? "text-blue-600" : ""}>Goal</span>
            <span className={step >= 3 ? "text-blue-600" : ""}>Style</span>
            <span className={step >= 4 ? "text-blue-600" : ""}>Solving</span> {/* NEW: Solving 단계 */}
            <span className={step >= 5 ? "text-blue-600" : ""}>Time</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${(step / 5) * 100}%` }}></div>
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

      {/* --- STEP 2: 목표 (시험 날짜) --- */}
      {step === 2 && (
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in-up">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">현재 목표는?</h2>
            <p className="text-gray-500 text-sm mt-1">시험 기간에는 과목별 일정을 관리합니다.</p>
          </div>
          <div className="space-y-4">
            <button onClick={() => setMode({ type: "routine", dDay: "" })} className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-start justify-between ${mode.type === "routine" ? "border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-200" : "border-gray-200 hover:border-blue-300"}`}>
              <div><div className="font-bold text-gray-900 text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-green-500" /> 평상시 루틴</div></div>
              {mode.type === "routine" && <Check className="w-6 h-6 text-blue-600" />}
            </button>
            <button onClick={() => setMode({ type: "exam", dDay: "" })} className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-start justify-between ${mode.type === "exam" ? "border-red-500 bg-red-50 shadow-md ring-1 ring-red-200" : "border-gray-200 hover:border-red-300"}`}>
              <div><div className="font-bold text-gray-900 text-lg flex items-center gap-2"><GraduationCap className="w-5 h-5 text-red-500" /> 시험 대비</div></div>
              {mode.type === "exam" && <Check className="w-6 h-6 text-red-600" />}
            </button>
            
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
                    <div className="text-center py-4 text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">선택한 과목이 없습니다.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- STEP 3: 학습 성향 (MBTI) --- */}
      {step === 3 && (
        <div className="bg-white max-w-xl w-full p-8 rounded-3xl shadow-xl space-y-8 animate-fade-in-up">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">문제 풀이 스타일</h2>
            <p className="text-gray-500 text-sm mt-1">평소 습관을 솔직하게 알려주세요.</p>
          </div>
          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-3">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">Q{q.id}</span>
                  {q.question}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAnswers({ ...answers, [q.id]: opt.value })}
                      className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                        answers[q.id] === opt.value
                          ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                          : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <div className={`font-bold text-base mb-1 ${answers[q.id] === opt.value ? "text-blue-700" : "text-gray-800"}`}>{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.desc}</div>
                      </div>
                      {answers[q.id] === opt.value && <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- [NEW] STEP 4: 풀이 습관 진단 (OCR) --- */}
      {step === 4 && (
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in-up">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">풀이 습관 진단</h2>
            <p className="text-gray-500 text-sm mt-1">
              {ocrStatus === "done" 
                ? "진단이 완료되었습니다!" 
                : "평소에 푼 연습장이나 문제집을 찍어주세요."}
            </p>
          </div>
          
          <div className="relative">
            {/* 1. 업로드 전 */}
            {ocrStatus === "idle" && (
              <div 
                onClick={handleFileUpload}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                </div>
                <p className="font-bold text-gray-600">사진 업로드하기</p>
                <p className="text-xs text-gray-400 mt-1">또는 파일을 여기로 드래그하세요</p>
              </div>
            )}

            {/* 2. 스캔 및 분석 중 */}
            {(ocrStatus === "scanning" || ocrStatus === "analyzing") && (
              <div className="border-2 border-blue-100 rounded-2xl p-10 flex flex-col items-center justify-center bg-blue-50 relative overflow-hidden">
                <ScanLine className="w-16 h-16 text-blue-500 animate-pulse mb-4" />
                {/* 레이저 스캔 효과 애니메이션 */}
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                
                <p className="font-bold text-blue-700 animate-pulse">
                  {ocrStatus === "scanning" ? "풀이 과정 스캔 중..." : "AI가 습관을 분석 중입니다..."}
                </p>
                <p className="text-xs text-blue-400 mt-1">잠시만 기다려주세요</p>
              </div>
            )}

            {/* 3. 분석 완료 */}
            {ocrStatus === "done" && (
              <div className="border-2 border-green-100 rounded-2xl p-6 bg-green-50 animate-fade-in">
                <div className="flex items-center gap-2 mb-3">
                   <FileSearch className="w-5 h-5 text-green-600" />
                   <h3 className="font-bold text-green-800">분석 결과</h3>
                </div>
                <p className="text-sm text-green-700 font-medium leading-relaxed">
                  "{ocrResult}"
                </p>
                <div className="mt-4 flex gap-2">
                   <span className="bg-white px-2 py-1 rounded text-[10px] font-bold text-green-600 border border-green-200">#논리적_전개</span>
                   <span className="bg-white px-2 py-1 rounded text-[10px] font-bold text-red-500 border border-red-200">#계산_실수_주의</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- STEP 5: 시간표 그리드 (심플 버전) --- */}
      {step === 5 && (
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

      {/* --- 네비게이션 버튼 --- */}
      {step < 6 && (
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
            {step === 5 ? "분석 시작하기" : "다음으로"}
            {step !== 5 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* --- STEP 6: AI 분석 중 --- */}
      {step === 6 && (
        <div className="text-center space-y-6 animate-fade-in">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Mirror AI가 분석 중입니다...</h2>
          <div className="space-y-3 text-gray-500">
            <p>🧠 학습 성향 분석: {getAnalysisText()}</p>
            <p>📝 풀이 습관: {ocrResult || '분석 중...'}</p>
            <p>📐 하루 평균 가용 시간: {Math.round((selectedSlots.size * 60) / 7)}분</p>
          </div>
        </div>
      )}

      {/* --- STEP 7: 최종 처방 --- */}
      {step === 7 && (
        <div className="max-w-6xl w-full space-y-6 animate-scale-in pb-10">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {info.grade}학년 {info.semester}학기 <span className="text-blue-600">Mirror Morphing</span> 솔루션
            </h2>
            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <BrainCircuit className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">{getAnalysisText()}</span>
            </div>
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
                            <div className="text-right min-w-[60px]"><span className="text-xs font-bold text-gray-400 block">목표</span><span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{finalTime}분</span></div>
                          </div>
                         )
                      })}
                    </div>
                  </div>
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