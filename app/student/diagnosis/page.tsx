"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useStudy } from "../../context/StudyContext";
import { 
  Loader2, Camera, Check, 
  ChevronRight, ChevronLeft, RefreshCcw, 
  Maximize, Map, ListTodo, FileSearch, 
  ChevronDown, ChevronUp, CheckCircle2, ScanLine, 
  School, User, FileText, BrainCircuit, AlertCircle, Hash
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase"; 
import Tesseract from 'tesseract.js'; 

// --- [타입 정의] ---
type TimeSlotSet = Set<string>;

type PlanItem = {
  day: string;
  isToday: boolean;
  type: "Concept" | "Review";
  subject: string;
  topic: string;
  time: number;
};

// 분석 결과 타입 (내용 + 태그)
interface AnalysisResult {
  content: string;
  tags: string[];
}

// --- [상수 데이터] ---
const COGNITIVE_TYPES = {
  A: "SPEED_FIRST",
  B: "PRECISION_FIRST",
  C: "BURST_STUDY"
};

const HOURS = Array.from({ length: 17 }, (_, i) => i + 8); 
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MAIN_SUBJECTS = ["국어", "수학", "영어"];
const DETAIL_SUBJECTS = [
  { category: "과학 탐구", items: ["물리", "화학", "생명과학", "지구과학", "통합과학"] },
  { category: "사회/역사 탐구", items: ["한국사", "윤리", "지리", "역사", "일반사회", "통합사회"] },
  { category: "기타", items: ["정보", "제2외국어", "한문", "기가"] }
];

const SUBJECT_KEYWORDS: Record<string, string[]> = {
  "국어": ["다음", "글", "문단", "화자", "윗글", "적절한", "가)", "나)", "필자", "문학", "비문학"],
  "수학": ["함수", "값", "구하시오", "방정식", "실수", "그림", "x", "y", "=", "+", "-", "미분", "적분"],
  "영어": ["The", "What", "is", "passage", "following", "Reading", "According", "grammar", "paragraph"]
};

// 백엔드 전송용 과목명 매핑 (한글 -> Enum)
const SUBJECT_ENUM_MAP: Record<string, string> = {
  "국어": "KOREAN",
  "수학": "MATH",
  "영어": "ENGLISH",
  "과학": "SCIENCE", 
  "사회": "SOCIAL"
};

// 백엔드 응답용 역매핑 함수 (Enum -> 한글)
const getSubjectNameFromEnum = (enumKey: string) => {
  return Object.keys(SUBJECT_ENUM_MAP).find(key => SUBJECT_ENUM_MAP[key] === enumKey) || enumKey;
};

const CURRICULUM_DATA: Record<string, Record<string, string[]>> = {
  "1-1": {
    "국어": ["고전 시가 이해", "문법 요소의 탐구", "비문학 독해 원리"],
    "수학": ["다항식의 연산", "나머지 정리와 인수분해", "복소수와 이차방정식"],
    "영어": ["구문 독해 기초", "주제 찾기 유형 연습", "필수 어휘 500"],
    "한국사": ["선사 문화와 국가의 형성", "고대의 사회와 경제", "고려의 통치 체제"],
    "통합과학": ["물질의 규칙성과 결합", "역학적 시스템", "지구 시스템"],
  },
  "2-1": {
    "국어": ["문학의 수용과 생산", "독서의 본질", "화법과 작문 기초"],
    "수학": ["지수함수와 로그함수", "삼각함수의 그래프", "수열의 극한"],
    "영어": ["빈칸 추론 마스터", "순서 배열 논리", "수능특강 어휘"],
    "물리": ["힘과 운동", "에너지와 열", "시간과 공간"],
    "화학": ["화학의 첫걸음", "원자의 세계", "화학 결합"],
  },
  "3-1": {
    "국어": ["수능특강 문학 분석", "실전 모의고사 풀이", "EBS 연계 독서"],
    "수학": ["미분가능성과 연속성", "적분법 활용", "확률과 통계 심화"],
    "영어": ["고난도 빈칸 공략", "실전 모의고사 1회", "장문 독해 전략"],
    "생명과학": ["생명과학의 이해", "세포와 생명의 연속성", "항상성과 몸의 조절"],
  }
};

const USER_TYPES_INFO = {
  A: { label: "스키마 오버로더", desc: "직관적이고 빠른 '스피드 러너'" },
  B: { label: "코그니티브 터널러", desc: "깊이 있는 이해를 추구하는 '딥 다이버'" },
  C: { label: "도파민 디스카운터", desc: "집중력이 폭발하는 '벼락치기 마스터'" }
};

const QUIZ_QUESTIONS = [
  { id: 1, question: "문제를 풀 때 나의 모습은?", options: [{ value: "A", label: "빠르게 훑어보고 답을 선택한 뒤 넘어간다", desc: "'대충 맞겠지' 하는 직감적 풀이, 핵심 키워드 위주" }, { value: "B", label: "완벽히 이해할 때까지 붙잡고 고민한다", desc: "이해 안 되면 못 넘어감, 한 문제에 10분 이상 소요" }, { value: "C", label: "문제집을 펼치기까지가 제일 어렵다", desc: "시작하면 잘하는데 시작이 힘듦, 마감 직전 몰아서 함" }]},
  { id: 2, question: "시험 공부를 할 때 나는?", options: [{ value: "A", label: "여러 문제를 빠르게 풀면서 감을 익힌다", desc: "양치기 선호, 틀린 문제는 가볍게 패스" }, { value: "B", label: "한 개념을 여러 자료로 비교하며 이해한다", desc: "교과서/인강/참고서 모두 확인, 개념 노트 정리" }, { value: "C", label: "평소엔 안 하다가 시험 직전에 집중한다", desc: "시험 기간에만 도서관 행, 압박감을 즐김" }]},
  { id: 3, question: "학습 후 복습할 때 나는?", options: [{ value: "A", label: "복습은 잘 안 한다. 한 번 푼 건 끝", desc: "'이건 아니까 패스', 실수도 '아차' 하고 끝냄" }, { value: "B", label: "틀린 문제를 완전히 이해할 때까지 파고든다", desc: "원인 분석, 관련 개념 확인, 복습 노트 작성" }, { value: "C", label: "복습 계획은 세우지만 실천은 잘 안 된다", desc: "'내일부터 해야지' 미루다가 시험 직전 벼락치기" }]},
  { id: 4, question: "계획대로 공부가 안 될 때 나는?", options: [{ value: "A", label: "유연하게 넘기고 다른 과목부터 한다", desc: "융통성 있음, 계획 변경이 빠름" }, { value: "B", label: "못 지킨 부분 때문에 스트레스 받는다", desc: "완벽주의, 하나 밀리면 와르르 무너짐" }, { value: "C", label: "에라 모르겠다 하고 놀아버린다", desc: "포기가 빠름, 기분파" }]}
];

export default function DiagnosisPage() {
  const { updateSchedule, updateUserInfo } = useStudy(); 
  const router = useRouter();
  
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false); 
  
  // 사용자 정보
  const [info, setInfo] = useState({ 
    name: "", 
    school: "high", 
    grade: "", 
    semester: "1", 
    subjects: [] as string[] 
  });
  
  // 퀴즈 답안
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // OCR 관련 상태
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>(""); 
  const [subjectImages, setSubjectImages] = useState<Record<string, string>>({}); 
  
  // 최종 분석 결과 (내용 + 태그)
  const [ocrAnalysis, setOcrAnalysis] = useState<Record<string, AnalysisResult>>({}); 
  const [ocrStatus, setOcrStatus] = useState<"idle" | "scanning" | "analyzing" | "done">("idle");
  const [ocrResult, setOcrResult] = useState<string>(""); 

  // 서버 전송용 파일 리스트
  const [fileObjects, setFileObjects] = useState<File[]>([]); 
  const [fileSubjects, setFileSubjects] = useState<string[]>([]); 

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 시간표 관련 상태
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotSet>(new Set());
  const [weeklyPlan, setWeeklyPlan] = useState<PlanItem[]>([]);
  const isDragging = useRef(false);
  const dragAction = useRef<"add" | "remove">("add"); 
  const [showSubSubjects, setShowSubSubjects] = useState(false);

  // 주요 과목 정렬 및 필터링
  const selectedMainSubjects = useMemo(() => {
    const filtered = info.subjects.filter(sub => MAIN_SUBJECTS.includes(sub));
    return filtered.sort((a, b) => {
      return MAIN_SUBJECTS.indexOf(a) - MAIN_SUBJECTS.indexOf(b);
    });
  }, [info.subjects]);

  const hasMainSubject = selectedMainSubjects.length > 0;

  useEffect(() => {
    if (step === 3 && selectedMainSubjects.length > 0 && !activeSubjectTab) {
      setActiveSubjectTab(selectedMainSubjects[0]);
    }
  }, [step, selectedMainSubjects, activeSubjectTab]);

  // --- [이벤트 핸들러] ---
  const toggleSubject = (subject: string) => { setInfo(prev => { const exists = prev.subjects.includes(subject); return { ...prev, subjects: exists ? prev.subjects.filter(s => s !== subject) : [...prev.subjects, subject] }; }); };
  const updateSlot = (dayIdx: number, hour: number, action: "add" | "remove") => { const key = `${dayIdx}-${hour}`; setSelectedSlots(prev => { const next = new Set(prev); if (action === "add") next.add(key); else next.delete(key); return next; }); };
  const handleMouseDown = (dayIdx: number, hour: number) => { isDragging.current = true; const key = `${dayIdx}-${hour}`; dragAction.current = selectedSlots.has(key) ? "remove" : "add"; updateSlot(dayIdx, hour, dragAction.current); };
  const handleMouseEnter = (dayIdx: number, hour: number) => { if (!isDragging.current) return; updateSlot(dayIdx, hour, dragAction.current); };
  useEffect(() => { const onUp = () => { isDragging.current = false; }; window.addEventListener("mouseup", onUp); return () => window.removeEventListener("mouseup", onUp); }, []);
  const clearCurrentWeek = () => setSelectedSlots(new Set());
  const fillCurrentWeek = () => { const next = new Set<string>(); for (let d = 0; d < 7; d++) { for (let h of HOURS) next.add(`${d}-${h}`); } setSelectedSlots(next); };
  const calculateTotalHours = () => selectedSlots.size;
  
  const generateWeeklyPlan = () => {
    const key = `${info.grade}-${info.semester}`; 
    const dataSet = CURRICULUM_DATA[key] || CURRICULUM_DATA["1-1"]; 
    const activeDaysIndex = new Set<number>();
    const timePerDay: Record<number, number> = {}; 
    selectedSlots.forEach(slot => { const [dayStr] = slot.split("-"); const dayIdx = parseInt(dayStr); activeDaysIndex.add(dayIdx); timePerDay[dayIdx] = (timePerDay[dayIdx] || 0) + 60; });
    const sortedDays = Array.from(activeDaysIndex).sort((a, b) => a - b);
    if (sortedDays.length === 0) return; 
    const newPlan: PlanItem[] = sortedDays.map((dayIdx, index) => {
      const dayName = WEEK_DAYS[dayIdx];
      const subject = info.subjects.length > 0 ? info.subjects[index % info.subjects.length] : "자습";
      const topics = dataSet[subject] || ["기초 개념 학습", "심화 문제 풀이", "오답 노트 정리"];
      const topic = topics[index % topics.length];
      return { day: dayName, isToday: index === 0, type: index % 2 === 0 ? "Concept" : "Review", subject: subject, topic: topic, time: timePerDay[dayIdx] };
    });
    setWeeklyPlan(newPlan);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  // --- [OCR 핸들러] ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSubjectTab) return;

    setOcrStatus("scanning"); 

    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'kor+eng',
        { logger: m => console.log("[Tesseract Progress]", m) }
      );

      console.log(`📸 [${activeSubjectTab}] OCR 원본 추출 텍스트:`, text);

      const keywords = SUBJECT_KEYWORDS[activeSubjectTab] || [];
      const isMatch = keywords.some(keyword => text.includes(keyword));

      const successLogic = () => {
        setOcrStatus("analyzing");
        setTimeout(() => {
          setOcrStatus("done");
          setSubjectImages(prev => ({ ...prev, [activeSubjectTab]: "uploaded" }));
          setOcrResult("분석 준비 완료"); 
        }, 1000);
        
        setFileObjects(prev => [...prev, file]);
        setFileSubjects(prev => [...prev, activeSubjectTab]);
      };

      if (isMatch) {
        console.log("✅ 키워드 매칭 성공!");
        successLogic();
      } else {
        console.warn("⚠️ 키워드 매칭 실패");
        setOcrStatus("idle");
        
        const previewText = text.replace(/\s+/g, ' ').slice(0, 50);
        const forcePass = window.confirm(
          `⚠️ OCR이 '${activeSubjectTab}' 키워드를 찾지 못했습니다.\n\n` +
          `[인식된 내용 일부]\n"${previewText}..."\n\n` +
          `그래도 '${activeSubjectTab}' 문제가 맞다면 [확인]을 눌러 진행하세요.`
        );

        if (forcePass) {
            successLogic();
        } else {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
      }

    } catch (error) {
      console.error("OCR Error:", error);
      setOcrStatus("idle");
      alert("이미지 분석 중 오류가 발생했습니다.");
    }
  };

  const startAnalysis = () => { setStep(5); generateWeeklyPlan(); setTimeout(() => setStep(6), 3000); };
  const calculateUserType = (): "A" | "B" | "C" => { const counts = { A: 0, B: 0, C: 0 }; Object.values(answers).forEach((val) => { if (val === 'A' || val === 'B' || val === 'C') { counts[val]++; } }); const max = Math.max(counts.A, counts.B, counts.C); if (counts.B === max) return "B"; if (counts.C === max) return "C"; return "A"; };
  const getAnalysisText = () => USER_TYPES_INFO[calculateUserType()].desc;

  // --- [서버 전송 및 분석 로직] ---
  const saveAllData = async () => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession() ;
      const accessToken = session?.access_token;
      const userId = session?.user?.id;

      if (!userId || !accessToken) {
        alert("로그인이 필요합니다.");
        router.push('/login');
        return false;
      }

      const jsonHeaders = { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${accessToken}` 
      };

      // 1️⃣ 기본 정보 저장
      await fetch("https://mirror-backend-5j11.onrender.com/setup/basic-info", { 
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({
          user_id: userId,
          student_name: info.name,
          school_grade: parseInt(info.grade), 
          semester: parseInt(info.semester), 
          subjects: info.subjects
        }),
      });

      updateUserInfo({
        name: info.name,
        grade: info.grade,
        semester: info.semester,
        subjects: info.subjects
      });

      // 2️⃣ [수정됨] 시간표(Routine) 저장 (명세서 반영)
      const routineData: any[] = [];
      const slotsArray = Array.from(selectedSlots).sort(); 
      
      const dayMap: Record<number, number[]> = {}; 
      slotsArray.forEach(slot => {
          const [d, h] = slot.split("-").map(Number);
          if (!dayMap[d]) dayMap[d] = [];
          dayMap[d].push(h);
      });

      // 요일별 연속 시간 병합 로직
      Object.entries(dayMap).forEach(([dayIdxStr, hours]) => {
          const dayIdx = parseInt(dayIdxStr);
          const dayCode = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][dayIdx];
          
          hours.sort((a, b) => a - b); 

          let start = hours[0];
          let end = hours[0];

          for (let i = 1; i < hours.length; i++) {
              if (hours[i] === end + 1) {
                  end = hours[i]; // 연속됨
              } else {
                  // 끊김 -> 저장
                  routineData.push({
                      day_of_week: dayCode,
                      start_time: `${String(start).padStart(2, '0')}:00`,
                      end_time: `${String(end + 1).padStart(2, '0')}:00`, // 끝 시간은 +1
                      total_minutes: (end - start + 1) * 60
                  });
                  start = hours[i];
                  end = hours[i];
              }
          }
          // 마지막 블록 저장
          routineData.push({
              day_of_week: dayCode,
              start_time: `${String(start).padStart(2, '0')}:00`,
              end_time: `${String(end + 1).padStart(2, '0')}:00`,
              total_minutes: (end - start + 1) * 60
          });
      });

      console.log("🚀 [시간표 전송 데이터]:", routineData);

      // API 전송 (user_id 사용)
      const routineRes = await fetch("https://mirror-backend-5j11.onrender.com/routines", { 
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({
            user_id: userId, // 👈 명세서에 맞게 user_id 사용
            routines: routineData
        }),
      });
      
      if (!routineRes.ok) {
          const err = await routineRes.json();
          console.warn("⚠️ 시간표 저장 실패:", err);
      } else {
          console.log("✅ 시간표 저장 성공");
      }

      // 3️⃣ 성향 진단 저장
      const cognitiveType = COGNITIVE_TYPES[calculateUserType()];
      await fetch("https://mirror-backend-5j11.onrender.com/setup/style-quiz", { 
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ user_id: userId, cognitive_type: cognitiveType }),
      });

      // 4️⃣ [이미지 일괄 전송] 및 [분석 결과 수신]
      if (fileObjects.length > 0) {
        const formData = new FormData();
        formData.append("user_id", userId);
        
        fileObjects.forEach((file) => formData.append("files", file));
        fileSubjects.forEach((sub) => {
          const enumName = SUBJECT_ENUM_MAP[sub] || "ETC";
          formData.append("subjects", enumName);
        });

        const ocrRes = await fetch("https://mirror-backend-5j11.onrender.com/setup/solving-image", { 
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}` },
            body: formData
        });
        
        if (!ocrRes.ok) {
            console.warn("OCR 서버 저장 실패");
        } else {
            const responseData = await ocrRes.json();
            
            if (responseData.success && responseData.data) {
                console.log("✅ OCR 분석 결과 수신:", responseData.data);
                
                const newAnalysisData: Record<string, AnalysisResult> = {};
                
                responseData.data.forEach((item: any) => {
                    const koreanSubject = getSubjectNameFromEnum(item.subject);
                    newAnalysisData[koreanSubject] = {
                      content: item.extracted_content,
                      tags: item.detected_tags || [] 
                    };
                });

                setOcrAnalysis(newAnalysisData);
            }
        }
      }

      console.log("✅ 모든 데이터 저장 완료");
      return true;

    } catch (error) {
      console.error("Save Error:", error);
      alert("데이터 저장 중 오류가 발생했습니다.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) { setStep(2); return; }
    if (step === 2) { if (!hasMainSubject) { setStep(4); } else { setStep(3); } return; }
    if (step === 3) { setStep(4); return; }
    if (step === 4) { 
      updateSchedule({}); 
      const success = await saveAllData(); 
      if (success) startAnalysis(); 
      return; 
    }
    setStep(step + 1);
  };

  const handleBack = async () => {
      if (step === 1) {
        const ok = window.confirm("역할 선택 화면으로 돌아가시겠습니까?");
        if (ok) {
           const { data: { session } } = await supabase.auth.getSession();
           if (session?.user) {
             await supabase.from('users').update({ role: null }).eq('id', session.user.id);
             router.replace('/onboarding/role');
           }
        }
        return;
      }
      if (step === 4 && !hasMainSubject) { setStep(2); } else { setStep(step - 1); }
  };

  const canGoNext = () => {
    if (step === 1) return info.name.trim().length > 0 && info.grade && info.semester && info.subjects.length > 0;
    if (step === 2) return Object.keys(answers).length === 4; 
    if (step === 3) return Object.keys(subjectImages).length > 0; 
    if (step === 4) return selectedSlots.size > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 select-none">
      
      {/* Progress Bar */}
      {step < 5 && (
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
            <span className={step >= 1 ? "text-blue-600" : ""}>Info</span>
            <span className={step >= 2 ? "text-blue-600" : ""}>Style</span>
            <span className={step >= 3 ? (hasMainSubject ? "text-blue-600" : "text-gray-300 line-through decoration-2") : ""}>Solving</span>
            <span className={step >= 4 ? "text-blue-600" : ""}>Time</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* --- STEP 1: Basic Info (누락된 부분 복구됨) --- */}
      {step === 1 && (
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in-up">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full mb-3">
              <School className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">고등학교 학습 진단</h2>
            <p className="text-gray-500 text-sm mt-1">학생 정보와 집중할 과목을 선택해주세요.</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 flex items-center gap-1">
                <User className="w-3 h-3" /> 이름 (실명)
              </label>
              <input 
                type="text" 
                value={info.name}
                onChange={(e) => setInfo({...info, name: e.target.value})}
                placeholder="홍길동"
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none focus:bg-blue-50/30 font-bold text-gray-900 placeholder-gray-300 transition-colors"
              />
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">학년</label>
                  <div className="flex gap-1">{["1", "2", "3"].map((g) => (<button key={g} onClick={() => setInfo({ ...info, grade: g })} className={`flex-1 py-3 rounded-lg border-2 font-bold ${info.grade === g ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>{g}학년</button>))}</div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">학기</label>
                  <div className="flex gap-1">{["1", "2"].map((s) => (<button key={s} onClick={() => setInfo({ ...info, semester: s })} className={`flex-1 py-3 rounded-lg border-2 font-bold ${info.semester === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>{s}학기</button>))}</div>
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
              
              {/* [복구됨] 탐구 과목 선택 아코디언 버튼 및 리스트 */}
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

      {/* --- STEP 2: Study Style Quiz --- */}
      {step === 2 && (
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
                      {answers[q.id] === opt.value && <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- STEP 3: OCR Diagnosis --- */}
      {step === 3 && hasMainSubject && (
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in-up">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">풀이 습관 진단</h2>
            <p className="text-gray-500 text-sm mt-1">
              {ocrStatus === "done" ? "분석이 완료되었습니다!" : "과목별 문제 풀이 사진을 올려주세요."}
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl">
            {selectedMainSubjects.map((subject) => {
              const isActive = activeSubjectTab === subject;
              const isDone = subjectImages[subject] === "uploaded";
              return (
                <button
                  key={subject}
                  onClick={() => { setActiveSubjectTab(subject); setOcrStatus(isDone ? "done" : "idle"); }}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-1
                    ${isActive ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}
                  `}
                >
                  {subject}
                  {isDone && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                </button>
              );
            })}
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="relative min-h-[300px]">
            {subjectImages[activeSubjectTab] === "uploaded" && ocrStatus === "done" ? (
                <div className="border-2 border-green-100 rounded-2xl p-6 bg-green-50 animate-fade-in h-full flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 animate-bounce-subtle">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-xl text-green-800 mb-2">{activeSubjectTab} 분석 완료</h3>
                <p className="text-sm text-green-700 font-medium leading-relaxed mb-6">
                  풀이 습관 데이터가 저장되었습니다.<br/>
                  <span className="font-bold underline">최종 리포트</span>에서 결과를 확인하세요!
                </p>
                <button 
                  onClick={() => {
                      setSubjectImages(prev => { const n = {...prev}; delete n[activeSubjectTab]; return n; });
                      setOcrStatus("idle");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs text-gray-400 underline hover:text-gray-600"
                >
                  다른 사진으로 다시 올리기
                </button>
              </div>
            ) : (
                <>
                    {(ocrStatus === "idle") && (
                    <div 
                        onClick={triggerFileInput} 
                        className="h-full border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <Camera className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                        </div>
                        <p className="font-bold text-gray-600">{activeSubjectTab} 풀이 사진</p>
                        <p className="text-xs text-gray-400 mt-1">클릭하여 업로드 (OCR 자동 검사)</p>
                    </div>
                    )}

                    {(ocrStatus === "scanning" || ocrStatus === "analyzing") && (
                    <div className="h-full border-2 border-blue-100 rounded-2xl p-10 flex flex-col items-center justify-center bg-blue-50 relative overflow-hidden">
                        <ScanLine className="w-16 h-16 text-blue-500 animate-pulse mb-4" />
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        <p className="font-bold text-blue-700 animate-pulse">
                            {ocrStatus === "scanning" ? "글자 읽는 중..." : "과목 일치 여부 확인 중..."}
                        </p>
                    </div>
                    )}
                </>
            )}
          </div>
        </div>
      )}

      {/* --- STEP 4: Time Table Grid --- */}
      {step === 4 && (
        <div className="bg-white max-w-xl w-full p-6 rounded-3xl shadow-xl space-y-4 animate-fade-in-up">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">주간 루틴 설정</h2>
            <p className="text-gray-500 text-sm mt-1">
                드래그하여 평소 공부 가능한 시간을 색칠하세요.
            </p>
          </div>

          <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-xl">
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
            <div className="grid border-b bg-gray-50" style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}>
              <div className="p-2 text-[10px] font-bold text-gray-400 text-center border-r flex items-center justify-center">Time</div>
              {WEEK_DAYS.map((dayLabel, i) => (
                <div key={i} className="p-2 text-xs font-bold text-center border-r last:border-r-0 text-gray-700">
                  {dayLabel}
                </div>
              ))}
            </div>
            <div className="h-64 overflow-y-auto custom-scrollbar relative">
              {HOURS.map((hour) => (
                <div key={hour} className="grid h-8 border-b last:border-b-0" style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}>
                  <div className="text-[10px] text-gray-400 font-medium flex items-center justify-center border-r bg-gray-50 sticky left-0">{hour}:00</div>
                  {WEEK_DAYS.map((_, dayIdx) => {
                    const key = `${dayIdx}-${hour}`;
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

      {/* --- NAVIGATION BUTTONS --- */}
      {step < 5 && (
        <div className="max-w-md w-full mt-6 flex gap-3">
          
          <button 
            onClick={handleBack} 
            disabled={isSubmitting}
            className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!canGoNext() || isSubmitting}
            className="flex-1 bg-blue-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                {step === 4 ? "분석 시작하기" : "다음으로"}
                {step !== 4 && <ChevronRight className="w-5 h-5" />}
              </>
            )}
          </button>
        </div>
      )}

      {/* --- STEP 5: AI Analysis --- */}
      {step === 5 && (
        <div className="text-center space-y-6 animate-fade-in">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Mirror AI가 분석 중입니다...</h2>
          <div className="space-y-3 text-gray-500">
            <p>🧠 학습 성향 분석: {getAnalysisText()}</p>
            <p>📝 풀이 습관: {hasMainSubject ? (ocrResult || '분석 중...') : '분석 생략됨 (주요 과목 미선택)'}</p>
            <p>📐 하루 평균 가용 시간: {Math.round((selectedSlots.size * 60) / 7)}분</p>
          </div>
        </div>
      )}

      {/* --- STEP 6: Final Solution (OCR 결과 & 태그 포함) --- */}
      {step === 6 && (
        <div className="max-w-6xl w-full space-y-6 animate-scale-in pb-10">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {info.name}님의 고{info.grade} {info.semester}학기 <span className="text-blue-600">Mirror Morphing</span> 솔루션
            </h2>
            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-sm font-bold text-blue-700">{getAnalysisText()}</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-7 flex flex-col gap-6">
               
               {/* 1. 주간 커리큘럼 */}
               <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex flex-col h-full">
                 <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                     <div className="p-2 rounded-lg bg-blue-100">
                       <Map className="w-5 h-5 text-blue-600" />
                     </div>
                     <h3 className="font-bold text-gray-800 text-lg">
                       이번 주 맞춤 커리큘럼
                     </h3>
                   </div>
                   <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">AI Generated</span>
                 </div>
                 
                 <div className="flex-1 overflow-hidden">
                    <div className="bg-gray-50 rounded-2xl p-4 h-full overflow-y-auto custom-scrollbar">
                      {weeklyPlan.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">설정된 공부 시간이 없습니다.</div>
                      ) : (
                        <div className="space-y-3">
                          {weeklyPlan.map((plan, idx) => (
                             <div key={`${plan.day}-${idx}`} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${plan.isToday ? 'bg-white shadow-md border border-blue-200 scale-102' : 'hover:bg-white hover:shadow-sm'}`}>
                               <div className={`w-12 py-2 rounded-lg text-center font-bold text-sm ${plan.isToday ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                 {plan.day}
                               </div>
                               <div className="flex-1">
                                 <div className="flex items-center gap-2 mb-0.5">
                                   <span className={`text-xs font-bold px-1.5 rounded ${plan.type === 'Concept' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                                     {plan.type === 'Concept' ? "진도(Concept)" : "복습(Review)"}
                                   </span>
                                   {plan.isToday && <span className="text-[10px] font-bold text-red-500 animate-pulse">● Today</span>}
                                 </div>
                                 <p className={`text-sm font-semibold ${plan.isToday ? 'text-gray-900' : 'text-gray-500'}`}>
                                   {plan.subject}: {plan.topic}
                                 </p>
                               </div>
                               <div className="text-right min-w-15">
                                 <span className="text-xs font-bold text-gray-400 block">목표</span>
                                 <span className={`text-sm font-bold ${plan.isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                                   {plan.time}분
                                 </span>
                               </div>
                             </div>
                          ))}
                        </div>
                      )}
                    </div>
                 </div>
               </div>
            </div>

            <div className="md:col-span-5 flex flex-col gap-6">
              
              {/* 2. 오늘의 미션 */}
              <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl shadow-blue-200 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="flex items-center gap-2 mb-6 relative z-10">
                  <div className="bg-white/20 p-2 rounded-lg"><ListTodo className="w-5 h-5 text-white" /></div>
                  <h3 className="font-bold text-lg">오늘의 미션 (Today)</h3>
                </div>
                
                {weeklyPlan.length > 0 && (
                <div className="space-y-4 relative z-10">
                  <div className="bg-white/10 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-end mb-4 border-b border-white/20 pb-4">
                      <span className="text-blue-100 text-sm font-medium">확보 시간</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold">{weeklyPlan[0].time}분</span>
                        <span className="text-xs text-blue-200 block">예상 성취도 +1.5%</span>
                      </div>
                    </div>
                    <ul className="space-y-0">
                      <li className="flex gap-4 pb-6 border-l-2 border-blue-400/30 pl-4 relative">
                        <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-blue-400 border-4 border-blue-600"></div>
                        <div>
                          <span className="text-xs font-bold text-blue-200 block mb-1">워밍업</span>
                          <p className="font-bold">지난 주 {weeklyPlan[0].subject} 오답 확인</p>
                        </div>
                      </li>
                        <li className="flex gap-4 pl-4 relative">
                        <div className="absolute -left-2.25 top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-600"></div>
                        <div>
                          <span className="text-xs font-bold text-white bg-blue-500/50 px-2 py-0.5 rounded-full mb-1 inline-block">메인 학습</span>
                          <p className="font-bold text-xl">{weeklyPlan[0].topic}</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-auto">
                    <Link href="/dashboard" className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-center block hover:bg-blue-50 transition-colors">
                      {weeklyPlan[0].subject} 학습 시작하기
                    </Link>
                  </div>
                </div>
                )}
              </div>

              {/* 3. [최종] AI 풀이 습관 분석 리포트 */}
              {Object.keys(ocrAnalysis).length > 0 && (
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-purple-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-10">
                     <BrainCircuit className="w-24 h-24 text-purple-600" />
                   </div>
                   <div className="relative z-10">
                     <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2 mb-4">
                       <FileText className="w-5 h-5 text-purple-600" />
                       AI 풀이 습관 분석
                     </h3>
                     <div className="space-y-4">
                       {Object.entries(ocrAnalysis).map(([subject, result]) => (
                         <div key={subject} className="bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                           <h4 className="font-bold text-purple-700 text-sm mb-2 flex items-center gap-2">
                             <AlertCircle className="w-3 h-3"/> {subject}
                           </h4>
                           <p className="text-sm text-gray-700 leading-relaxed font-medium mb-3">
                             {result.content}
                           </p>
                           {/* 태그 (Detected Tags) 표시 */}
                           {result.tags && result.tags.length > 0 && (
                             <div className="flex flex-wrap gap-1.5">
                               {result.tags.map((tag, i) => (
                                 <span key={i} className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-white border border-purple-200 text-[10px] font-bold text-purple-600 shadow-sm">
                                   <Hash className="w-2.5 h-2.5 opacity-50"/> {tag}
                                 </span>
                               ))}
                             </div>
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}