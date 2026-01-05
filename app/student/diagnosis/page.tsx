"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useStudy } from "../../context/StudyContext";
import {
  Loader2, Camera, Check,
  ChevronRight, ChevronLeft, RefreshCcw,
  Maximize, Map, ListTodo, FileSearch,
  ChevronDown, ChevronUp, CheckCircle2, ScanLine,
  School, User, FileText, BrainCircuit, AlertCircle, Hash, Info
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Tesseract from 'tesseract.js';
import DiagnosisResult from "./DiagnosisResult";
import LanguageToggle from "@/app/components/LanguageToggle";
import { useLanguage } from "@/app/context/LanguageContext";
import { formatPhoneNumber } from "@/app/lib/utils/phoneFormatter";

// --- [타입 정의] ---
type TimeSlotSet = Set<string>;

interface Task {
  task_id: string;
  sequence: number;
  category: string;
  title: string;
  assigned_minutes: number;
  time_slot: string;
  difficulty_level: string;
  problem_count: number;
  learning_objective: string;
  instruction: string;
  rest_after: number;
  is_completed: boolean;
}

interface DailyPlan {
  date: string;
  day_of_week: string;
  total_available_minutes: number;
  total_planned_minutes: number;
  daily_focus: string;
  tasks: Task[];
  daily_summary: string;
  energy_distribution: string;
}

interface WeeklySummary {
  expected_improvement: string;
  adaptive_notes: string;
  weekly_goals: string[];
}

interface WeeklyPlanResponse {
  plan_id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  total_study_minutes: number;
  subject_distribution: Record<string, number>;
  focus_areas: string[];
  weekly_plan: DailyPlan[];
  weekly_summary: WeeklySummary;
  created_at: string;
}

// 기존 PlanItem 호환성을 위해 유지 (UI 렌더링 시 변환하여 사용 예정)
type PlanItem = {
  day: string;
  isToday: boolean;
  type: "Concept" | "Review";
  subject: string;
  topic: string;
  time: number;
  // 추가된 필드 (API 연동 후 사용)
  dailyFocus?: string;
  tasks?: Task[];
  date?: string;
  dailySummary?: string;
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

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8시~23시 (24시 제거)
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MAIN_SUBJECTS = ["국어", "수학", "영어"];
const DETAIL_SUBJECTS = [
  { category: "과학 탐구", items: ["물리", "화학", "생명과학", "지구과학", "통합과학"] },
  { category: "사회/역사 탐구", items: ["한국사", "윤리", "지리", "역사", "일반사회", "통합사회"] },
  { category: "기타", items: ["정보", "제2외국어", "한문", "기가"] }
];

const SUBJECT_KEYWORDS: Record<string, string[]> = {
  "국어": ["다음", "글", "문단", "화자", "윗글", "적절한", "가)", "나)", "필자"],
  "수학": ["함수", "값", "구하시오", "방정식", "실수", "그림", "x", "y", "=", "+", "-", "미분", "적분"],
  "영어": ["The", "is", "paragraph"]
};

// 백엔드 전송용 과목명 매핑 (한글 -> Enum)
const SUBJECT_ENUM_MAP: Record<string, string> = {
  "국어": "KOREAN",
  "수학": "MATH",
  "영어": "ENGLISH",
  "과학": "SCIENCE",
  "사회": "SOCIAL",
  // [Fixed] 과학 탐구 상세 - 개별 과목으로 전송
  "물리": "PHYSICS",
  "화학": "CHEMISTRY",
  "생명과학": "BIOLOGY",
  "지구과학": "EARTH_SCIENCE",
  "통합과학": "INTEGRATED_SCIENCE",
  // [Fixed] 사회/역사 탐구 상세 - 개별 과목으로 전송
  "한국사": "KOREAN_HISTORY",
  "윤리": "ETHICS",
  "지리": "GEOGRAPHY",
  "역사": "HISTORY",
  "일반사회": "SOCIAL_STUDIES",
  "통합사회": "INTEGRATED_SOCIAL"
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

// [LOCALE] Constants moved inside component for i18n

// [LOCALE] Interface for UserTypeInfo
interface UserTypeInfo {
  label: string;
  desc: string;
  fullDesc: string;
}

export function DiagnosisContent() {
  const { updateSchedule, updateUserInfo } = useStudy();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedRole = searchParams.get('role') || 'student'; // URL에서 role 가져오기
  const { t } = useLanguage();

  const [step, setStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // [LOCALE] Internalize constants for i18n
  const USER_TYPES_INFO: Record<"A" | "B" | "C", UserTypeInfo> = useMemo(() => ({
    A: {
      label: t('diagnosis.types.A.label'),
      desc: t('diagnosis.types.A.desc'),
      fullDesc: t('diagnosis.types.A.fullDesc')
    },
    B: {
      label: t('diagnosis.types.B.label'),
      desc: t('diagnosis.types.B.desc'),
      fullDesc: t('diagnosis.types.B.fullDesc')
    },
    C: {
      label: t('diagnosis.types.C.label'),
      desc: t('diagnosis.types.C.desc'),
      fullDesc: t('diagnosis.types.C.fullDesc')
    }
  }), [t]);

  const QUIZ_QUESTIONS = useMemo(() => [
    { id: 1, question: t('diagnosis.step2.q1.question'), options: [{ value: "A", label: t('diagnosis.step2.q1.a'), desc: t('diagnosis.step2.q1.aDesc') }, { value: "B", label: t('diagnosis.step2.q1.b'), desc: t('diagnosis.step2.q1.bDesc') }, { value: "C", label: t('diagnosis.step2.q1.c'), desc: t('diagnosis.step2.q1.cDesc') }] },
    { id: 2, question: t('diagnosis.step2.q2.question'), options: [{ value: "A", label: t('diagnosis.step2.q2.a'), desc: t('diagnosis.step2.q2.aDesc') }, { value: "B", label: t('diagnosis.step2.q2.b'), desc: t('diagnosis.step2.q2.bDesc') }, { value: "C", label: t('diagnosis.step2.q2.c'), desc: t('diagnosis.step2.q2.cDesc') }] },
    { id: 3, question: t('diagnosis.step2.q3.question'), options: [{ value: "A", label: t('diagnosis.step2.q3.a'), desc: t('diagnosis.step2.q3.aDesc') }, { value: "B", label: t('diagnosis.step2.q3.b'), desc: t('diagnosis.step2.q3.bDesc') }, { value: "C", label: t('diagnosis.step2.q3.c'), desc: t('diagnosis.step2.q3.cDesc') }] },
    { id: 4, question: t('diagnosis.step2.q4.question'), options: [{ value: "A", label: t('diagnosis.step2.q4.a'), desc: t('diagnosis.step2.q4.aDesc') }, { value: "B", label: t('diagnosis.step2.q4.b'), desc: t('diagnosis.step2.q4.bDesc') }, { value: "C", label: t('diagnosis.step2.q4.c'), desc: t('diagnosis.step2.q4.cDesc') }] }
  ], [t]);

  const getSubjectLabel = (sub: string) => {
    const enumVal = SUBJECT_ENUM_MAP[sub];
    if (enumVal) return t(`subject.${enumVal.toLowerCase()}`);
    return sub;
  };

  // 사용자 정보
  const [info, setInfo] = useState({
    name: "",
    phone: "",
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
  // AI 주간 계획 원본 데이터 상태
  const [aiWeeklyData, setAiWeeklyData] = useState<WeeklyPlanResponse | null>(null);
  const isDragging = useRef(false);
  const dragAction = useRef<"add" | "remove">("add");
  const [showSubSubjects, setShowSubSubjects] = useState(false);

  // 주간 가용 시간 가이드
  const [weeklyAvailableTime, setWeeklyAvailableTime] = useState<Record<string, number>>({});

  // 툴팁 상태
  const [showTooltip, setShowTooltip] = useState(false);

  // 주요 과목 정렬 및 필터링
  // 주요 과목 정렬 및 필터링 (OCR은 국영수만 진행)
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

  // [삭제됨] 클라이언트 더미 데이터 생성 함수 (이제 API로 대체됨)
  // const generateWeeklyPlan = () => { ... }

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

  // 주간 가용 시간 가이드 조회
  const fetchWeeklyAvailableTime = async (userId: string, accessToken: string) => {
    console.log("📡 [가용시간] API 호출 시작 - userId:", userId);
    try {
      const res = await fetch(`https://mirror-backend-5j11.onrender.com/my/time-slots`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        }
      });

      console.log("📡 [가용시간] API 응답 상태:", res.status, res.statusText);

      if (res.ok) {
        const responseData = await res.json();
        console.log("📡 [가용시간] 원본 응답 데이터:", JSON.stringify(responseData, null, 2));

        if (responseData.success && responseData.data?.weekly_schedule) {
          const timeMap: Record<string, number> = {};
          let totalMin = 0;
          responseData.data.weekly_schedule.forEach((item: any) => {
            timeMap[item.day_of_week] = item.recommended_minutes;
            totalMin += item.recommended_minutes;
            console.log(`📅 [가용시간] ${item.day_of_week}: ${item.recommended_minutes}분`);
          });
          console.log(`📊 [가용시간] 평균 계산: ${totalMin} ÷ 7 = ${(totalMin / 7).toFixed(1)}분`);
          setWeeklyAvailableTime(timeMap);
          console.log("✅ [가용시간] 주간 가용 시간 가이드 조회 성공:", timeMap);
        } else {
          console.warn("⚠️ [가용시간] 응답 데이터 구조 불일치:", responseData);
        }
      } else {
        const errorText = await res.text();
        console.warn("⚠️ [가용시간] 주간 가용 시간 가이드 조회 실패 - 상태:", res.status, "응답:", errorText);
      }
    } catch (error) {
      console.error("❌ [가용시간] 주간 가용 시간 가이드 조회 오류:", error);
    }
  };

  // 6️⃣ [NEW] AI 주간 계획 생성 API 호출
  const fetchAIWeeklyPlan = async (userId: string, accessToken: string, subjects: string[]) => {
    console.log("🤖 [AI계획] 주간 학습 계획 생성 시작...");
    try {
      // [Fix] '이번주 월요일' 계산
      const todayForCalc = new Date();
      const dayNum = todayForCalc.getDay();
      const diffToMon = dayNum === 0 ? 6 : dayNum - 1;
      const thisMonday = new Date(todayForCalc);
      thisMonday.setDate(todayForCalc.getDate() - diffToMon);

      const offsetMon = thisMonday.getTimezoneOffset() * 60000;
      const startDateStr = new Date(thisMonday.getTime() - offsetMon).toISOString().split('T')[0];

      console.log("🤖 [AI계획] Request StartDate:", startDateStr);

      const res = await fetch(`https://mirror-backend-5j11.onrender.com/my/missions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          start_date: startDateStr,
          subjects: subjects // [Fix] 과목 명시적 전송
        })
      });

      console.log("🤖 [AI계획] API 응답 상태:", res.status);

      if (res.ok) {
        const responseData = await res.json();
        if (responseData.success && responseData.data) {
          const planData = responseData.data as WeeklyPlanResponse;
          console.log("✅ [AI계획] 생성 성공 - 원본 데이터:");
          console.log(JSON.stringify(planData, null, 2));
          console.log("--------------------------------------------------");

          // [Fix] API 데이터(2023년 등)를 이번 주 날짜로 강제 동기화
          const baseDate = new Date(thisMonday);
          console.log("🔍 [AI계획] 수신된 주간 계획 데이터 검증:");

          planData.weekly_plan.forEach((day, idx) => {
            // [Proof Log] 각 요일별 포함된 과목(카테고리) 확인
            const taskCategories = day.tasks.map(t => t.category);
            console.log(`🔍 [AI계획] Day ${idx + 1} (${day.day_of_week}) 과목:`, taskCategories);

            const currentDate = new Date(baseDate);
            currentDate.setDate(baseDate.getDate() + idx);
            const offset = currentDate.getTimezoneOffset() * 60000;
            day.date = new Date(currentDate.getTime() - offset).toISOString().split('T')[0];
          });
          console.log("✅ [AI계획] 날짜 강제 동기화 진행:", planData.weekly_plan.map(p => p.date));

          setAiWeeklyData(planData);

          // UI 호환성을 위해 PlanItem 형식으로 변환하여 weeklyPlan 업데이트
          // [Fix] 백엔드 데이터를 신뢰 - 첫 번째 날을 "오늘"로 간주
          console.log("📅 [AI계획] 백엔드 날짜 기준 사용 (로컬 비교 제거)");
          console.log("📅 [AI계획] API Dates:", planData.weekly_plan.map(p => p.date));

          const convertedPlan: PlanItem[] = planData.weekly_plan.map((day, index) => {
            // 요일 매핑 (MONDAY -> Mon)
            const dayMap: Record<string, string> = { "MONDAY": "Mon", "TUESDAY": "Tue", "WEDNESDAY": "Wed", "THURSDAY": "Thu", "FRIDAY": "Fri", "SATURDAY": "Sat", "SUNDAY": "Sun" };
            const dayShort = dayMap[day.day_of_week] || day.day_of_week;

            // 대표 과목 및 주제 추출 (첫 번째 Task 기준)
            const mainTask = day.tasks && day.tasks.length > 0 ? day.tasks[0] : null;
            const subject = mainTask ? mainTask.category : "자습";
            const topic = day.daily_focus; // daily_focus를 topic으로 사용

            return {
              day: dayShort,
              isToday: index === 0, // 백엔드가 보낸 첫 번째 날을 "오늘"로 간주
              type: "Concept",
              subject: subject,
              topic: topic,
              time: day.total_planned_minutes,
              dailyFocus: day.daily_focus,
              tasks: day.tasks,
              date: day.date,           // [NEW] 날짜 추가
              dailySummary: day.daily_summary // [NEW] 요약 추가
            };
          });

          // [Fix] 요일 순서대로 정렬 (Mon -> Sun)
          const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          convertedPlan.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));

          setWeeklyPlan(convertedPlan);
        } else {
          console.warn("⚠️ [AI계획] 데이터 없음 또는 실패:", responseData);
          alert("주간 계획 생성에 실패했습니다: " + responseData.message);
        }
      } else {
        const errText = await res.text();
        console.error("❌ [AI계획] API 호출 실패:", errText);
        alert("주간 계획 생성 서버 오류");
      }
    } catch (error) {
      console.error("❌ [AI계획] 네트워크 오류:", error);
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  const startAnalysis = async () => {
    setStep(5);
    // API 호출 (토큰 가져오기)
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    const userId = session?.user?.id;

    if (accessToken && userId) {
      const mappedSubjects = info.subjects.map(sub => SUBJECT_ENUM_MAP[sub] || sub);
      console.log("🤖 [AI계획] 전송할 과목(Enum):", mappedSubjects);
      await fetchAIWeeklyPlan(userId, accessToken, mappedSubjects);
    }

    // 로딩 효과를 위해 잠시 대기
    setTimeout(() => setStep(6), 2000);
  };
  const calculateUserType = (): "A" | "B" | "C" => { const counts = { A: 0, B: 0, C: 0 }; Object.values(answers).forEach((val) => { if (val === 'A' || val === 'B' || val === 'C') { counts[val]++; } }); const max = Math.max(counts.A, counts.B, counts.C); if (counts.B === max) return "B"; if (counts.C === max) return "C"; return "A"; };
  const getAnalysisText = () => USER_TYPES_INFO[calculateUserType()].desc;

  // --- [서버 전송 및 분석 로직] ---
  const saveAllData = async () => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
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
      const mappedSubjects = info.subjects.map(sub => SUBJECT_ENUM_MAP[sub] || sub);

      console.log("📝 [기본정보] 학생 정보 저장 시작...");
      console.log("📝 [기본정보] 선택한 과목(Raw):", info.subjects);
      console.log("📝 [기본정보] 전송할 과목(Enum):", mappedSubjects);

      const basicInfoRes = await fetch("https://mirror-backend-5j11.onrender.com/setup/basic-info", {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({
          user_id: userId,
          student_name: info.name,
          phone_number: info.phone,
          school_grade: parseInt(info.grade),
          semester: parseInt(info.semester),
          subjects: mappedSubjects // [Fix] Enum 매핑된 과목 전송
        }),
      });

      if (!basicInfoRes.ok) {
        const err = await basicInfoRes.json();
        console.error("❌ [기본정보] 학생 정보 저장 실패:", err);
        alert("학생 정보 저장에 실패했습니다.");
        return false;
      }

      console.log("✅ [기본정보] 학생 정보 저장 성공");

      // [NEW] Supabase users 테이블에도 phone_number 저장
      console.log("📞 [전화번호] Supabase users 테이블 업데이트 중...");
      const { error: phoneUpdateError } = await supabase
        .from('users')
        .update({ phone_number: info.phone })
        .eq('id', userId);

      if (phoneUpdateError) {
        console.error("❌ [전화번호] Supabase 업데이트 실패:", phoneUpdateError);
      } else {
        console.log("✅ [전화번호] Supabase 업데이트 성공:", info.phone);
      }

      updateUserInfo({
        name: info.name,
        grade: info.grade,
        semester: info.semester,
        subjects: info.subjects
      });

      // 2️⃣ [수정됨] 시간표(Routine) 저장 (명세서 반영)
      console.log("🕐 [시간표] 선택된 슬롯 원본 데이터:", Array.from(selectedSlots));
      console.log("🕐 [시간표] 총 선택된 슬롯 개수:", selectedSlots.size);

      const routineData: any[] = [];
      const slotsArray: string[] = Array.from<string>(selectedSlots).sort();

      console.log("🕐 [시간표] 정렬된 슬롯 배열:", slotsArray);

      const dayMap: Record<number, number[]> = {};
      slotsArray.forEach(slot => {
        const [d, h] = slot.split("-").map(Number);
        if (!dayMap[d]) dayMap[d] = [];
        dayMap[d].push(h);
        console.log(`🕐 [시간표] 슬롯 파싱: ${slot} -> 요일=${d}, 시간=${h}`);
      });

      console.log("🕐 [시간표] 요일별 시간 맵:", dayMap);

      // 요일별 연속 시간 병합 로직
      Object.entries(dayMap).forEach(([dayIdxStr, hours]) => {
        const dayIdx = parseInt(dayIdxStr);
        const dayCode = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][dayIdx];

        console.log(`🕐 [시간표] 처리 중: ${dayCode} (index=${dayIdx}), 시간들:`, hours);

        hours.sort((a, b) => a - b);

        let start = hours[0];
        let end = hours[0];

        for (let i = 1; i < hours.length; i++) {
          if (hours[i] === end + 1) {
            end = hours[i]; // 연속됨
          } else {
            // 끊김 -> 저장
            const startTimeStr = `${String(start).padStart(2, '0')}:00`;
            // 24시 이상은 23:59로 제한 (백엔드 validation: 00:00-23:59)
            const endTimeHour = end + 1;
            const endTimeStr = endTimeHour >= 24 ? '23:59' : `${String(endTimeHour).padStart(2, '0')}:00`;
            const totalMinutes = endTimeHour >= 24 ? ((23 - start) * 60 + 59) : ((endTimeHour - start) * 60);

            const block = {
              day_of_week: dayCode,
              start_time: startTimeStr,
              end_time: endTimeStr,
              total_minutes: totalMinutes
            };
            console.log(`🕐 [시간표] 블록 추가 (중간):`, block);
            routineData.push(block);
            start = hours[i];
            end = hours[i];
          }
        }
        // 마지막 블록 저장
        const startTimeStr = `${String(start).padStart(2, '0')}:00`;
        const endTimeHour = end + 1;
        const endTimeStr = endTimeHour >= 24 ? '23:59' : `${String(endTimeHour).padStart(2, '0')}:00`;
        const totalMinutes = endTimeHour >= 24 ? ((23 - start) * 60 + 59) : ((endTimeHour - start) * 60);

        const lastBlock = {
          day_of_week: dayCode,
          start_time: startTimeStr,
          end_time: endTimeStr,
          total_minutes: totalMinutes
        };
        console.log(`🕐 [시간표] 블록 추가 (마지막):`, lastBlock);
        routineData.push(lastBlock);
      });

      console.log("🚀 [시간표] 최종 전송 데이터:");
      console.log(JSON.stringify(routineData, null, 2));
      console.log("🚀 [시간표] 전송 블록 개수:", routineData.length);

      // API 전송 (user_id 사용)
      const routineRes = await fetch("https://mirror-backend-5j11.onrender.com/routines", {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({
          user_id: userId, // 👈 명세서에 맞게 user_id 사용
          routines: routineData
        }),
      });

      console.log("🚀 [시간표] API 응답 상태:", routineRes.status);

      if (!routineRes.ok) {
        const err = await routineRes.json();
        console.error("❌ [시간표] 저장 실패:", err);
        console.error("❌ [시간표] 에러 상세:", JSON.stringify(err, null, 2));
      } else {
        const successData = await routineRes.json();
        console.log("✅ [시간표] 저장 성공, 응답:", successData);
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

      // 5️⃣ 주간 가용 시간 가이드 조회
      // 백엔드에서 학생 데이터가 완전히 생성될 때까지 잠시 대기
      console.log("⏳ [가용시간] 백엔드 데이터 처리 대기 중...");
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchWeeklyAvailableTime(userId, accessToken);

      // 6️⃣ [NEW] Role 저장 (진단 완료 후)
      console.log(`📝 [Role 저장] ${selectedRole} 역할을 Supabase에 저장 중...`);

      // Supabase에 role 저장
      const { error: roleError } = await supabase
        .from('users')
        .update({ role: selectedRole.toUpperCase() })
        .eq('id', userId);

      if (roleError) {
        console.error("❌ [Role 저장] Supabase 저장 실패:", roleError);
      } else {
        console.log("✅ [Role 저장] Supabase 저장 성공");
      }

      // 백엔드 API에도 role 저장
      try {
        const roleRes = await fetch("https://mirror-backend-5j11.onrender.com/onboarding/role", {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ role: selectedRole })
        });

        if (roleRes.ok) {
          console.log("✅ [Role 저장] 백엔드 API 저장 성공");
        } else {
          console.warn("⚠️ [Role 저장] 백엔드 API 저장 실패 (무시하고 진행)");
        }
      } catch (roleApiError) {
        console.warn("⚠️ [Role 저장] 백엔드 API 호출 실패 (무시하고 진행):", roleApiError);
      }

      console.log("✅ 모든 데이터 저장 완료 (Role 포함)");
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
    if (step === 0) { setStep(1); return; }
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
    if (step === 0) {
      const ok = window.confirm("역할 선택 화면으로 돌아가시겠습니까?");
      if (ok) {
        router.replace('/onboarding/role');
      }
      return;
    }
    if (step === 1) {
      setStep(0);
      return;
    }
    if (step === 4 && !hasMainSubject) { setStep(2); } else { setStep(step - 1); }
  };

  const canGoNext = () => {
    if (step === 0) {
      const phoneValid = /^\d{3}-\d{4}-\d{4}$/.test(info.phone);
      return info.name.trim().length > 0 && phoneValid;
    }
    if (step === 1) return info.grade && info.semester && info.subjects.length > 0;
    if (step === 2) return Object.keys(answers).length === 4;
    if (step === 3) return Object.keys(subjectImages).length > 0;
    if (step === 4) return selectedSlots.size > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 select-none relative">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle />
      </div>

      {/* Progress Bar */}
      {step < 5 && (
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
            <span className={step >= 0 ? "text-primary" : ""}>Personal</span>
            <span className={step >= 1 ? "text-primary" : ""}>Info</span>
            <span className={step >= 2 ? "text-primary" : ""}>Style</span>
            <span className={step >= 3 ? (hasMainSubject ? "text-primary" : "text-gray-300 line-through decoration-2") : ""}>Solving</span>
            <span className={step >= 4 ? "text-primary" : ""}>Time</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </div>
      )}


      {/* --- STEP 0: Personal Info (Name + Phone) --- */}
      {step === 0 && (
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in-up">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('diagnosis.step0.title')}</h2>
            <p className="text-sm text-gray-500">{t('diagnosis.step0.subtitle')}</p>
          </div>

          <div className="space-y-5">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                {t('diagnosis.step0.nameLabel')}
              </label>
              <input
                type="text"
                value={info.name}
                onChange={(e) => setInfo({ ...info, name: e.target.value })}
                placeholder={t('diagnosis.step0.namePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-900 font-medium placeholder-gray-400"
              />
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                {t('diagnosis.step0.phoneLabel')}
              </label>
              <input
                type="tel"
                value={info.phone}
                onChange={(e) => setInfo({ ...info, phone: formatPhoneNumber(e.target.value) })}
                placeholder={t('diagnosis.step0.phonePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-gray-900 font-medium placeholder-gray-400"
                maxLength={13}
              />
              <p className="text-xs text-gray-400 mt-1">{t('diagnosis.step0.phoneHint')}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 1: Basic Info --- */}
      {step === 1 && (
        <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl space-y-6 animate-fade-in-up">
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-3 bg-surface rounded-full mb-3">
              <School className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t('diagnosis.step1.title')}</h2>
            <p className="text-gray-500 text-sm mt-1">{t('diagnosis.step1.subtitle')}</p>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 ml-1 flex items-center gap-1">
                <User className="w-3 h-3" /> {t('diagnosis.step0.nameLabel')} ({t('diagnosis.step0.namePlaceholder')})
              </label>
              <input
                type="text"
                value={info.name}
                onChange={(e) => setInfo({ ...info, name: e.target.value })}
                placeholder={t('diagnosis.step0.namePlaceholder')}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:bg-surface/30 font-bold text-gray-900 placeholder-gray-300 transition-colors"
              />
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">{t('diagnosis.step1.gradeLabel')}</label>
                  <div className="flex gap-1">{["1", "2", "3"].map((g) => (<button key={g} onClick={() => setInfo({ ...info, grade: g })} className={`flex-1 py-3 rounded-lg border-2 font-bold ${info.grade === g ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-[#A1887F]"}`}>{g}{t('diagnosis.step1.gradeLabel')}</button>))}</div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">{t('diagnosis.step1.semesterLabel')}</label>
                  <div className="flex gap-1">{["1", "2"].map((s) => (<button key={s} onClick={() => setInfo({ ...info, semester: s })} className={`flex-1 py-3 rounded-lg border-2 font-bold ${info.semester === s ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:border-[#A1887F]"}`}>{s === "1" ? t('diagnosis.step1.semester1') : t('diagnosis.step1.semester2')}</button>))}</div>
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
                    <button key={subject} onClick={() => toggleSubject(subject)} className={`py-4 rounded-xl font-bold border-2 transition-all relative ${isSelected ? "bg-primary border-primary text-white shadow-lg transform scale-105" : "bg-white border-gray-200 text-gray-500 hover:border-[#A1887F] hover:bg-surface"}`}>
                      {getSubjectLabel(subject)}
                      {isSelected && <Check className="w-4 h-4 absolute top-2 right-2 text-white/80" />}
                    </button>
                  );
                })}
              </div>

              {/* 주요 과목 선택 시 안내 문구 */}
              {info.subjects.some(s => MAIN_SUBJECTS.includes(s)) && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 font-medium flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    국어, 수학, 영어 중 선택한 과목은 나중에 풀었던 문제를 업로드하여 정확한 진단을 받을 수 있습니다.
                  </p>
                </div>
              )}

              {/* [복구됨] 탐구 과목 선택 아코디언 버튼 및 리스트 */}
              <button onClick={() => setShowSubSubjects(!showSubSubjects)} className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 font-medium py-3 hover:bg-gray-50 rounded-lg transition-colors border border-dashed border-gray-300">
                {showSubSubjects ? t('diagnosis.step1.showLess') : t('diagnosis.step1.showMore')}
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
                            <button key={subject} onClick={() => toggleSubject(subject)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isSelected ? "bg-[#F5F5F0] border-primary text-primary shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"}`}>
                              {getSubjectLabel(subject)}
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
            <h2 className="text-2xl font-bold text-gray-900">{t('diagnosis.step2.title')}</h2>
            <p className="text-gray-500 text-sm mt-1">{t('diagnosis.step2.subtitle')}</p>
          </div>
          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-3">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span className="bg-surface text-primary text-xs px-2 py-1 rounded-full">Q{q.id}</span>
                  {q.question}
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setAnswers({ ...answers, [q.id]: opt.value })}
                      className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${answers[q.id] === opt.value
                        ? "border-primary bg-surface ring-1 ring-[#D7CCC8]"
                        : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      <div>
                        <div className={`font-bold text-base mb-1 ${answers[q.id] === opt.value ? "text-primary" : "text-gray-800"}`}>{opt.label}</div>
                        <div className="text-xs text-gray-500">{opt.desc}</div>
                      </div>
                      {answers[q.id] === opt.value && <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />}
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
            <h2 className="text-2xl font-bold text-gray-900">{t('diagnosis.step3.title')}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {ocrStatus === "done" ? t('diagnosis.step3.done') : t('diagnosis.step3.subtitle')}
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
                    ${isActive ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}
                  `}
                >
                  {getSubjectLabel(subject)}
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
                  풀이 습관 데이터가 저장되었습니다.<br />
                  <span className="font-bold underline">최종 리포트</span>에서 결과를 확인하세요!
                </p>
                <button
                  onClick={() => {
                    setSubjectImages(prev => { const n = { ...prev }; delete n[activeSubjectTab]; return n; });
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
                    className="h-full border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-surface transition-all group"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#EBE5DE] transition-colors">
                      <Camera className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                    </div>
                    <p className="font-bold text-gray-600">{activeSubjectTab} 풀이 사진</p>
                    <p className="text-xs text-gray-400 mt-1">클릭하여 업로드 (OCR 자동 검사)</p>
                  </div>
                )}

                {(ocrStatus === "scanning" || ocrStatus === "analyzing") && (
                  <div className="h-full border-2 border-[#EBE5DE] rounded-2xl p-10 flex flex-col items-center justify-center bg-surface relative overflow-hidden">
                    <ScanLine className="w-16 h-16 text-primary animate-pulse mb-4" />
                    <div className="absolute top-0 left-0 w-full h-1 bg-[#8D6E63] shadow-[0_0_20px_rgba(109,76,65,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    <p className="font-bold text-primary animate-pulse">
                      {ocrStatus === "scanning" ? t('diagnosis.step3.scanning') : t('diagnosis.step3.analyzing')}
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
            <h2 className="text-2xl font-bold text-gray-900">{t('diagnosis.step4.title')}</h2>
            <p className="text-gray-500 text-sm mt-1">
              {t('diagnosis.step4.subtitle')}
            </p>
          </div>

          <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-xl">
            <div className="grid grid-cols-2 gap-2">
              <button onClick={clearCurrentWeek} className="flex items-center justify-center gap-1 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 shadow-sm"><RefreshCcw className="w-3 h-3" /> {t('diagnosis.step4.clearAll')}</button>
              <button onClick={fillCurrentWeek} className="flex items-center justify-center gap-1 py-2 text-xs font-bold text-primary bg-surface border border-[#D7CCC8] rounded-lg hover:bg-[#EBE5DE] shadow-sm"><Maximize className="w-3 h-3" /> {t('diagnosis.step4.fillAll')}</button>
            </div>
            <div className="flex justify-between items-center px-1 pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-2">확보: <span className="text-primary text-lg font-black">{calculateTotalHours()}시간</span></span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-primary rounded-sm"></div>공부 가능</div>
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
                        className={`cursor-pointer transition-colors duration-75 border-r last:border-r-0 ${isSelected ? "bg-primary hover:bg-[#8D6E63]" : "bg-white hover:bg-gray-100"}`}
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
            className="flex-1 bg-primary disabled:bg-gray-300 text-white py-4 rounded-xl font-bold text-lg hover:bg-[#5D4037] transition-colors flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
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
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">{t('diagnosis.analysis.loadingTitle')}</h2>
          <div className="space-y-3 text-gray-500">
            <p>🧠 {t('diagnosis.analysis.typeAnalysis')}: {getAnalysisText()}</p>
            <p>📝 {t('diagnosis.analysis.habitAnalysis')}: {hasMainSubject ? (ocrResult || t('diagnosis.analysis.analyzingHabit')) : t('diagnosis.analysis.skipped')}</p>
            <p>📐 {t('diagnosis.analysis.avgTime')}: {Math.round((selectedSlots.size * 60) / 7)}{t('diagnosis.result.minutes')}</p>
          </div>
        </div>
      )}

      {/* --- STEP 6: Final Solution (OCR 결과 & 태그 포함) --- */}
      {step === 6 && (
        <DiagnosisResult
          userName={info.name}
          grade={info.grade}
          semester={info.semester}
          userType={calculateUserType()}
          userTypeInfo={USER_TYPES_INFO}
          analysisText={getAnalysisText()}
          weeklyPlan={weeklyPlan}
          weeklyAvailableTime={weeklyAvailableTime}
          ocrAnalysis={ocrAnalysis}
          showTooltip={showTooltip}
          onTooltipShow={() => setShowTooltip(true)}
          onTooltipHide={() => setShowTooltip(false)}
          aiWeeklyData={aiWeeklyData} // 원본 데이터 전달
        />
      )}
    </div>
  );
}

export default function DiagnosisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <DiagnosisContent />
    </Suspense>
  );
}
