import { NextResponse } from 'next/server';
import { createClient } from '../../utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  // 0. 로그 찍어보기 (가장 중요)
  console.log("----------------------------------------");
  console.log("🔹 [Callback 진입] URL:", request.url);
  console.log("🔹 Code 값:", code ? "있음 (OK)" : "없음 (문제발생)");

  if (errorParam) {
    console.error("❌ 구글이 에러를 보냈습니다:", errorParam, searchParams.get('error_description'));
    return NextResponse.redirect(`${origin}/login?error=${errorParam}`);
  }

  if (code) {
    const supabase = await createClient();

    // 1. 세션 교환 시도
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

    if (sessionError) {
      console.error("❌ 세션 교환 실패:", sessionError.message);
      return NextResponse.redirect(`${origin}/login?error=session_exchange_fail`);
    }

    console.log("✅ 세션 교환 성공! 유저 정보 조회 중...");

    // 2. 유저 정보 조회
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("❌ 유저 정보 없음:", userError?.message);
      return NextResponse.redirect(`${origin}/login?error=no_user_found`);
    }

    // 3. 백엔드 DB에 유저 정보 동기화 (FastAPI)
    // Supabase Auth 사용자를 FastAPI DB에 등록
    console.log("🔄 [Backend Sync] FastAPI DB에 사용자 동기화 시작...");
    console.log("   - User ID:", user.id);
    console.log("   - Email:", user.email);
    console.log("   - Name:", user.user_metadata?.full_name || user.email?.split('@')[0]);

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (!currentSession?.access_token) {
        console.error("❌ [Backend Sync] 세션 토큰이 없습니다.");
        // 토큰이 없어도 일단 진행 (온보딩으로 이동)
      } else {
        const syncResponse = await fetch("https://mirror-backend-5j11.onrender.com/auth/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentSession.access_token}`
          },
          body: JSON.stringify({
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email
          })
        });

        console.log(`📥 [Backend Sync] 응답 상태: ${syncResponse.status}`);

        if (syncResponse.ok) {
          const syncData = await syncResponse.json();
          console.log("✅ [Backend Sync] FastAPI DB 동기화 완료:", syncData);
        } else {
          const errorData = await syncResponse.json();
          console.error("❌ [Backend Sync] 동기화 실패:", errorData);
          // 실패해도 일단 진행 (온보딩으로 이동)
        }
      }
    } catch (syncError) {
      console.error("❌ [Backend Sync] 네트워크 오류:", syncError);
      // 에러가 나도 일단 진행 (온보딩으로 이동)
    }

    // 4. 백엔드 DB에서 role 조회 (나중에 구현 예정)
    // 현재는 Supabase를 사용하지 않고 바로 온보딩으로 이동
    console.log("🚀 결론: 신규 유저 -> /onboarding/role 이동");
    return NextResponse.redirect(`${origin}/onboarding/role`);
  }

  // 코드가 없는 경우
  console.error("❌ Code 파라미터가 URL에 없습니다.");
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
}