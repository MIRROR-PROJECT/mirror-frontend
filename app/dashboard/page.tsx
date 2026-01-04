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

  // 4. 학생인 경우: 백엔드 진단 완료 여부 체크
  if (role === 'student') {
    let shouldRedirectToOnboarding = false;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (accessToken) {
        // 백엔드에서 진단 완료 여부 확인
        const diagnosisCheckResponse = await fetch('https://mirror-backend-5j11.onrender.com/setup/basic-info', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        let isDiagnosisCompleted = false;
        if (diagnosisCheckResponse.ok) {
          const diagnosisData = await diagnosisCheckResponse.json();
          isDiagnosisCompleted = diagnosisData.success && diagnosisData.data !== null;
          console.log('🔍 [Dashboard] 백엔드 진단 완료 여부:', isDiagnosisCompleted);
        }

        // 진단을 완료하지 않았으면 플래그 설정
        if (!isDiagnosisCompleted) {
          console.log('📋 [Dashboard] 백엔드 진단 미완료 -> 리다이렉트 플래그 설정');
          shouldRedirectToOnboarding = true;
        } else {
          console.log('✅ [Dashboard] 진단 완료 확인 -> 대시보드 표시');
        }
      } else {
        shouldRedirectToOnboarding = true;
      }
    } catch (error) {
      console.error('❌ [Dashboard] 진단 체크 에러:', error);
      shouldRedirectToOnboarding = true;
    }

    // try-catch 밖에서 리다이렉트 (에러 무한 루프 방지)
    if (shouldRedirectToOnboarding) {
      console.log('🔄 [Dashboard] /onboarding/role로 리다이렉트 실행');
      redirect('/onboarding/role');
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
