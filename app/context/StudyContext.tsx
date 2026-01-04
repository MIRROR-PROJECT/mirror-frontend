"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/app/lib/supabase";

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

// 시간표 타입
export type ScheduleMap = Record<string, "study" | "fixed">;

// [NEW] 유저 기본 정보 타입 (진단 페이지에서 넘어오는 데이터)
export type UserInfo = {
  name: string;
  grade: string;
  semester: string;
  subjects: string[];
};

interface StudyContextType {
  // 유저 상태 (학습 연속일, 역할)
  user: { streak: number; role: "student" | "teacher" | "parent" };

  // 데이터
  tasks: Task[];
  books: Book[];
  schedule: ScheduleMap;

  // [NEW] 유저 기본 정보 (이름, 학년 등)
  userInfo: UserInfo;

  // 액션 함수들
  toggleTask: (taskId: number) => void;
  updateSchedule: (newSchedule: ScheduleMap) => void;
  updateUserInfo: (info: UserInfo) => void; // [NEW] 정보 업데이트 함수
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
  // 1. 유저 상태 (Streak, Role) - role은 동적으로 가져옴
  const [user, setUser] = useState<{ streak: number; role: "student" | "teacher" | "parent" }>({
    streak: 14,
    role: "student"
  });

  // 2. [NEW] 유저 기본 정보 (초기값 빈 값)
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "",
    grade: "",
    semester: "",
    subjects: [],
  });

  // Supabase에서 실제 유저 role 가져오기
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          console.warn("⚠️ [StudyContext] No authenticated user");
          return;
        }

        // users 테이블에서 role 조회
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error("❌ [StudyContext] Failed to fetch user role from DB:", error);
          return;
        }

        if (userData?.role) {
          const userRole = userData.role as "student" | "teacher" | "parent";
          console.log("✅ [StudyContext] User role loaded from DB:", userRole);
          setUser(prev => ({ ...prev, role: userRole }));
        } else {
          console.warn("⚠️ [StudyContext] No role found in database");
        }
      } catch (error) {
        console.error("❌ [StudyContext] Failed to fetch user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  // 3. 책 데이터 (더미)
  const [books, setBooks] = useState<Book[]>([
    { id: 1, title: "수학 I : 쎈 (SSEN)", subject: "수학", progress: 65, lastStudied: "2시간 전", coverColor: "bg-blue-600", aiAnalysis: "취약 유형: 로그함수" },
    { id: 2, title: "수능특강 영어 독해연습", subject: "영어", progress: 32, lastStudied: "어제", coverColor: "bg-green-600", aiAnalysis: "안정권 진입 중" },
    { id: 3, title: "완자 화학 I", subject: "과학", progress: 12, lastStudied: "3일 전", coverColor: "bg-purple-600", aiAnalysis: "개념 학습 필요" },
    { id: 4, title: "매3비 (매일 3개 비문학)", subject: "국어", progress: 88, lastStudied: "1주 전", coverColor: "bg-orange-500", aiAnalysis: "마무리 단계" },
  ]);

  // 4. 할 일 데이터 (더미)
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "워밍업: 지난 오답 3문제", time: 10, done: false, bookId: 1 },
    { id: 2, title: "메인: 지수함수 필수 유형 15선", time: 60, done: false, bookId: 1 },
    { id: 3, title: "마무리: 해설 강의 & 복습", time: 20, done: false, bookId: 1 },
  ]);

  // 5. 시간표 데이터
  const [schedule, setSchedule] = useState<ScheduleMap>(() => {
    const initial: ScheduleMap = {};
    // 초기값: 월(0) ~ 금(4) 저녁 19시~22시 자습
    for (let d = 0; d < 5; d++) {
      for (let h = 19; h <= 22; h++) {
        initial[`${d}-${h}`] = "study";
      }
    }
    return initial;
  });

  // --- Actions ---

  // Task 토글
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

  // 시간표 업데이트
  const updateSchedule = (newSchedule: ScheduleMap) => {
    setSchedule(newSchedule);
  };

  // [NEW] 유저 정보 업데이트
  const updateUserInfo = (info: UserInfo) => {
    setUserInfo(info);
    console.log("✅ 유저 정보 Context 업데이트 완료:", info);
  };

  return (
    <StudyContext.Provider value={{
      user,
      userInfo, // 추가됨
      tasks,
      books,
      schedule,
      toggleTask,
      updateSchedule,
      updateUserInfo // 추가됨
    }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) throw new Error("useStudy must be used within a StudyProvider");
  return context;
}