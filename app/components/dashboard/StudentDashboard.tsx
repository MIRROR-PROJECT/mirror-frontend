"use client";

import { useState, useEffect, useMemo } from "react";
import { useStudy } from "../../context/StudyContext"; 
import { 
  CheckCircle2, TrendingUp, Calendar, 
  Flame, Zap, BrainCircuit, Target,
  ChevronRight, Clock, MessageCircle, BookOpen, History
} from "lucide-react";
import Link from "next/link";

// --- 타입 정의 (유지보수를 위해 명시) ---
interface UserProps {
  id: string;
  name: string;
  role: string;
  streak?: number; // DB에 없을 수도 있으니 옵셔널
}

interface WeaknessItem {
  label: string;
  score: number;
  color: string;
}

// 더미 데이터: 과목별 취약점
const WEAKNESS_DATA: { [key: string]: WeaknessItem[] } = {
  "수학": [
    { label: "지수함수의 활용", score: 45, color: "bg-red-500" },
    { label: "로그의 성질", score: 72, color: "bg-yellow-400" },
    { label: "삼각함수 그래프", score: 88, color: "bg-green-500" },
  ],
  "영어": [
    { label: "빈칸 추론", score: 50, color: "bg-red-500" },
    { label: "순서 배열", score: 65, color: "bg-yellow-400" },
    { label: "도표 분석", score: 95, color: "bg-green-500" },
  ],
  "과학": [
    { label: "역학적 에너지", score: 30, color: "bg-red-500" },
    { label: "산화와 환원", score: 60, color: "bg-yellow-400" },
  ]
};

