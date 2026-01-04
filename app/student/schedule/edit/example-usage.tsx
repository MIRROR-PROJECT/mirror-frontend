// 사용 예시 - 시간표 수정 페이지에서 사용

"use client";

import { useState } from "react";
import RoutineRegeneration from "@/app/components/RoutineRegeneration";

export default function ScheduleEditPage() {
    const [routines, setRoutines] = useState([
        {
            day_of_week: "MON" as const,
            start_time: "10:00",
            end_time: "12:00",
            total_minutes: 120
        },
        {
            day_of_week: "TUE" as const,
            start_time: "14:00",
            end_time: "16:00",
            total_minutes: 120
        }
    ]);

    const handleSuccess = (data: any) => {
        console.log("재조정 성공!", data);
        // 성공 후 처리 (예: 페이지 새로고침, 상태 업데이트 등)
        window.location.reload(); // 또는 상태 업데이트
    };

    const handleError = (error: string) => {
        console.error("재조정 실패:", error);
        alert(error);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">시간표 수정</h1>

                {/* 시간표 편집 UI */}
                <div className="bg-white rounded-xl p-6 mb-6">
                    {/* 여기에 시간표 편집 폼 */}
                    <p className="text-gray-600">시간표 편집 폼...</p>
                </div>

                {/* 재조정 버튼 */}
                <div className="flex justify-end">
                    <RoutineRegeneration
                        userId="user-uuid-here" // 실제 사용자 ID
                        routines={routines}
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                </div>
            </div>
        </div>
    );
}
