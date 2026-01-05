import {
  LayoutDashboard, BookOpen, BarChart2, MessageCircle,
  Users, ClipboardList, FolderOpen, MessageSquareText,
  CreditCard, UserCircle
} from "lucide-react";

export const ROLE_MENUS = {
  // 1. 학생용
  student: [
    { name: "대시보드", nameKey: "nav.dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "나의 학습방", nameKey: "nav.myStudyRoom", path: "/student/study-room", icon: BookOpen },
    { name: "리포트", nameKey: "nav.report", path: "/student/report", icon: BarChart2 },
    { name: "AI 튜터", nameKey: "nav.aiTutor", path: "/student/chat", icon: MessageCircle },
  ],

  // 2. 강사용 (✨ 업데이트됨)
  teacher: [
    { name: "워크스페이스", nameKey: "nav.workspace", path: "/dashboard", icon: LayoutDashboard },
    { name: "수강생 관리", nameKey: "nav.students", path: "/teacher/students", icon: Users },
    { name: "일일 리포트", nameKey: "nav.dailyReport", path: "/teacher/report", icon: BarChart2 },
    { name: "수업 자료실", nameKey: "nav.materials", path: "/teacher/materials", icon: FolderOpen },
  ],

  // 3. 학부모용
  parent: [
    { name: "자녀 현황", nameKey: "nav.childStatus", path: "/dashboard", icon: LayoutDashboard },
    { name: "학습 리포트", nameKey: "nav.childReport", path: "/parent/child-report", icon: BarChart2 },
  ],
};