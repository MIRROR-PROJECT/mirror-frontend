// app/dashboard/page.tsx
import { createClient } from "../utils/supabase/server";
import { redirect } from "next/navigation";

import StudentDashboard from "../components/dashboard/StudentDashboard";
import TeacherDashboard from "../components/dashboard/TeacherDashboard";
import ParentDashboard from "../components/dashboard/ParentDashboard";

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const paramRole = typeof searchParams.role === 'string' ? searchParams.role : null;

  const supabase = await createClient();

  // 1. 유저 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. 역할 확인 (Supabase users 테이블)
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const role = (userData?.role || paramRole || "").toLowerCase();

  // 3. Role이 없으면 무조건 /onboarding/role로
  if (!role && !paramRole) {
    console.log('📋 [Dashboard] Role 없음 -> /onboarding/role로 리다이렉트');
    redirect('/onboarding/role');
  }

  // 4. 학생인 경우: 진단 완료 여부 체크 (전화번호 기반)
  if (role === 'student') {
    // 전화번호가 있으면 진단 완료로 간주
    const phoneNumber = userData?.phone_number;
    console.log('🔍 [Dashboard] 진단 완료 체크 - phone_number:', phoneNumber);

    if (!phoneNumber) {
      console.log('📋 [Dashboard] 전화번호 없음 -> 진단 미완료 -> /onboarding/role로 리다이렉트');
      redirect('/onboarding/role');
    } else {
      console.log('✅ [Dashboard] 전화번호 확인 -> 진단 완료 -> 대시보드 표시');
    }

    return <StudentDashboard user={userData} />;
  }

  if (role === 'teacher') {
    return <TeacherDashboard user={userData} />;
  }

  if (role === 'parent') {
    return <ParentDashboard user={userData} />;
  }

  return <div>알 수 없는 사용자 역할입니다.</div>;
}