export default function StudentDashboard({ user }: { user: UserProps }) {
  // 1. Context에서 user는 제외하고 가져옵니다. (Props user와 충돌 방지)
  const { tasks, schedule, toggleTask } = useStudy();
  
  const [selectedSubject, setSelectedSubject] = useState("수학");
  const [mounted, setMounted] = useState(false);
  const [weekDays, setWeekDays] = useState<{ day: string, date: number, isToday: boolean, isFuture: boolean }[]>([]);
  const [todayMinutes, setTodayMinutes] = useState(0);

  // 2. 날짜 및 시간 계산 로직을 useEffect로 통합 (하이드레이션 에러 방지)
  useEffect(() => {
    setMounted(true);
    const today = new Date();
    
    // --- 주간 캘린더 생성 ---
    const tempWeek = [];
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']; 

    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i); 
      tempWeek.push({
        day: dayNames[d.getDay()],
        date: d.getDate(),
        isToday: i === 0,
        isFuture: i > 0
      });
    }
    setWeekDays(tempWeek);

    // --- 오늘 가용 시간 계산 ---
    // schedule Key: "0-9" (월요일 9시) ~ "6-23" (일요일 23시)
    // today.getDay(): 0(일) ~ 6(토)
    // 변환: 일(0)->6, 월(1)->0, 화(2)->1 ...
    const internalDay = (today.getDay() + 6) % 7; 
    
    let slots = 0;
    if (schedule) {
      Object.entries(schedule).forEach(([key, val]) => {
        if (val === "study" && key.startsWith(`${internalDay}-`)) {
          slots++;
        }
      });
    }
    setTodayMinutes(slots * 60);

  }, [schedule]); // schedule이 로드되면 다시 계산

  const toggleLocalTask = (id: number) => {
    toggleTask(id);
  };

  // tasks가 undefined일 경우 방어
  const currentTasks = tasks || [];
  const progress = currentTasks.length > 0 
    ? Math.round((currentTasks.filter(t => t.done).length / currentTasks.length) * 100) 
    : 0;

  // 화면이 클라이언트에 마운트되기 전에는 아무것도 보여주지 않음 (UI 깨짐 방지)
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
              {/* user.streak가 없으면 0일로 처리 */}
              <span className="font-bold text-gray-700">{user?.streak || 1}일 연속</span>
            </div>
            
            <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div className="flex flex-col items-end leading-none">
                <span className="font-bold text-gray-700 text-xs mb-0.5">
                  오늘 가용 시간
                </span>
                <span className="text-sm text-blue-600 font-black">
                  {todayMinutes > 0 ? `${todayMinutes}분` : "일정 없음"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 대시보드 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* [Left Column] 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* A. 오늘의 메인 미션 카드 */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden transition-transform hover:scale-[1.01] duration-300">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
              
              <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold text-blue-100 backdrop-blur-sm">Today's Mission</span>
                    <span className="flex items-center gap-1 text-xs text-blue-200">
                      <Clock className="w-3 h-3" /> 목표: {todayMinutes}분
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold">
                    {/* 데이터가 있다면 첫 번째 task의 과목 등을 표시하는 것이 좋음 */}
                    지수함수 완전 정복
                  </h2>
                </div>
                
                {/* 진행률 원형 그래프 (심플 버전) */}
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 hidden sm:block">
                  <div className="text-center min-w-[60px]">
                    <span className="block text-2xl font-bold">{progress}%</span>
                    <span className="text-[10px] text-blue-200 uppercase tracking-wider">Completed</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                {currentTasks.length === 0 ? (
                    <div className="text-blue-200 text-sm text-center py-4 bg-white/5 rounded-xl">
                        등록된 할 일이 없습니다. 일정을 생성해보세요!
                    </div>
                ) : (
                    currentTasks.map((task) => (
                    <div 
                        key={task.id} 
                        onClick={() => toggleLocalTask(task.id)}
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                        task.done 
                            ? 'bg-blue-800/40 border-blue-700/30 text-blue-200' 
                            : 'bg-white/10 border-white/20 hover:bg-white/20 text-white'
                        }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${task.done ? 'bg-white border-white' : 'border-blue-300'}`}>
                        {task.done && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                        <p className={`font-medium ${task.done ? 'line-through decoration-blue-400/50' : ''}`}>{task.title}</p>
                        </div>
                        <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded text-white">{task.time}분</span>
                    </div>
                    ))
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Link href="/student/chat" className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  모르는 문제 AI에게 질문하기
                </Link>
              </div>
            </div>

            {/* B. 나의 학습 리듬 */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" /> 나의 학습 리듬
                  </h3>
                </div>
                
                <button className="flex items-center gap-1 text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <History className="w-3 h-3" />
                  과거 내역
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((item, i) => {
                  // 더미 데이터 강도 (실제로는 DB 데이터 연동 필요)
                  const intensity = item.isFuture ? 0 : [2, 1, 2, 1, 0, 0, 0][i];
                  let bgColor = "bg-white border-gray-100";
                  let dateColor = "text-gray-400";
                  
                  if (intensity === 1) { 
                    bgColor = "bg-blue-50 border-blue-100";
                    dateColor = "text-blue-600";
                  } else if (intensity === 2) { 
                    bgColor = "bg-blue-600 border-blue-600 shadow-sm";
                    dateColor = "text-white";
                  }

                  const todayBorder = item.isToday ? "ring-2 ring-offset-1 ring-blue-500 border-blue-500" : "";
                  const dayText = item.isToday ? "text-blue-600 font-extrabold" : "text-gray-400";

                  return (
                    <div key={i} className={`flex flex-col group cursor-pointer gap-1 ${item.isFuture ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                      <div className={`text-[10px] text-center font-medium ${dayText}`}>
                        {item.isToday ? '오늘' : item.day}
                      </div>
                      <div className={`h-14 rounded-xl flex flex-col items-center justify-center border transition-all relative overflow-hidden ${bgColor} ${todayBorder}`}>
                        <span className={`text-sm font-bold ${dateColor}`}>
                          {item.date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* [Right Column] 사이드 패널 */}
          <div className="space-y-6">
            
            {/* C. AI 코치 메시지 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-20 h-20 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Mirror AI 코칭
              </h3>
              <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed mb-4 relative z-10">
                "{user?.name || '학생'}님, 어제 <span className="font-bold text-blue-600">지수법칙</span> 유형에서 계산 실수가 잦았어요. 오늘은 문제 풀 때 <span className="bg-yellow-200 px-1 font-bold">암산 금지!</span> 풀이 과정을 꼭 적어보세요."
              </div>
              <Link href="/student/chat" className="text-xs text-blue-500 hover:underline flex items-center gap-1 relative z-10 font-bold">
                AI 튜터에게 자세한 조언 듣기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            
            {/* D. 과목별 취약점 분석 */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-500" /> 취약 유형
                </h3>
              </div>
              
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {Object.keys(WEAKNESS_DATA).map(subject => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                      selectedSubject === subject 
                        ? "bg-gray-800 text-white" 
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {WEAKNESS_DATA[selectedSubject]?.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                      <span>{item.label}</span>
                      <span>{item.score}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`} 
                        style={{ width: mounted ? `${item.score}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 text-xs text-gray-500 font-medium border border-gray-200 py-3 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors">
                <BookOpen className="w-3 h-3" /> 해당 유형 문제 더 풀기
              </button>
            </div>

            {/* E. 랭킹 */}
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
                        {/* 더미 아바타 */}
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