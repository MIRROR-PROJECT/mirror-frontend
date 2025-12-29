"use client";

import { useStudy } from "@/app/context/StudyContext";
import StudentDashboard from "@/app/student/dashboard/StudentDashboard"; 
import TeacherDashboard from "@/app/teacher/dashboard/TeacherDashboard";
import ParentDashboard from "@/app/parent/dashboard/ParentDashboard";

export default function DashboardPage() {
  const { user } = useStudy();

  // 1. 역할별 컴포넌트 매핑
  const DASHBOARD_COMPONENTS = {
    student: <StudentDashboard />,
    teacher: <TeacherDashboard />,
    parent:  <ParentDashboard />,
  };

  // 2. 현재 역할에 맞는 것 렌더링 (없으면 학생용)
  return (
    <>
      {DASHBOARD_COMPONENTS[user.role] || <StudentDashboard />}
    </>
  );
}