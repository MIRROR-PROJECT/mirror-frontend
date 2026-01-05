'use client';

import Script from "next/script";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Loader2, Lock } from "lucide-react";

const CLIENT_KEY = process.env.NEXT_PUBLIC_CLIENT_KEY!;

export default function PaymentPage() {
    const router = useRouter();
    const [price] = useState(15000);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // 1. 권한 체크
    useEffect(() => {
        const checkRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                alert("로그인이 필요합니다.");
                router.push("/login");
                return;
            }

            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', session.user.id)
                .single();

            setUser(session.user);
            setLoading(false);
        };

        checkRole();
    }, [router]);

    // 2. 결제 요청 (결제창 방식)
    const handlePay = async () => {
        if (!scriptLoaded) {
            alert("결제 시스템 로딩 중입니다.");
            return;
        }

        try {
            // @ts-ignore
            const tossPayments = window.TossPayments(CLIENT_KEY);

            await tossPayments.requestPayment("카드", {
                amount: price,
                orderId: nanoid(),
                orderName: "Mirror AI 선생님 프리미엄 플랜 (1개월)",
                customerName: user?.user_metadata?.full_name || "선생님",
                customerEmail: user?.email,
                successUrl: window.location.origin + "/payment/success",
                failUrl: window.location.origin + "/payment/fail",
            });
        } catch (error) {
            console.error("결제 요청 실패:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <>
            <Script
                src="https://js.tosspayments.com/v1/payment"
                strategy="afterInteractive"
                onLoad={() => setScriptLoaded(true)}
            />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 border-b text-center bg-indigo-600 text-white">
                        <h1 className="text-2xl font-bold mb-2">프리미엄 멤버십</h1>
                        <p className="opacity-90">학생 관리의 모든 기능을 무제한으로 이용하세요</p>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-600 font-medium">결제 금액</span>
                            <span className="text-2xl font-bold text-indigo-600">
                                {price.toLocaleString()}원 <span className="text-sm font-normal text-gray-400">/ 월</span>
                            </span>
                        </div>

                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                💳 결제 수단: 신용/체크카드
                            </p>
                        </div>

                        <button
                            onClick={handlePay}
                            disabled={!scriptLoaded}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg ${scriptLoaded
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Lock className="w-5 h-5" />
                            {scriptLoaded ? '결제하고 시작하기' : '로딩 중...'}
                        </button>

                        {/* 테스트 카드 안내 */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                                <p className="text-sm font-bold text-yellow-800 mb-2">⚠️ 개발 환경 - 테스트 결제 안내</p>
                                <p className="text-xs text-yellow-700 mb-2">
                                    실제 결제는 승인 거절됩니다. 아래 방법 중 하나를 선택하세요:
                                </p>
                                <div className="text-xs text-yellow-700 space-y-1 mb-3">
                                    <p>• <strong>테스트 카드 번호:</strong> 4000-0000-0000-0008</p>
                                    <p>• <strong>유효기간:</strong> 아무거나 (예: 12/28)</p>
                                    <p>• <strong>CVC:</strong> 아무거나 (예: 123)</p>
                                    <p>• <strong>비밀번호:</strong> 앞 2자리 아무거나 (예: 12)</p>
                                </div>
                                <p className="text-xs text-yellow-600 italic">
                                    또는 아래 "데모로 진행" 버튼을 클릭하세요 👇
                                </p>
                            </div>
                        )}

                        {/* 개발 환경 전용 데모 버튼 */}
                        {process.env.NODE_ENV === 'development' && (
                            <button
                                onClick={() => {
                                    localStorage.setItem('teacher_from_benefits', 'true');
                                    router.push('/dashboard?role=teacher');
                                }}
                                className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-3"
                            >
                                🚀 데모로 바로 시작하기 (결제 없이 체험)
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
