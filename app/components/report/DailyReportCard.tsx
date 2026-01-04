"use client";

import { DailyReport } from "./types";
import { Clock, CheckCircle2, Brain, ChevronRight } from "lucide-react";

interface DailyReportCardProps {
    report: DailyReport;
    onClick?: () => void;
    showUserName?: boolean; // 강사용
}

export default function DailyReportCard({
    report,
    onClick,
    showUserName = false
}: DailyReportCardProps) {
    const studyTimeHours = Math.floor(report.total_study_time_minutes / 60);
    const studyTimeMinutes = report.total_study_time_minutes % 60;
    const studyTimeText = `${studyTimeHours}시간 ${studyTimeMinutes}분`;

    return (
        <div
            onClick={onClick}
            className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col md:flex-row gap-6"
        >
            {/* 왼쪽: 날짜 및 성취도 */}
            <div className="md:w-48 flex flex-col justify-between shrink-0 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                <div>
                    {showUserName && (
                        <p className="text-sm font-bold text-gray-700 mb-1">{report.user_name}</p>
                    )}
                    <span className="text-sm font-medium text-gray-400">{report.day_of_week}</span>
                    <p className="text-xl font-bold text-gray-900">{report.date}</p>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>성취도</span>
                        <span className="font-bold text-blue-600">{report.achievement_rate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full rounded-full ${report.achievement_rate >= 80 ? 'bg-blue-500' :
                                report.achievement_rate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                                }`}
                            style={{ width: `${report.achievement_rate}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* 오른쪽: 상세 내용 */}
            <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">
                                {report.completed_tasks}/{report.total_tasks} 과제 완료
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                            {report.subjects.map((sub, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                                    {sub.name} {sub.completed_missions}/{sub.total_missions}
                                </span>
                            ))}
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-md font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {studyTimeText}
                            </span>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 shrink-0" />
                </div>

                {/* AI 피드백 영역 */}
                <div className="bg-gray-50 rounded-xl p-4 mt-2 flex gap-3">
                    <div className="shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-sm shadow-sm">
                            🤖
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 mb-1 flex items-center gap-1">
                            <Brain className="w-3 h-3" /> AI 튜터의 코멘트
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {report.ai_summary}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
