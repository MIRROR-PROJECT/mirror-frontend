"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudy } from "../../../context/StudyContext"; // 경로 맞춰주세요
import { 
  ChevronLeft, Check, RefreshCcw, Maximize
} from "lucide-react";

// [수정] 복잡한 타입 제거. 단순히 "study" 값만 사용합니다.
// 키가 있으면 "공부 가능", 없으면 "공부 불가"로 처리합니다.
type ScheduleMap = Record<string, "study">;

const HOURS = Array.from({ length: 15 }, (_, i) => i + 9); // 09:00 ~ 23:00
const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

export default function ScheduleEditPage() {
  const router = useRouter();
  const { schedule, updateSchedule } = useStudy();

  const [localSchedule, setLocalSchedule] = useState<ScheduleMap>({});
  
  // 드래그 상태 관리
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"add" | "remove">("add"); 
  const [isSaving, setIsSaving] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    if (schedule) {
      // Context에서 가져온 데이터 중 "study"인 것만 남기고 나머지는 무시(필터링)할 수도 있습니다.
      // 여기서는 단순 복사합니다.
      setLocalSchedule(JSON.parse(JSON.stringify(schedule)));
    }
  }, [schedule]);

  // 드래그 종료 감지
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  // --- 핵심 로직 수정됨 ---
  const updateSlot = (dayIdx: number, hour: number, mode: "add" | "remove") => {
    const key = `${dayIdx}-${hour}`;
    setLocalSchedule(prev => {
      const next = { ...prev };
      if (mode === "add") {
        next[key] = "study"; // 공부 시간으로 설정
      } else {
        delete next[key]; // [핵심] "rest" 값을 넣는 게 아니라, 아예 삭제해버림 (빈 시간 처리)
      }
      return next;
    });
  };

  const handleMouseDown = (dayIdx: number, hour: number) => {
    const key = `${dayIdx}-${hour}`;
    // 이미 'study'라면 -> 지우기(remove), 아니면 -> 칠하기(add)
    const isCurrentlyStudy = localSchedule[key] === "study";
    const mode = isCurrentlyStudy ? "remove" : "add";
    
    setDragMode(mode);
    setIsDragging(true);
    updateSlot(dayIdx, hour, mode);
  };

  const handleMouseEnter = (dayIdx: number, hour: number) => {
    if (isDragging) {
      updateSlot(dayIdx, hour, dragMode);
    }
  };

  const clearCurrentWeek = () => {
    setLocalSchedule({}); // 맵을 비워버리면 모두 "불가" 상태가 됨
  };

  const fillCurrentWeek = () => {
    const newSchedule: ScheduleMap = {};
    for (let d = 0; d < 7; d++) {
      for (const h of HOURS) {
        newSchedule[`${d}-${h}`] = "study";
      }
    }
    setLocalSchedule(newSchedule);
  };

  const calculateTotalHours = () => {
    // 키가 존재하는 개수가 곧 공부 시간
    return Object.keys(localSchedule).length;
  };

  const handleSave = () => {
    setIsSaving(true);
    if (updateSchedule) {
      // @ts-ignore: Context의 타입 정의와 호환되도록 그대로 넘깁니다.
      updateSchedule(localSchedule);
    }
    setTimeout(() => {
      setIsSaving(false);
      router.back();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none">
      
      {/* 상단 네비게이션 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">공부 시간 설정</h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-5 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-md transition-all ${isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isSaving ? "저장 중..." : <><Check className="w-4 h-4" /> 저장</>}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-xl mx-auto w-full p-4 md:p-6 space-y-6">
        
        {/* 안내 문구 */}
        <div className="text-center">
           <h2 className="text-2xl font-bold text-gray-900">주간 루틴 설정</h2>
           <p className="text-gray-500 text-sm mt-1">
             드래그하여 공부 가능한 시간을 파란색으로 표시하세요.
           </p>
        </div>

        {/* 컨트롤 패널 */}
        <div className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="grid grid-cols-2 gap-2">
             <button onClick={clearCurrentWeek} className="flex items-center justify-center gap-1 py-2 text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
               <RefreshCcw className="w-3 h-3" /> 전체 비우기
             </button>
             <button onClick={fillCurrentWeek} className="flex items-center justify-center gap-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
               <Maximize className="w-3 h-3" /> 전체 채우기
             </button>
          </div>
          <div className="flex justify-between items-center px-1 pt-2 border-t border-gray-100">
            <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
              확보된 시간: <span className="text-blue-600 text-lg font-black">{calculateTotalHours()}시간</span>
            </span>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-sm shadow-sm"></div>가능</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 bg-white border border-gray-300 rounded-sm"></div>불가</div>
            </div>
          </div>
        </div>

        {/* 그리드 UI */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-inner bg-white select-none">
          {/* 헤더 */}
          <div className="grid border-b border-gray-200 bg-gray-50" style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}>
            <div className="p-2 text-[10px] font-bold text-gray-400 text-center border-r border-gray-200 flex items-center justify-center">
              Time
            </div>
            {WEEK_DAYS.map((dayLabel, i) => (
              <div key={i} className="p-2 text-xs font-bold text-center border-r border-gray-200 last:border-r-0 text-gray-600">
                {dayLabel}
              </div>
            ))}
          </div>

          {/* 바디 (스크롤 영역) */}
          <div className="h-[60vh] overflow-y-auto custom-scrollbar relative">
            {HOURS.map((hour) => (
              <div key={hour} className="grid h-10 border-b border-gray-100 last:border-b-0" style={{ gridTemplateColumns: `40px repeat(7, 1fr)` }}>
                {/* 시간 라벨 */}
                <div className="text-[10px] text-gray-400 font-medium flex items-center justify-center border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
                  {hour}:00
                </div>

                {/* 요일별 셀 */}
                {WEEK_DAYS.map((_, dayIdx) => {
                  const key = `${dayIdx}-${hour}`;
                  // 단순히 키가 존재하는지(값인 "study"인지)만 체크
                  const isSelected = localSchedule[key] === "study";

                  return (
                    <div
                      key={key}
                      // [수정 포인트] e.preventDefault() 추가
                      onMouseDown={(e) => {
                        e.preventDefault(); // 브라우저 고유 드래그/선택 방지
                        handleMouseDown(dayIdx, hour);
                      }}
                      onMouseEnter={() => handleMouseEnter(dayIdx, hour)}
                      className={`
                        cursor-pointer transition-colors duration-75 border-r border-gray-100 last:border-r-0
                        ${isSelected ? "bg-blue-500 hover:bg-blue-400" : "bg-white hover:bg-gray-50"}
                      `}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}