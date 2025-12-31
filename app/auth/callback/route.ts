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

    // 3. DB(users) 조회
    // ⚠️ 중요: users 테이블이 없으면 여기서 에러가 날 수 있습니다.
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

    console.log(`🚀 결론: 기존 유저(${role}) -> 대시보드로 이동`);
      
    // 이제 role 변수는 무조건 소문자이므로 안전합니다.
    const targetPath = role === 'student' ? '/student/diagnosis' : `/${role}/dashboard`;
        
    return NextResponse.redirect(`${origin}${targetPath}`);
  }

  // 코드가 없는 경우
  console.error("❌ Code 파라미터가 URL에 없습니다.");
  return NextResponse.redirect(`${origin}/login?error=no_code_provided`);
}