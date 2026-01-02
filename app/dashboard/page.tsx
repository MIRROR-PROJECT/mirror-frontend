// app/dashboard/page.tsx
import { createClient } from "../utils/supabase/server"; // 경로 주의 (@ 사용 추천)
import { redirect } from "next/navigation";
import Link from "next/link";

// ⚠️ 중요: app/student/... 가 아니라 components/... 에서 불러옵니다!
import StudentDashboard from "../components/dashboard/StudentDashboard";
import TeacherDashboard from "../components/dashboard/TeacherDashboard";
import ParentDashboard from "../components/dashboard/ParentDashboard"; // 학부모용이 있다면

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams;
  const paramRole = typeof searchParams.role === 'string' ? searchParams.role : null;

  const supabase = await createClient();

  // 1. 유저 확인
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. 역할 및 정보 확인
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // DB에 역할이 없으면 URL 파라미터(paramRole) 사용 (데모/테스트용)
  if ((!userData || !userData.role) && !paramRole) redirect('/onboarding/role');

  const role = (userData?.role || paramRole || "").toLowerCase();

  // 3. 역할에 따라 컴포넌트 분기
  if (role === 'student') {
    // 필요하다면 진단 여부 체크 로직 추가
    // if (!userData.is_setup_done) redirect('/student/diagnosis');
    return <StudentDashboard user={userData} />;
  }

  if (role === 'teacher') {
    return <TeacherDashboard user={userData} />;
  }

  if (role === 'parent') {
    // 학부모 컴포넌트가 따로 없다면 일단 선생님꺼 보여주거나, ParentDashboard를 만드세요
    return <ParentDashboard user={userData} />;
  }

  return <div>알 수 없는 사용자 역할입니다.</div>;
}