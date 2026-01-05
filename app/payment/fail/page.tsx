'use client'

import { Suspense } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

function FailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t } = useLanguage();

    const message = searchParams.get("message") || searchParams.get("failReason") || "알 수 없는 오류";
    const code = searchParams.get("code");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('payment.failedTitle')}</h1>
                <p className="text-gray-500 mb-6 word-break-keep">
                    {message}
                    {code && <span className="block text-xs mt-1 text-gray-400">{t('payment.code')}: {code}</span>}
                </p>

                <button
                    onClick={() => router.push("/payment")}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" /> {t('payment.retry')}
                </button>
            </div>
        </div>
    );
}

export default function FailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FailContent />
        </Suspense>
    );
}
