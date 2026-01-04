// app/page.tsx
import { createClient } from "./utils/supabase/server";
import { redirect } from "next/navigation";
import LandingPage from "./components/LandingPage";

export default async function Home() {
  const supabase = await createClient();

  // 1. 세션 확인
  const { data: { user } } = await supabase.auth.getUser();

  // 2. 로그인된 유저라면 DB 조회
  if (user) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // ✅ [수정됨] 오직 'role'이 있을 때만 대시보드로 납치합니다.
    // role이 없으면 if문을 빠져나가서 아래의 LandingPage를 렌더링합니다.
    if (userProfile?.role) {
      redirect('/dashboard');
    }
  }

  // 3. 비로그인 상태이거나, 로그인은 했지만 Role이 없는 경우 -> 랜딩 페이지 표시
  return <LandingPage />;
}