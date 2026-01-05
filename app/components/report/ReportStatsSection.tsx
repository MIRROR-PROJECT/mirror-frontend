"use client";

import { ReportStats } from "./types";
import { Calendar, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";

interface ReportStatsProps {
    stats: ReportStats;
}

export default function ReportStatsSection({ stats }: ReportStatsProps) {
    const { t } = useLanguage();
    const avgHours = Math.floor(stats.average_study_time_minutes / 60);
    const avgMinutes = stats.average_study_time_minutes % 60;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
                icon={Calendar}
                label={t('report.totalStudyDays')}
                value={`${stats.total_study_days}${t('common.loading').includes('...') ? '일' : ' days'}`}
                desc={t('report.stats.thisMonthConsistent')}
                color="bg-blue-50 text-blue-600"
            />
            <StatCard
                icon={Clock}
                label={t('report.avgStudyTime')}
                value={`${avgHours}h ${avgMinutes}m`}
                desc={t('report.stats.increasedFromLastWeek')}
                color="bg-purple-50 text-purple-600"
            />
            <StatCard
                icon={TrendingUp}
                label={t('report.avgAchievement')}
                value={`${stats.average_achievement_rate}%`}
                desc={t('report.stats.topPace')}
                color="bg-green-50 text-green-600"
            />
            <StatCard
                icon={CheckCircle2}
                label={t('report.totalCompleted')}
                value={`${stats.total_completed_tasks}${t('common.loading').includes('...') ? '개' : ''}`}
                desc={t('report.stats.veryHardWorking')}
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
