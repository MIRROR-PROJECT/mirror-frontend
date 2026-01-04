'use client'

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    useEffect(() => {
        const confirmPayment = async () => {
            try {
                // [TODO] 백엔드 URL을 환경변수로 관리하거나 실제 배포 URL로 변경 필요
                const response = await fetch("https://mirror-backend-5j11.onrender.com/api/payment/confirm", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ paymentKey, orderId, amount }),
                });

                if (response.ok) {
                    // 결제 성공
                    setTimeout(() => {
                        alert("결제가 성공적으로 완료되었습니다! 선생님 기능을 시작합니다.");
                        router.push("/dashboard");
                    }, 1000);
                } else {
                    // 백엔드 승인 실패
                    const errData = await response.json();
                    router.push(`/payment/fail?message=${errData.message || "승인 거절됨"}`);
                }
            } catch (error) {
                console.error("Payment Confirmation Error:", error);
                router.push("/payment/fail?message=네트워크 오류가 발생했습니다.");
            }
        };

        if (paymentKey && orderId && amount) {
            confirmPayment();
        }
    }, [paymentKey, orderId, amount, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <h2 className="text-xl font-bold text-gray-800">결제 승인 중입니다...</h2>
            <p className="text-gray-500">잠시만 기다려주세요.</p>
        </div>
    );
}
