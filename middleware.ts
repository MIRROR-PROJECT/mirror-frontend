import { type NextRequest } from 'next/server'
import { updateSession } from './app/utils/middleware/server' // 경로 주의!

export async function middleware(request: NextRequest) {
  // 위에서 만든 updateSession 함수 실행
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 다음 경로들을 제외하고 모든 경로에서 미들웨어 실행:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     * - 이미지 파일들 (svg, png, jpg 등)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}