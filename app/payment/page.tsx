'use client';

import { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, PaymentWidgetInstance } from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { Loader2, Lock } from "lucide-react";

const CLIENT_KEY = "test_ck_yZqmkKeP8gpMQWleqavB3bQRxB9l"; // [TODO] Env variable로 이동 권장

export default function PaymentPage() {
    const router = useRouter();
    const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
    const [price] = useState(15000);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // 1. 권한 체크 (선생님만 접근 가능)
    useEffect(() => {
        const checkRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                alert("로그인이 필요합니다.");
                router.push("/login"); // router 사용 확인
                return;
            }

            // DB에서 Role 확인
            const { data: userData } = await supabase
                .from('users')
                .select('role, user_metadata')
                .eq('id', session.user.id)
                .single();

            // [TEST] 테스트를 위해 임시로 역할 체크 로직 주석 처리
            /*
            if (userData?.role !== 'TEACHER') { // 대문자로 저장했으므로 대문자 체크
              alert("학원 선생님만 이용 가능한 페이지입니다.");
              router.push("/dashboard"); 
              return;
            }
            */

            setUser(session.user);
            setLoading(false);
        };

        checkRole();
    }, [router]);

    // 2. 토스 결제 위젯 로드
    useEffect(() => {
        if (!user || loading) return;

        (async () => {
            const paymentWidget = await loadPaymentWidget(
                CLIENT_KEY,
                user.id // 유저 ID (CustomerKey)
            );

            paymentWidget.renderPaymentMethods("#payment-method", { value: price });
            paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });

            paymentWidgetRef.current = paymentWidget;
        })();
    }, [user, loading, price]);

    const handlePaymentRequest = async () => {
        try {
            await paymentWidgetRef.current?.requestPayment({
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

                    {/* 토스 위젯 렌더링 영역 */}
                    <div id="payment-method" className="my-4" />
                    <div id="agreement" className="mb-4" />

                    <button
                        onClick={handlePaymentRequest}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Lock className="w-5 h-5" /> 결제하고 시작하기
                    </button>
                </div>
            </div>
        </div>
    );
}
