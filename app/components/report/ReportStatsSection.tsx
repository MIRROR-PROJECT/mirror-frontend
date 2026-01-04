"use client";

import { ReportStats } from "./types";
import { Calendar, Clock, TrendingUp, CheckCircle2 } from "lucide-react";

interface ReportStatsProps {
    stats: ReportStats;
}

export default function ReportStatsSection({ stats }: ReportStatsProps) {
    const avgHours = Math.floor(stats.average_study_time_minutes / 60);
    const avgMinutes = stats.average_study_time_minutes % 60;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
                icon={Calendar}
                label="총 학습 일수"
                value={`${stats.total_study_days}일`}
                desc="이번 달 꾸준히 했어요!"
                color="bg-blue-50 text-blue-600"
            />
            <StatCard
                icon={Clock}
                label="평균 학습 시간"
                value={`${avgHours}h ${avgMinutes}m`}
                desc="지난주보다 30분 늘었어요"
                color="bg-purple-50 text-purple-600"
            />
            <StatCard
                icon={TrendingUp}
                label="평균 성취도"
                value={`${stats.average_achievement_rate}%`}
                desc="상위 15% 페이스예요"
                color="bg-green-50 text-green-600"
            />
            <StatCard
                icon={CheckCircle2}
                label="완료한 과제"
                value={`${stats.total_completed_tasks}개`}
                desc="정말 열심히 했어요!"
                color="bg-orange-50 text-orange-600"
            />
        </div>
    );
}

function StatCard({ icon: Icon, label, value, desc, color }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
                <p className="text-xs text-gray-400 mt-1">{desc}</p>
            </div>
        </div>
    );
}
