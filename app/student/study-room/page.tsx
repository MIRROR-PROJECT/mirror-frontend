"use client";

import { useState, useEffect } from "react";
import { useStudy } from "../../context/StudyContext";
import {
  CalendarDays, CheckCircle2,
  Clock, Calendar, Award, BookOpen,
  TrendingUp, Loader2, Calendar as CalendarIcon,
  X, MoreHorizontal
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

// --- [API 명세서 기반 타입 정의] ---
interface ApiTask {
  task_id: string;
  category: string;
  title: string;
  subtitle: string;
  assigned_minutes: number;
  is_completed: boolean;
  status: "완료" | "잠김" | "진행 가능";
}

interface ApiScheduleSlot {
  time_slot: string;
  task: ApiTask | null;
}

interface TodayMissionResponse {
  mission_date: string;
  mission_title: string;
  total_minutes: number;
  completion_rate: number;
  schedule: ApiScheduleSlot[];
}

interface ToggleResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    task_id: string;
    is_completed: boolean;
  } | null;
}

interface AcademicEvent {
  id: number;
  title: string;
  date: string;
  type: "csat" | "mock";
}

// [NEW] 주간 달성률 데이터 (예시)
const WEEKLY_STATS = [
  { day: "월", rate: 40 },
  { day: "화", rate: 75 },
  { day: "수", rate: 55 },
  { day: "목", rate: 90 },
  { day: "금", rate: 100 },
  { day: "토", rate: 30 },
  { day: "일", rate: 0 },
];

