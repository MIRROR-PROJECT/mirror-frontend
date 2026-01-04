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
    // [NEW] 학생의 경우: 오늘의 미션이 있는지 체크
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (accessToken) {
        const missionResponse = await fetch('https://mirror-backend-5j11.onrender.com/my/missions/today', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store' // 서버 컴포넌트에서 캐시 방지
        });

        if (missionResponse.ok) {
          const missionData = await missionResponse.json();

          // 미션이 없거나 schedule이 비어있으면 진단 페이지로
          if (!missionData.success || !missionData.data?.schedule || missionData.data.schedule.length === 0) {
            console.log('📋 [Dashboard] 오늘의 미션 없음 -> /student/diagnosis로 리다이렉트');
            redirect('/student/diagnosis');
          }

          console.log('✅ [Dashboard] 오늘의 미션 있음 -> 대시보드 표시');
        } else {
          // API 에러 시에도 진단 페이지로
          console.log('❌ [Dashboard] 미션 API 에러 -> /student/diagnosis로 리다이렉트');
          redirect('/student/diagnosis');
        }
      }
    } catch (error) {
      console.error('❌ [Dashboard] 미션 체크 에러:', error);
      // 에러 발생 시에도 진단 페이지로
      redirect('/student/diagnosis');
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