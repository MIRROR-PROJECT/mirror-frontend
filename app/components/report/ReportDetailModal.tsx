"use client";

import { X, Clock, CheckCircle2, ThermometerSun, MessageCircle, Quote, Lightbulb } from "lucide-react";
import { DailyReport } from "./types";

interface Props {
    report: DailyReport | null;
    onClose: () => void;
}

export default function ReportDetailModal({ report, onClose }: Props) {
    if (!report) return null;

    // 포맷팅 헬퍼
    const studyTimeHours = Math.floor(report.total_study_time_minutes / 60);
    const studyTimeMinutes = report.total_study_time_minutes % 60;
    const studyTimeText = `${studyTimeHours}h ${studyTimeMinutes}m`;

    // 온도에 따른 스타일 결정
    const getTempColor = (t: number) => {
        if (t >= 80) return "bg-red-50 text-red-600 border-red-100";
        if (t >= 50) return "bg-orange-50 text-orange-600 border-orange-100";
        return "bg-blue-50 text-blue-600 border-blue-100";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>

                {/* 헤더 */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <span className="text-gray-500 text-xs font-bold">{report.date} 리포트</span>
                        <h2 className="text-xl font-bold text-gray-800">나의 학습 하루</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* 본문 (스크롤) */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">

                    {/* 1. 핵심 지표 그리드 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-gray-50 rounded-2xl border flex flex-col items-center justify-center">
                            <Clock className="w-5 h-5 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500">시간</span>
                            <span className="text-lg font-bold">{studyTimeText}</span>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-2xl border flex flex-col items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mb-1" />
                            <span className="text-xs text-gray-500">달성</span>
                            <span className="text-lg font-bold">{report.achievement_rate}%</span>
                        </div>
                        <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center ${getTempColor(report.passion_temp || 36.5)}`}>
                            <ThermometerSun className="w-5 h-5 mb-1" />
                            <span className="text-xs opacity-80">열정 온도</span>
                            <span className="text-lg font-black">{report.passion_temp || 36.5}°C</span>
                        </div>
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center">
                            <MessageCircle className="w-5 h-5 mb-1" />
                            <span className="text-xs opacity-80">질문</span>
                            <span className="text-lg font-bold">{report.question_count || 0}회</span>
                        </div>
                    </div>

                    {/* 2. AI 피드백 (강조) */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-blue-100 relative">
                        <Quote className="absolute top-4 left-4 text-blue-200 w-8 h-8 -z-0" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-bold text-blue-900">AI 튜터의 피드백</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">"{report.ai_summary_title}"</h3>
                            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                {report.ai_summary}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 3. 키워드 클라우드 */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 mb-3">💭 오늘의 꽂힌 단어</h3>
                            <div className="flex flex-wrap gap-2">
                                {(report.keywords || []).map((kw, i) => (
                                    <span key={i} className="px-3 py-1 bg-white border rounded-full text-sm text-gray-600 font-medium shadow-sm">
                                        #{kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 4. 과목별 배지 */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 mb-3">📚 과목별 상태</h3>
                            <div className="space-y-2">
                                {report.subjects.map((sub, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-white border rounded-xl">
                                        <span className="text-sm font-bold text-gray-800">{sub.name}</span>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${(sub.badge || "").includes("폭발") ? "bg-red-100 text-red-600" :
                                            (sub.badge || "").includes("독학") ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                                            }`}>
                                            {sub.badge}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 닫기 (모바일용) */}
                <div className="p-4 bg-gray-50 border-t md:hidden">
                    <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">닫기</button>
                </div>
            </div>
        </div>
    );
}
