"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart2 } from "lucide-react";
import DailyReportCard from "@/app/components/report/DailyReportCard";
import ReportStatsSection from "@/app/components/report/ReportStatsSection";
import ReportDetailModal from "@/app/components/report/ReportDetailModal";
import { DailyReport } from "@/app/components/report/types";
import { useLanguage } from "@/app/context/LanguageContext";
import { generateMockReports } from "@/app/lib/mockReportData";

export default function StudentReportPage() {
  const { t, language } = useLanguage();
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [dateFilter, setDateFilter] = useState<"7days" | "30days" | "all">("30days");

  // 더미 데이터 생성 (언어에 맞춰)
  const allReports = useMemo(() => generateMockReports(30, language as 'ko' | 'en'), [language]);

  // 날짜 필터 적용
  const filteredReports = useMemo(() => {
    if (dateFilter === "7days") return allReports.slice(0, 7);
    if (dateFilter === "30days") return allReports.slice(0, 30);
    return allReports;
  }, [allReports, dateFilter]);

  // 통계 계산
  const stats = useMemo(() => {
    if (allReports.length === 0) {
      return {
        total_study_days: 0,
        average_study_time_minutes: 0,
        average_achievement_rate: 0,
        total_completed_tasks: 0
      };
    }

    const totalStudyTime = allReports.reduce((sum, r) => sum + r.total_study_time_minutes, 0);
    const totalAchievementRate = allReports.reduce((sum, r) => sum + r.achievement_rate, 0);
    const totalCompletedTasks = allReports.reduce((sum, r) => sum + r.completed_tasks, 0);

    return {
      total_study_days: allReports.length,
      average_study_time_minutes: Math.round(totalStudyTime / allReports.length),
      average_achievement_rate: Math.round(totalAchievementRate / allReports.length),
      total_completed_tasks: totalCompletedTasks
    };
  }, [allReports]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4 animate-fade-in pb-20 bg-gray-50 min-h-screen">

      {/* 1. 페이지 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-7 h-7 text-blue-600" />
          학습 리포트
        </h1>
        <p className="text-gray-500 mt-2">
          나의 공부 진척도와 AI 튜터의 피드백을 모아보세요.
        </p>
      </div>

      {/* 2. 상단 요약 스탯 */}
      <ReportStatsSection stats={stats} />

      {/* 3. 날짜 필터 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">{t('parent.report.recentReports')}</h2>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          {(["7days", "30days", "all"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${dateFilter === filter
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {filter === "7days" ? (language === 'ko' ? '7일' : '7 days') : filter === "30days" ? (language === 'ko' ? '30일' : '30 days') : t('parent.report.filterAll')}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 리포트 리스트 */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <p className="text-gray-500 font-medium">{t('report.noReports')}</p>
          <p className="text-gray-400 text-sm mt-2">{t('report.noReportsHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => (
            <DailyReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
            />
          ))}
        </div>
      )}

      {/* 5. 상세 보기 모달 */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}

// 헬퍼 함수들
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getDayOfWeek(dateStr: string): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(dateStr);
  return days[date.getDay()];
}

function calculateCompletedTasks(subjectDetails: any[]): number {
  if (!subjectDetails) return 0;
  return subjectDetails.filter(s => s.mission_achievement_rate >= 100).length;
}

function formatSubjects(subjectDetails: any[]): any[] {
  if (!subjectDetails) return [];

  return subjectDetails.map(s => ({
    name: s.subject_name,
    completed_missions: Math.round(s.mission_achievement_rate / 100),
    total_missions: 1,
    chat_count: s.question_count || 0,
    badge: s.mission_achievement_rate >= 100 ? '✅' : s.mission_achievement_rate >= 50 ? '🏃‍♂️' : '📝'
  }));
}