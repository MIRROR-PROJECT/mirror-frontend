"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/app/lib/supabase";

// API 타입 정의
interface Routine {
    day_of_week: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
    start_time: string; // "HH:MM"
    end_time: string; // "HH:MM"
    total_minutes: number;
}

interface RegeneratedPlan {
    plan_id: string;
    plan_date: string;
    day_of_week: string;
    affected: boolean;
    status: "regenerated" | "unchanged" | "failed";
    tasks_count: number;
    total_minutes: number;
    changes?: {
        old_tasks_count: number;
        new_tasks_count: number;
        old_minutes: number;
        new_minutes: number;
    } | null;
    error_message?: string | null;
}

interface RegenerationResponse {
    success: boolean;
    code: number;
    message: string;
    data: {
        updated_routine_ids: string[];
        deleted_count: number;
        regenerated_plans: RegeneratedPlan[];
        summary: {
            total_plans: number;
            regenerated: number;
            unchanged: number;
            failed: number;
        };
    } | null;
}

interface RoutineRegenerationProps {
    userId: string;
    routines: Routine[];
    onSuccess?: (data: RegenerationResponse["data"]) => void;
    onError?: (error: string) => void;
}

export default function RoutineRegeneration({
    userId,
    routines,
    onSuccess,
    onError,
}: RoutineRegenerationProps) {
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<RegenerationResponse["data"] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleRegenerate = async () => {
        console.group("🔄 [Routine Regeneration]");
        setIsRegenerating(true);
        setProgress(0);
        setError(null);
        setResult(null);

        try {
            // 1. 토큰 가져오기
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error("인증 토큰이 없습니다.");
            }

            setProgress(10);

            // 2. API 호출 (명세서: PATCH /routines)
            console.log("📡 [API] 서버로 PATCH 요청 전송...");
            console.log("📦 [Request Body]:", { user_id: userId, routines, regenerate_plans: true });

            const res = await fetch("https://mirror-backend-5j11.onrender.com/routines", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    routines: routines,
                    regenerate_plans: true
                })
            });

            setProgress(50);

            console.log(`📥 [API] 응답 상태 코드: ${res.status}`);

            // 3. 응답 파싱
            const json: RegenerationResponse | any = await res.json();
            console.log("📦 [Res] 서버 응답 데이터:", json);

            setProgress(80);

            // 4. 에러 처리
            if (!json.success) {
                const errorMsg = json.message || "루틴 재조정에 실패했습니다.";
                console.error(`❌ [${json.code}] ${errorMsg}`);
                setError(errorMsg);
                onError?.(errorMsg);
                return;
            }

            // 5. 성공 처리
            if (json.success && json.data) {
                console.log(`✅ [Success] ${json.message}`);
                console.log(`📊 [Summary]:`, json.data.summary);
                setProgress(100);
                setResult(json.data);
                onSuccess?.(json.data);

                // 3초 후 모달 자동 닫기
                setTimeout(() => {
                    setIsRegenerating(false);
                }, 3000);
            }

        } catch (error) {
            console.error("❌ [Error] 네트워크 오류 또는 예외 발생:", error);
            const errorMsg = error instanceof Error ? error.message : "네트워크 오류가 발생했습니다.";
            setError(errorMsg);
            onError?.(errorMsg);
        } finally {
            console.groupEnd();
        }
    };

    return (
        <>
            {/* 재조정 버튼 */}
            <button
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                AI 학습 계획 재조정
            </button>

            {/* 로딩 모달 */}
            {isRegenerating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        {/* 아이콘 */}
                        <div className="flex justify-center mb-6">
                            {error ? (
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                    <XCircle className="w-10 h-10 text-red-600" />
                                </div>
                            ) : result ? (
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                            ) : (
                                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                </div>
                            )}
                        </div>

                        {/* 메시지 */}
                        <div className="text-center mb-6">
                            {error ? (
                                <>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">재조정 실패</h3>
                                    <p className="text-gray-600 text-sm">{error}</p>
                                </>
                            ) : result ? (
                                <>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">재조정 완료! 🎉</h3>
                                    <p className="text-gray-600 text-sm mb-4">AI가 학습 계획을 성공적으로 재조정했습니다.</p>

                                    {/* 통계 요약 */}
                                    <div className="bg-gray-50 rounded-xl p-4 text-left">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-500">전체 계획</span>
                                                <p className="font-bold text-gray-900">{result.summary.total_plans}개</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">재생성</span>
                                                <p className="font-bold text-indigo-600">{result.summary.regenerated}개</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">유지</span>
                                                <p className="font-bold text-gray-600">{result.summary.unchanged}개</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">실패</span>
                                                <p className="font-bold text-red-600">{result.summary.failed}개</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI가 학습 계획을 재조정하고 있어요...</h3>
                                    <p className="text-gray-500 text-sm">잠시만 기다려주세요 (약 10-30초 소요)</p>
                                </>
                            )}
                        </div>

                        {/* 프로그레스 바 */}
                        {!error && !result && (
                            <div className="mb-6">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-center text-xs text-gray-400 mt-2">{progress}%</p>
                            </div>
                        )}

                        {/* 버튼 */}
                        {(error || result) && (
                            <button
                                onClick={() => {
                                    setIsRegenerating(false);
                                    setError(null);
                                    setResult(null);
                                    setProgress(0);
                                }}
                                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                            >
                                닫기
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
