"use client";

import { useState, useRef, useEffect } from "react";
import { useStudy } from "../../context/StudyContext";
import {
  CalendarDays, CheckCircle2,
  Clock, Calendar, Award, BookOpen,
  X, Calendar as CalendarIcon, Loader2
} from "lucide-react";
import { supabase } from "@/app/lib/supabase";

// --- [API 명세서 기반 타입 정의] ---
interface ApiTask {
  task_id: string; // UUID
  category: string;
  title: string;
  subtitle: string;
  assigned_minutes: number;
  is_completed: boolean;
  status: "완료" | "잠김" | "진행 가능";
}

interface ApiScheduleSlot {
  time_slot: string; // "09:00"
  task: ApiTask | null;
}

// 응답 데이터 구조
interface TodayMissionResponse {
  mission_date: string;
  mission_title: string;
  total_minutes: number;
  completion_rate: number;
  schedule: ApiScheduleSlot[];
}

// [NEW] 학사 일정 데이터 (고정)
interface AcademicEvent {
  id: number;
  title: string;
  date: string;
  type: "csat" | "mock";
}

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
  const { updateSchedule } = useStudy(); // schedule 관련은 유지하되 tasks는 로컬 state 사용

  // --- [State] ---
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [weekDates, setWeekDates] = useState<{ day: string, date: number, isToday: boolean }[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<(AcademicEvent & { dDay: number })[]>([]);

  // [API Data] 오늘의 할 일 목록
  const [todayTasks, setTodayTasks] = useState<ApiTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [todayProgress, setTodayProgress] = useState(0);

  // --- [Effect] 초기 데이터 로드 ---
  useEffect(() => {
    calculateWeekDates();
    calculateDDay();
    fetchTodayMission(); // API 호출
  }, []);

  // 1. 주간 날짜 계산
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

  // 2. D-Day 계산
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

  // 3. [API] 오늘의 미션 가져오기
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

          // API의 schedule에서 실제 '과제'만 추출 (status가 '잠김'이 아니고 task가 있는 것)
          const validTasks = data.schedule
            .map(slot => slot.task)
            .filter((task): task is ApiTask => task !== null && task.status !== "잠김");

          setTodayTasks(validTasks);

          // 완료율 계산 (체크리스트 기반)
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

  // 4. [API] 할 일 완료 토글
  const handleToggleTask = async (taskId: string) => {
    // 1. 낙관적 업데이트 (UI 먼저 변경)
    const targetTask = todayTasks.find(t => t.task_id === taskId);
    if (!targetTask) return;
    const newStatus = !targetTask.is_completed;

    setTodayTasks(prev => prev.map(t =>
      t.task_id === taskId ? { ...t, is_completed: newStatus, status: newStatus ? "완료" : "진행 가능" } : t
    ));

    // 진척도 재계산 (UI용)
    setTodayProgress(prev => {
      const total = todayTasks.length;
      const currentCompleted = todayTasks.filter(t => t.is_completed).length;
      // 현재 클릭 반영
      const nextCompleted = newStatus ? currentCompleted + 1 : currentCompleted - 1;
      return Math.round((nextCompleted / total) * 100);
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 2. API 호출
      const res = await fetch(`https://mirror-backend-5j11.onrender.com/my/tasks/${taskId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ is_completed: newStatus })
      });

      if (!res.ok) throw new Error("API Error");

    } catch (error) {
      console.error("Toggle failed:", error);
      // 실패 시 롤백
      setTodayTasks(prev => prev.map(t =>
        t.task_id === taskId ? { ...t, is_completed: !newStatus } : t
      ));
      alert("상태 변경에 실패했습니다.");
    }
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

          {/* [우측] 오늘의 달성률 그래프 (API 데이터 연동) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> 오늘 달성률
              </h3>
              <span className="text-2xl font-black text-gray-900">
                {todayProgress}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-6">오늘 할 일 <span className="text-blue-600 font-bold">{todayTasks.length}개</span> 중 <span className="text-blue-600 font-bold">{todayTasks.filter(t => t.is_completed).length}개</span> 완료했어요!</p>

            <div className="flex-1 flex items-center justify-center">
              {/* 원형 그래프 시각화 (간단 버전) */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={351.86} strokeDashoffset={351.86 - (351.86 * todayProgress) / 100} className="text-blue-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-700">
                  {todayProgress}%
                </div>
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
                  {/* ✨ 오늘 날짜: API 데이터 (todayTasks) 렌더링 */}
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
                    /* 오늘이 아닌 날짜: 빈 상태 표시 (API는 오늘만 제공하므로) */
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
          {/* (시간표 설정 모달 내용은 기존 코드와 동일하여 생략하거나 그대로 사용하시면 됩니다) */}
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