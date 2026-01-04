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

    // 3. DB에 유저 정보 저장 (upsert)
    // 신규 유저든 기존 유저든 기본 정보는 항상 최신화
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id', // id가 이미 있으면 업데이트
        ignoreDuplicates: false, // 중복이어도 업데이트 수행
      });

    if (upsertError) {
      console.error("❌ DB 저장 실패:", upsertError.message);
      // 저장 실패해도 일단 진행 (세션은 이미 있으므로)
    } else {
      console.log("✅ DB에 유저 정보 저장/업데이트 완료");
    }

    // 4. DB(users)에서 role 조회
    const { data: userProfile, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      // PGRST116은 '데이터 없음' 에러이므로 신규 유저로 취급하면 되지만, 그 외에는 진짜 DB 에러임
      console.error("❌ DB 조회 에러:", dbError.message);
    }

    console.log("🔹 조회된 프로필:", userProfile);

    // 4. 조건별 이동
    if (!userProfile || !userProfile.role) {
      console.log("🚀 결론: 신규 유저 -> /onboarding/role 이동");
      return NextResponse.redirect(`${origin}/onboarding/role`);
    }

    const role = userProfile.role.toLowerCase();

    console.log(`🚀 결론: 기존 유저(${role}) -> /dashboard로 이동`);

    // 모든 역할을 /dashboard로 보내고, dashboard 페이지에서 역할별 분기 처리
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // 코드가 없는 경우
  console.error("❌ Code 파라미터가 URL에 없습니다.");
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
}