const ACADEMIC_SCHEDULE: AcademicEvent[] = [
  { id: 1, title: "3월 전국연합학력평가", date: "2026-03-24", type: "mock" },
  { id: 2, title: "4월 전국연합학력평가", date: "2026-04-14", type: "mock" },
  { id: 3, title: "6월 대수능 모의평가", date: "2026-06-04", type: "mock" },
  { id: 4, title: "7월 전국연합학력평가", date: "2026-07-11", type: "mock" },
  { id: 5, title: "9월 대수능 모의평가", date: "2026-09-04", type: "mock" },
  { id: 6, title: "10월 전국연합학력평가", date: "2026-10-15", type: "mock" },
  { id: 7, title: "2027학년도 대학수학능력시험", date: "2026-11-19", type: "csat" },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudyRoomPage() {
  const { updateSchedule } = useStudy();

  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [weekDates, setWeekDates] = useState<{ day: string, date: number, isToday: boolean }[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<(AcademicEvent & { dDay: number })[]>([]);

  const [todayTasks, setTodayTasks] = useState<ApiTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayProgress, setTodayProgress] = useState(0);

  // 그래프 인터랙션 상태
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    calculateWeekDates();
    calculateDDay();
    fetchTodayMission();
  }, []);

  const calculateWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
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
  };

  const calculateDDay = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filteredEvents = ACADEMIC_SCHEDULE
      .map(event => {
        const eventDate = new Date(event.date);
        const diffTime = eventDate.getTime() - now.getTime();
        const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...event, dDay };
      })
      .filter(event => event.dDay >= 0)
      .sort((a, b) => a.dDay - b.dDay)
      .slice(0, 4);

    setUpcomingEvents(filteredEvents);
  };

  const fetchTodayMission = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`https://mirror-backend-5j11.onrender.com/my/missions/today`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const data = json.data as TodayMissionResponse;
          const validTasks = data.schedule
            .map(slot => slot.task)
            .filter((task): task is ApiTask => task !== null && task.status !== "잠김");

          setTodayTasks(validTasks);

          const completedCount = validTasks.filter(t => t.is_completed).length;
          const totalCount = validTasks.length;
          setTodayProgress(totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch missions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- [API 명세서 기반 태스크 토글 핸들러] ---
  const handleToggleTask = async (taskId: string) => {
    console.group(`🔄 [Toggle] Task ID: ${taskId}`);

    const targetTask = todayTasks.find(t => t.task_id === taskId);
    if (!targetTask) {
      console.warn("❌ 로컬 상태에서 태스크를 찾을 수 없음");
      console.groupEnd();
      return;
    }

    const optimisticStatus = !targetTask.is_completed;
    console.log(`📍 현재 상태: ${targetTask.is_completed} -> 변경 예정: ${optimisticStatus}`);

    // 1. 낙관적 업데이트 (UI 먼저 변경)
    console.log("⚡ [UI] 낙관적 업데이트 적용 중...");
    setTodayTasks(prev => prev.map(t =>
      t.task_id === taskId ? { ...t, is_completed: optimisticStatus, status: optimisticStatus ? "완료" : "진행 가능" } : t
    ));

    // 진척도 즉시 재계산
    setTodayProgress(prev => {
      const total = todayTasks.length;
      const currentCompleted = todayTasks.filter(t => t.is_completed).length;
      const nextCompleted = optimisticStatus ? currentCompleted + 1 : currentCompleted - 1;
      return Math.round((nextCompleted / total) * 100);
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      // 2. API 호출 (명세서: PATCH /my/tasks/{task_id}/toggle)
      console.log("📡 [API] 서버로 PATCH 요청 전송...");
      const res = await fetch(`https://mirror-backend-5j11.onrender.com/my/tasks/${taskId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        }
      });

      console.log(`📥 [API] 응답 상태 코드: ${res.status}`);

      // 3. 응답 파싱
      const json: ToggleResponse = await res.json();
      console.log("📦 [Res] 서버 응답 데이터:", json);

      // 4. 에러 처리 (명세서 기반)
      if (!json.success) {
        // 404: 태스크를 찾을 수 없음
        if (json.code === 404) {
          console.error("❌ [404] 해당 task_id의 태스크를 찾을 수 없습니다.");
          alert("해당 태스크를 찾을 수 없습니다.");
        } else {
          console.error(`❌ [${json.code}] ${json.message}`);
          alert(json.message || "상태 변경에 실패했습니다.");
        }

        // 실패 시 롤백
        setTodayTasks(prev => prev.map(t =>
          t.task_id === taskId ? { ...t, is_completed: !optimisticStatus, status: !optimisticStatus ? "완료" : "진행 가능" } : t
        ));
        return;
      }

      // 5. 성공 응답 처리 (200 OK)
      if (json.data) {
        const serverStatus = json.data.is_completed;
        console.log(`✅ [Success] ${json.message}`);

        // 서버 상태와 낙관적 업데이트 동기화 확인
        if (serverStatus !== optimisticStatus) {
          console.warn(`⚠️ [Sync] 상태 불일치 발생! 서버값(${serverStatus})으로 동기화합니다.`);
          setTodayTasks(prev => prev.map(t =>
            t.task_id === taskId ? { ...t, is_completed: serverStatus, status: serverStatus ? "완료" : "진행 가능" } : t
          ));

          // 진척도 재계산
          const total = todayTasks.length;
          const updatedCompleted = todayTasks.filter(t =>
            t.task_id === taskId ? serverStatus : t.is_completed
          ).length;
          setTodayProgress(Math.round((updatedCompleted / total) * 100));
        } else {
          console.log("✅ [Sync] 서버와 상태 동기화 완료.");
        }
      }

    } catch (error) {
      console.error("❌ [Error] 네트워크 오류 또는 예외 발생:", error);

      // 실패 시 롤백
      setTodayTasks(prev => prev.map(t =>
        t.task_id === taskId ? { ...t, is_completed: !optimisticStatus, status: !optimisticStatus ? "완료" : "진행 가능" } : t
      ));

      alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      console.groupEnd();
    }
  };

  // --- [Graph Helper] ---
  const getSmoothPath = (points: { x: number, y: number }[]) => {
    if (points.length === 0) return "";

    let d = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];

      const cp1x = p0.x + (p1.x - p0.x) * 0.5;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) * 0.5;
      const cp2y = p1.y;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const graphWidth = 100;
  const graphHeight = 60;
  const paddingX = 10;
  const points = WEEKLY_STATS.map((d, i) => ({
    x: paddingX + i * ((graphWidth - paddingX * 2) / (WEEKLY_STATS.length - 1)),
    y: graphHeight - (d.rate / 100) * graphHeight
  }));

  const pathD = getSmoothPath(points);
  const areaD = `${pathD} L ${points[points.length - 1].x},${graphHeight} L ${points[0].x},${graphHeight} Z`;

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
              꾸준함이 실력입니다. 오늘의 미션을 확인하세요.
            </p>
          </div>

          <button
            onClick={() => setIsScheduleOpen(true)}
            className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-blue-200 shadow-sm text-blue-600 hover:bg-blue-50 transition-colors font-bold text-sm"
          >
            <Clock className="w-4 h-4" /> 시간표 설정
          </button>
        </header>

        {/* 1. 상단 현황판 */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* [좌측] 모의고사 & 수능 일정 */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" /> 모의고사 & 수능 일정
              </h3>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-100 transition-all cursor-default group hover:bg-white hover:border-blue-200 hover:shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-bold mb-0.5">{event.date}</span>
                      <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        {event.title}
                        {event.type === 'csat' && <Award className="w-3.5 h-3.5 text-orange-500" />}
                        {event.type === 'mock' && <BookOpen className="w-3.5 h-3.5 text-blue-400" />}
                      </span>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl font-black text-sm shadow-sm ${event.type === 'csat' ? 'bg-orange-100 text-orange-600' :
                      event.dDay <= 7 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                      D-{event.dDay === 0 ? 'Day' : event.dDay}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Calendar className="w-8 h-8 opacity-20" />
                  <span className="text-xs">예정된 주요 시험이 없습니다.</span>
                </div>
              )}
            </div>
          </div>

          {/* [우측] 주간 학습 리포트 */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-full relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 z-10">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" /> 주간 학습 리포트
                </h3>
                <p className="text-xs text-gray-400 mt-1">지난주보다 <span className="text-indigo-600 font-bold">12% 더</span> 달성했어요! 🔥</p>
              </div>
              <button className="text-gray-300 hover:text-gray-500"><MoreHorizontal className="w-5 h-5" /></button>
            </div>

            {/* 그래프 영역 */}
            <div className="flex-1 w-full relative min-h-[180px] flex flex-col justify-end">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${graphWidth} ${graphHeight + 20}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#6366f1" floodOpacity="0.3" />
                  </filter>
                </defs>

                {[0, 25, 50, 75, 100].map((line, i) => (
                  <line key={i} x1="0" y1={graphHeight - (line / 100 * graphHeight)} x2="100" y2={graphHeight - (line / 100 * graphHeight)} stroke="#f3f4f6" strokeWidth="0.5" strokeDasharray="2" />
                ))}

                <path d={areaD} fill="url(#chartGradient)" />
                <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" filter="url(#shadow)" className="drop-shadow-sm" />

                {points.map((p, i) => {
                  const isHovered = hoveredIndex === i;
                  const isToday = WEEKLY_STATS[i].day === '금';

                  return (
                    <g
                      key={i}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className="cursor-pointer"
                    >
                      <circle cx={p.x} cy={p.y} r={isHovered || isToday ? 3 : 2} fill="white" stroke="#6366f1" strokeWidth={isHovered || isToday ? 2 : 1.5} className="transition-all duration-300 ease-out" />
                      {isToday && (
                        <circle cx={p.x} cy={p.y} r="6" fill="none" stroke="#6366f1" strokeOpacity="0.3" strokeWidth="1">
                          <animate attributeName="r" from="3" to="8" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      )}
                      {(hoveredIndex === i || isToday) && (
                        <g transform={`translate(${p.x}, ${p.y - 12})`}>
                          <rect x="-14" y="-18" width="28" height="16" rx="4" fill="#1e1b4b" fillOpacity="0.9" />
                          <polygon points="0,0 -3,-3 3,-3" fill="#1e1b4b" fillOpacity="0.9" transform="translate(0, -2)" />
                          <text x="0" y="-8" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" dominantBaseline="middle">{WEEKLY_STATS[i].rate}%</text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              <div className="flex justify-between px-[10%] mt-2">
                {WEEKLY_STATS.map((d, i) => (
                  <span key={i} className={`text-[10px] w-6 text-center transition-colors ${d.day === '금' ? 'font-bold text-indigo-600 bg-indigo-50 rounded-md py-0.5' : 'text-gray-400'}`}>
                    {d.day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. 주간 계획표 (Weekly Plan) */}
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
                  {plan.isToday ? (
                    isLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      </div>
                    ) : (
                      todayTasks.length > 0 ? (
                        todayTasks.map((task) => (
                          <div
                            key={task.task_id}
                            onClick={() => handleToggleTask(task.task_id)}
                            className={`p-2 rounded-lg text-[11px] leading-tight font-medium cursor-pointer transition-all hover:opacity-80 select-none ${task.is_completed
                              ? 'bg-blue-100 text-blue-400 line-through opacity-60'
                              : 'bg-blue-50 text-blue-700'
                              }`}
                          >
                            <div className="font-extrabold mb-0.5 opacity-80 flex items-center gap-1">
                              {task.is_completed && <CheckCircle2 className="w-3 h-3" />}
                              {task.category || "Mission"}
                            </div>
                            <div>{task.title}</div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-1">
                          <span className="text-[10px]">미션 없음</span>
                        </div>
                      )
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

      {/* 🕒 [모달] 시간표 설정 (기존 유지) */}
      {isScheduleOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6">
            <h3 className="font-bold text-lg mb-4">시간표 설정</h3>
            <p className="text-gray-500 mb-6">시간표 설정 기능은 별도 컴포넌트로 관리됩니다.</p>
            <button onClick={() => setIsScheduleOpen(false)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}