import { 
  LayoutDashboard, BookOpen, BarChart2, MessageCircle, 
  Users, ClipboardList, FolderOpen, MessageSquareText,
  CreditCard, UserCircle 
} from "lucide-react";

export const ROLE_MENUS = {
  // 1. 학생용
  student: [
    { name: "대시보드", path: "/student/dashboard", icon: LayoutDashboard },
    { name: "나의 학습방", path: "/student/study-room", icon: BookOpen },
    { name: "리포트", path: "/student/report", icon: BarChart2 },
    { name: "AI 튜터", path: "/student/chat", icon: MessageCircle },
  ],
  
  // 2. 강사용 (✨ 업데이트됨)
  teacher: [
    { name: "워크스페이스", path: "/teacher/dashboard", icon: LayoutDashboard },
    { name: "수강생 관리", path: "/teacher/students", icon: Users },
    { name: "수업 자료실", path: "/teacher/materials", icon: FolderOpen },
  ],

  // 3. 학부모용
  parent: [
    { name: "자녀 현황", path: "/parent/dashboard", icon: LayoutDashboard },
    { name: "학습 리포트", path: "/parent/child-report", icon: BarChart2 },
  ],
};