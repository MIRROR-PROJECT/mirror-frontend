"use client";

import { DailyReport } from "./types";
import { Clock, TrendingUp, AlertCircle } from "lucide-react";

interface StudentReportCardProps {
    report: DailyReport;
    onClick?: () => void;
}

export default function StudentReportCard({ report, onClick }: StudentReportCardProps) {
    const studyTimeHours = Math.floor(report.total_study_time_minutes / 60);
    const studyTimeMinutes = report.total_study_time_minutes % 60;

    // 성취도에 따른 색상
    const getAchievementColor = (rate: number) => {
        if (rate >= 80) return "border-green-200 bg-green-50";
        if (rate >= 60) return "border-yellow-200 bg-yellow-50";
        return "border-red-200 bg-red-50";
    };

    const getAchievementBadgeColor = (rate: number) => {
        if (rate >= 80) return "bg-green-500";
        if (rate >= 60) return "bg-yellow-400";
        return "bg-red-400";
    };

    return (
        <div
            onClick={onClick}
            className={`group cursor-pointer rounded-2xl p-5 border-2 transition-all hover:shadow-lg ${getAchievementColor(report.achievement_rate)}`}
        >
            {/* 학생 이름 + 성취도 배지 */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{report.user_name}</h3>
                <div className={`px-3 py-1 rounded-full ${getAchievementBadgeColor(report.achievement_rate)} text-white text-sm font-bold`}>
                    {report.achievement_rate}%
                </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                        {studyTimeHours}h {studyTimeMinutes}m
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                        {report.completed_tasks}/{report.total_tasks} 완료
                    </span>
                </div>
            </div>

            {/* 과목 태그 */}
            <div className="flex flex-wrap gap-1">
                {report.subjects.slice(0, 3).map((sub, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white/80 text-gray-600 text-xs rounded-md font-medium">
                        {sub.name}
                    </span>
                ))}
                {report.subjects.length > 3 && (
                    <span className="px-2 py-0.5 bg-white/80 text-gray-500 text-xs rounded-md">
                        +{report.subjects.length - 3}
                    </span>
                )}
            </div>

            {/* 집중도 경고 (낮을 경우) */}
            {report.focus_score !== undefined && report.focus_score < 60 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-orange-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>집중도 낮음 ({report.focus_score}점)</span>
                </div>
            )}
        </div>
    );
}
