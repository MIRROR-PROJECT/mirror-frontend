// 📂 app/(main)/layout.tsx
import Sidebar from "../components/Sidebar"; // 사이드바 불러오기

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    // ⚠️ 여기엔 <html>, <body> 가 절대 있으면 안 됩니다!
    <div className="flex min-h-screen bg-gray-50">
      
      {/* 왼쪽: 사이드바 */}
      <Sidebar />

      {/* 오른쪽: 실제 페이지 내용 (dashboard, study-room 등) */}
      <div className="flex-1">
        {children}
      </div>

    </div>
  );
}