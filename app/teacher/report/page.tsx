"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Calendar, Users, Clock, TrendingUp, TrendingDown,
    CheckCircle2, AlertCircle, Brain, Target, Lightbulb,
    Award, Flame, MessageSquare, BookOpen, Activity
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

export default function TeacherReportPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [mounted, setMounted] = useState(false);
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        setMounted(true);
        const now = new Date(); // 실제로는 리포트 날짜를 받아와야 함
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        };
        const formatted = new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', options).format(now);
        setCurrentDate(formatted);
    }, [language]);

    if (!mounted) return <div className="min-h-screen bg-gray-50" />;

    // Mock Class Name - 실제로는 데이터에서 가져와야 함
    const className = language === 'ko' ? "고2 수학 심화반" : "Advanced Math Grade 11";

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-xl transition-colors border border-gray-200"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{t('teacher.report.title')}</h1>
                        <p className="text-gray-500 mt-1">
                            <span className="font-bold text-gray-900">{className}</span> · {currentDate}
                        </p>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                            <Users className="w-4 h-4" />
                            <span className="font-medium">{t('teacher.report.overview.active')}</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">9<span className="text-lg text-gray-400">/12{t('teacher.dashboard.studentCount')}</span></p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> {t('teacher.report.trend.up', { value: '2' })}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">{t('teacher.report.overview.time')}</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">2.3<span className="text-lg text-gray-400">h</span></p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> {t('teacher.report.trend.up', { value: '18%' })}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-medium">{t('teacher.report.overview.completion')}</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">68<span className="text-lg text-gray-400">%</span></p>
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" /> {t('teacher.report.trend.down', { value: '5%' })}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-medium">{t('teacher.report.overview.aiQuestions')}</span>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">77<span className="text-lg text-gray-400"></span></p>
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> {t('teacher.report.trend.up', { value: '12' })}
                        </p>
                    </div>
                </div>

                {/* Main Insights */}
                <div className="grid md:grid-cols-2 gap-6">

                    {/* 학습 분위기 */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Flame className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">{t('teacher.report.insights.atmosphere')}</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="font-bold text-blue-900 mb-2">{t('teacher.report.insights.atmosphereTitle') || "🔥 자습 열기 고조"}</p>
                                <p className="text-sm text-blue-700 leading-relaxed">
                                    {t('teacher.report.insights.atmosphereDesc')}
                                </p>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{t('teacher.report.insights.weekendParticipation')}</span>
                                <span className="font-bold text-gray-900">75%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{t('teacher.report.insights.nightStudy')}</span>
                                <span className="font-bold text-gray-900">9{t('teacher.dashboard.studentCount')}</span>
                            </div>
                        </div>
                    </div>

                    {/* 반 전체 취약점 */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">{t('teacher.report.insights.weakness')}</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-bold text-red-900 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-red-600" />
                                        {language === 'ko' ? '삼각함수 합성 (덧셈정리)' : 'Trigonometric Synthesis'}
                                    </p>
                                    <span className="text-sm font-bold text-red-600">{t('teacher.report.insights.errorRate', { rate: '73' })}</span>
                                </div>
                                <p className="text-sm text-red-700 leading-relaxed">
                                    {t('teacher.report.insights.weaknessDesc', { count: 12, badCount: 9 })}
                                </p>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">{t('teacher.report.insights.secondWeakness')}</span>
                                <span className="font-bold text-gray-900">{language === 'ko' ? '이차함수 최댓값 (58%)' : 'Quadratic Max Value (58%)'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI 추천 액션 */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-6 h-6" />
                        <h2 className="text-xl font-bold">{t('teacher.report.insights.aiStrategy')}</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/20 rounded-lg shrink-0">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold mb-2">{t('teacher.report.insights.strategy1Title')}</p>
                                    <p className="text-sm text-blue-100">
                                        {t('teacher.report.insights.strategy1Desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white/20 rounded-lg shrink-0">
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold mb-2">{t('teacher.report.insights.strategy2Title')}</p>
                                    <p className="text-sm text-blue-100">
                                        {t('teacher.report.insights.strategy2Desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 케어 필요 학생 요약 */}
                <div className="bg-white p-6 rounded-2xl border-2 border-red-200">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{t('teacher.report.care.title')} (3{t('teacher.dashboard.studentCount')})</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { name: language === 'ko' ? "김민수" : "Minsu Kim", reason: t('teacher.report.care.reason1'), urgent: true },
                            { name: language === 'ko' ? "박서준" : "Seojun Park", reason: t('teacher.report.care.reason2'), urgent: false },
                            { name: language === 'ko' ? "김태현" : "Taehyun Kim", reason: t('teacher.report.care.reason3'), urgent: true },
                        ].map((student, idx) => (
                            <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${student.urgent ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${student.urgent ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{student.name}</p>
                                        <p className={`text-xs ${student.urgent ? 'text-red-600' : 'text-yellow-600'}`}>{student.reason}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${student.urgent ? 'text-red-600 bg-red-100' : 'text-yellow-600 bg-yellow-100'}`}>
                                    {student.urgent ? t('teacher.report.care.urgent') : t('teacher.report.care.warning')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 우수 학생 */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Award className="w-5 h-5 text-green-600" />
                        <h2 className="text-lg font-bold text-gray-900">{t('teacher.report.topStudents.title')}</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                        {[
                            { name: language === 'ko' ? "정하늘" : "Haneul Jung", stats: t('teacher.report.topStudents.stats1'), reason: t('teacher.report.topStudents.reason1'), color: "green", bg: "bg-green-100", text: "text-green-600", border: "border-green-200" },
                            { name: language === 'ko' ? "이지은" : "Jieun Lee", stats: t('teacher.report.topStudents.stats2'), reason: t('teacher.report.topStudents.reason2'), color: "blue", bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
                            { name: language === 'ko' ? "김민지" : "Minji Kim", stats: t('teacher.report.topStudents.stats3'), reason: t('teacher.report.topStudents.reason3'), color: "purple", bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-200" },
                        ].map((student, idx) => (
                            <div key={idx} className={`bg-white p-4 rounded-xl border ${student.border}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-8 h-8 rounded-full ${student.bg} flex items-center justify-center font-bold ${student.text} text-sm`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <p className="font-bold text-gray-900">{student.name}</p>
                                </div>
                                <p className="text-xs text-gray-600">{student.stats}</p>
                                <p className={`text-xs ${student.text} mt-1 font-bold`}>{student.reason}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
