"use client";

import { useState, useEffect } from "react";
import { useStudy } from "../../context/StudyContext";
import {
  CheckCircle2, Flame,
  BrainCircuit, Target, ChevronRight,
  BookOpen, Lock, Edit3,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";

// --- 타입 정의 ---
interface UserProps {
  id: string;
  name: string;
  role: string;
  streak?: number;
}

interface ApiTask {
  task_id: string;
  category: string;
  title: string;
  subtitle: string;
  assigned_minutes: number;
  is_completed: boolean;
  status: string;
}

interface ApiScheduleSlot {
  time_slot: string;
  task: ApiTask | null;
}

interface SubjectMission {
  subject: string;
  progress: number;
  completed: number;
  total: number;
  color: string;
}

interface TimeSlot {
  startHour: number;
  endHour: number;
  duration: number;
  type: "mission" | "unavailable";
  label: string;
  taskId?: number;
  isDone?: boolean;
}

const MISSION_STATUS: SubjectMission[] = [
  { subject: "수학", progress: 75, completed: 3, total: 4, color: "bg-blue-500" },
  { subject: "영어", progress: 40, completed: 2, total: 5, color: "bg-yellow-400" },
  { subject: "국어", progress: 100, completed: 3, total: 3, color: "bg-green-500" },
  { subject: "탐구", progress: 20, completed: 1, total: 5, color: "bg-purple-500" },
];

export default function StudentDashboard({ user }: { user: UserProps }) {
  const { schedule, tasks } = useStudy();

  const [mounted, setMounted] = useState(false);
  const [timeline, setTimeline] = useState<TimeSlot[]>([]);
  const [missionDate, setMissionDate] = useState<string>("");

  const [dashboardSummary, setDashboardSummary] = useState<{
    student_name: string;
    streak_days: number;
    today_available_minutes: number;
    today_date: string;
  } | null>(null);

  // 진척도 계산
  const missionSlots = timeline.filter(t => t.type === "mission");
  const calcProgress = missionSlots.length > 0
    ? Math.round((missionSlots.filter(t => t.isDone).length / missionSlots.length) * 100)
    : 0;

  useEffect(() => {
    setMounted(true);
    // 로그 시작
    console.group("🚀 [Dashboard Debug] 초기화 시작");
    console.log("👤 User Info:", user);

    fetchDashboardSummary();
    fetchTodayMission();

    return () => console.groupEnd();
  }, []);

  const fetchDashboardSummary = async () => {
    console.log("📊 [1. 대시보드 요약] API 호출 시작...");
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error("❌ [1. 대시보드 요약] 토큰 없음 (로그인 필요)");
        return;
      }

      const response = await fetch("https://mirror-backend-5j11.onrender.com/my/dashboard", {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });

      console.log(`📊 [1. 대시보드 요약] 응답 상태: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log("📊 [1. 대시보드 요약] 수신 데이터:", data);
        if (data.success) {
          setDashboardSummary(data.data);
          console.log("✅ [1. 대시보드 요약] 상태 업데이트 완료");
        }
      } else {
        console.error("❌ [1. 대시보드 요약] API 에러");
      }
    } catch (error) {
      console.error("❌ [1. 대시보드 요약] 네트워크/로직 에러:", error);
    }
  };

  const fetchTodayMission = async () => {
    console.log("📅 [2. 오늘의 미션] API 호출 시작...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`https://mirror-backend-5j11.onrender.com/my/missions/today`, {
        headers: { "Authorization": `Bearer ${session.access_token}` }
      });

      console.log(`📅 [2. 오늘의 미션] 응답 상태: ${res.status}`);

      if (res.ok) {
        const data = await res.json();
        console.log("📅 [2. 오늘의 미션] 수신 데이터(Raw):", data);

        if (data.success && data.data?.schedule) {
          setMissionDate(data.data.mission_date);
          console.log("⚙️ [3. 데이터 가공] 스케줄 처리 시작 (raw length):", data.data.schedule.length);
          processScheduleData(data.data.schedule);
        } else {
          console.warn("⚠️ [2. 오늘의 미션] 데이터가 없거나 schedule 배열이 비어있음");
        }
      }
    } catch (err) {
      console.error("❌ [2. 오늘의 미션] 에러 발생:", err);
    }
  };

  const processScheduleData = (schedule: ApiScheduleSlot[]) => {
    const tempTimeline: TimeSlot[] = [];

    schedule.forEach((slot, idx) => {
      const hour = parseInt(slot.time_slot.split(':')[0]);
      if (!isNaN(hour)) {
        const isMission = !!slot.task;

        // 데이터 변환 로그 (너무 많으면 주석 처리)
        // console.log(`  🔹 Slot ${idx} (${hour}시):`, isMission ? "미션 있음" : "불가능", slot.task?.title);

        tempTimeline.push({
          startHour: hour,
          endHour: hour + 1,
          duration: 1,
          type: isMission ? "mission" : "unavailable",
          label: isMission ? slot.task!.title : "공부 불가능",
          taskId: isMission ? parseInt(slot.task!.task_id) : undefined,
          isDone: isMission ? slot.task!.is_completed : false,
        });
      }
    });

    console.log("🧩 [3. 데이터 가공] 병합 전 타임라인:", tempTimeline);

    // 연속된 같은 타입 병합
    const mergedTimeline: TimeSlot[] = [];
    let i = 0;
    while (i < tempTimeline.length) {
      const current = tempTimeline[i];
      let duration = 1;
      let endHour = current.endHour;

      while (
        i + duration < tempTimeline.length &&
        tempTimeline[i + duration].type === current.type &&
        (current.type === "unavailable" || tempTimeline[i + duration].label === current.label) &&
        tempTimeline[i + duration].startHour === endHour
      ) {
        endHour = tempTimeline[i + duration].endHour;
        duration++;
      }
      mergedTimeline.push({ ...current, endHour, duration });
      i += duration;
    }

    console.log("✅ [4. 최종 결과] UI에 그려질 타임라인:", mergedTimeline);
    setTimeline(mergedTimeline);
  };

  const handleSlotClick = async (slot: TimeSlot) => {
    if (slot.type !== "mission" || !slot.taskId) return;

    console.log(`👆 [Click] Task ${slot.taskId} 클릭됨. 변경할 상태: ${!slot.isDone}`);

    const newStatus = !slot.isDone;

    setTimeline(prev => prev.map(t =>
      t.taskId === slot.taskId ? { ...t, isDone: newStatus } : t
    ));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const res = await fetch(`https://mirror-backend-5j11.onrender.com/my/tasks/${slot.taskId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ is_completed: newStatus })
      });

      if (!res.ok) throw new Error("Server update failed");
      console.log("✅ [API] 상태 업데이트 성공 (Server Synced)");

    } catch (error) {
      console.error("❌ [API] 업데이트 실패:", error);
      // 롤백
      setTimeline(prev => prev.map(t =>
        t.taskId === slot.taskId ? { ...t, isDone: !newStatus } : t
      ));
      alert("오류가 발생했습니다.");
    }
  };

  if (!mounted) return <div className="min-h-screen bg-gray-50" />;

  return (
    <div className="min-h-screen bg-gray-50 flex animate-fade-in">
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              반가워요, {user?.name || '학생'}님! 👋
            </h1>
            <p className="text-gray-500 text-sm">오늘의 미션을 클리어해보세요!</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span className="font-bold text-gray-700">{dashboardSummary?.streak_days || user?.streak || 1}일 연속</span>
            </div>
            <Link href="/student/schedule/edit" className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700">
              <Edit3 className="w-4 h-4" />
              <span className="font-bold text-xs">시간표 수정하기</span>
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
              {/* Timeline Header */}
              <div className="flex justify-between items-end mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 px-2 py-1 rounded text-xs font-bold text-blue-600">Time Table</span>
                    {missionDate && (
                      <span className="text-xs text-gray-400 font-medium">
                        📅 {new Date(missionDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                      </span>
                    )}
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

              {/* Timeline List */}
              <div className="space-y-3 relative">
                <div className="absolute left-[3.25rem] top-4 bottom-4 w-0.5 bg-gray-100 hidden md:block"></div>

                {timeline.map((slot, index) => {
                  const isMission = slot.type === "mission";
                  const isCompleted = slot.isDone;
                  const startTime = `${String(slot.startHour).padStart(2, '0')}:00`;

                  let cardClass = "";

                  if (isMission) {
                    if (isCompleted) {
                      cardClass = "bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-200 ring-offset-1 transform scale-[1.01] cursor-pointer";
                    } else {
                      cardClass = "bg-white border-blue-200 text-gray-800 hover:border-blue-400 hover:shadow-md cursor-pointer group active:scale-95";
                    }
                  } else {
                    cardClass = "bg-gray-100 border-transparent text-gray-400 cursor-default select-none grayscale opacity-70";
                  }

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
                        className={`flex-1 p-4 rounded-2xl flex justify-between items-center transition-all duration-200 border ${cardClass}`}
                      >
                        <div className="flex items-center gap-4">
                          {isMission ? (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${isCompleted ? 'bg-white/20' : 'bg-blue-50'}`}>
                              {isCompleted ? <CheckCircle2 className="w-6 h-6 text-white" /> : <BookOpen className="w-5 h-5 text-blue-500" />}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Lock className="w-5 h-5 text-gray-500" />
                            </div>
                          )}

                          <div className="flex flex-col">
                            <span className={`font-bold text-base ${isMission && !isCompleted ? 'group-hover:text-blue-600' : ''}`}>
                              {slot.label}
                            </span>

                            {isMission ? (
                              <span className={`text-xs mt-0.5 ${isCompleted ? 'text-blue-100' : 'text-gray-400'}`}>
                                {isCompleted ? '완료됨' : '미션 수행하기'}
                              </span>
                            ) : (
                              <span className="text-xs mt-0.5 text-gray-400">
                                공부 불가능 시간 ({slot.duration}시간)
                              </span>
                            )}
                          </div>
                        </div>

                        {isMission && (
                          <div className={`text-xs px-2.5 py-1 rounded-lg font-bold ${isCompleted ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {slot.duration * 60}분
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {timeline.length === 0 && (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 mb-2">오늘의 시간표가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Side Panel) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-20 h-20 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                <Target className="w-5 h-5 text-blue-600" /> Mirror AI 코칭
              </h3>
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed mb-4 relative z-10">
                "{user?.name || '학생'}님, {dashboardSummary?.student_name ? `${dashboardSummary.student_name}님` : ''} 어제 <span className="font-bold text-blue-600">수학</span> 미션을 놓치셨네요. 오늘은 꼭 챙겨볼까요?"
              </div>
              <Link href="/student/chat" className="text-xs text-blue-500 hover:underline flex items-center gap-1 relative z-10 font-bold">
                조언 듣기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

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
                        <span className="text-xs text-gray-400 font-medium">({item.completed}/{item.total})</span>
                      </div>
                      <span className={`text-sm font-bold ${item.progress === 100 ? 'text-green-500' : 'text-blue-600'}`}>{item.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: mounted ? `${item.progress}%` : '0%' }}></div>
                    </div>
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