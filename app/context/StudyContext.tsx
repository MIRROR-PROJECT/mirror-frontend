"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// --- 데이터 타입 정의 ---
type Task = { 
  id: number; 
  title: string; 
  time: number; 
  done: boolean; 
  bookId?: number;
};

type Book = { 
  id: number; 
  title: string; 
  subject: string; 
  progress: number; 
  lastStudied: string; 
  coverColor: string; 
  aiAnalysis: string; 
};

// [NEW] 시간표 타입 (Key: "요일인덱스-시간", Value: "study" | "fixed")
// 예: "0-19" (월요일 19시) -> "study"
export type ScheduleMap = Record<string, "study" | "fixed">;

interface StudyContextType {
  user: { name: string; streak: number };
  tasks: Task[];
  books: Book[];
  schedule: ScheduleMap; // 🆕 전역 시간표 데이터
  toggleTask: (taskId: number) => void;
  updateSchedule: (newSchedule: ScheduleMap) => void; // 🆕 시간표 업데이트 함수
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState({ name: "김민수", streak: 14 });

  // --- 기존 데이터 ---
  const [books, setBooks] = useState<Book[]>([
    { id: 1, title: "수학 I : 쎈 (SSEN)", subject: "수학", progress: 65, lastStudied: "2시간 전", coverColor: "bg-blue-600", aiAnalysis: "취약 유형: 로그함수" },
    { id: 2, title: "수능특강 영어 독해연습", subject: "영어", progress: 32, lastStudied: "어제", coverColor: "bg-green-600", aiAnalysis: "안정권 진입 중" },
    { id: 3, title: "완자 화학 I", subject: "과학", progress: 12, lastStudied: "3일 전", coverColor: "bg-purple-600", aiAnalysis: "개념 학습 필요" },
    { id: 4, title: "매3비 (매일 3개 비문학)", subject: "국어", progress: 88, lastStudied: "1주 전", coverColor: "bg-orange-500", aiAnalysis: "마무리 단계" },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "워밍업: 지난 오답 3문제", time: 10, done: false, bookId: 1 },
    { id: 2, title: "메인: 지수함수 필수 유형 15선", time: 60, done: false, bookId: 1 },
    { id: 3, title: "마무리: 해설 강의 & 복습", time: 20, done: false, bookId: 1 },
  ]);

  // --- [NEW] 시간표 데이터 (초기값: 월~금 19시~22시 자습) ---
  const [schedule, setSchedule] = useState<ScheduleMap>(() => {
    const initial: ScheduleMap = {};
    // 예시: 월(0) ~ 금(4) 저녁 19시~22시는 공부 시간
    for (let d = 0; d < 5; d++) {
      for (let h = 19; h <= 22; h++) {
        initial[`${d}-${h}`] = "study";
      }
    }
    return initial;
  });

  // Task 토글 함수
  const toggleTask = (taskId: number) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;
    const isNowDone = !targetTask.done;

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: isNowDone } : t));

    if (targetTask.bookId) {
      setBooks(prev => prev.map(b => {
        if (b.id === targetTask.bookId) {
          const change = isNowDone ? 5 : -5;
          const newProgress = Math.min(100, Math.max(0, b.progress + change));
          return { ...b, progress: newProgress, lastStudied: "방금 전" };
        }
        return b;
      }));
    }
  };

  // [NEW] 시간표 업데이트 함수
  const updateSchedule = (newSchedule: ScheduleMap) => {
    setSchedule(newSchedule);
    // 나중에는 여기서 서버로 DB 저장 요청을 보내면 됩니다.
    console.log("시간표가 업데이트되었습니다:", newSchedule);
  };

  return (
    <StudyContext.Provider value={{ user, tasks, books, schedule, toggleTask, updateSchedule }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error("useStudy must be used within a StudyProvider");
  return context;
}