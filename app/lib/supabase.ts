// ✅ 중요: @supabase/supabase-js가 아니라 @supabase/ssr을 사용합니다.
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.");
}

// createClient 대신 createBrowserClient를 사용해야 PKCE(보안로그인) 흐름이 자동 적용됩니다.
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);